/**
 * Manual end-to-end verification of the social publishing pipeline.
 *
 * ⚠️  This publishes REAL posts to the connected Instagram and Facebook
 * accounts. It is intentionally NOT part of `pnpm test`. Run it explicitly:
 *
 *   pnpm --filter @mr/tools verify-social-publish
 *
 * It will prompt for confirmation. In non-interactive shells, set
 * CONFIRM_PUBLISH=PUBLISH to proceed.
 *
 * Flow: enqueue Remotion renders -> drive the video worker to render + upload to
 * R2 -> create one publication per post type -> drive the social worker to
 * publish through Postiz -> report the per-target result.
 *
 * Env is loaded BEFORE any @mr/db import so the postgres client initializes with
 * the right DATABASE_URL (ESM hoists static imports, so the DB modules are
 * dynamically imported after loadEnv).
 */
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import * as p from "@clack/prompts";

const rootEnvLocalPath = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const packageEnvLocalPath = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const packageEnvPath = fileURLToPath(new URL("../.env", import.meta.url));

loadEnv({
  path: [packageEnvLocalPath, packageEnvPath, rootEnvLocalPath, rootEnvPath],
});

for (const key of ["DATABASE_URL", "POSTIZ_API_KEY"]) {
  if (!process.env[key]) throw new Error(`${key} is required.`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

p.intro("Verificación de publicación social");
p.log.warn(
  "⚠️  Esto publicará posts REALES en Instagram y Facebook:\n" +
    "   • Feed (imagen)  → Instagram + Facebook\n" +
    "   • Reel (vídeo)   → Instagram + Facebook\n" +
    "   • Story (imagen) → Instagram",
);

if (process.env.CONFIRM_PUBLISH !== "PUBLISH") {
  if (!process.stdin.isTTY) {
    p.cancel(
      "Shell no interactivo. Define CONFIRM_PUBLISH=PUBLISH para continuar.",
    );
    process.exit(1);
  }
  const ok = await p.confirm({ message: "¿Publicar posts reales ahora?" });
  if (p.isCancel(ok) || !ok) {
    p.cancel("Cancelado. No se publicó nada.");
    process.exit(0);
  }
}

// Import DB + workers only after env is loaded.
const {
  createSocialPost,
  enqueueVideoGenerationJob,
  getSocialPost,
  getVideoGenerationJob,
} = await import("@mr/db");
const { getVideoWorkerConfig } = await import("@mr/video-worker/config");
const { processNextVideoJob } = await import("@mr/video-worker/worker");
const { getSocialWorkerConfig } = await import("@mr/social-worker/config");
const { processNextSocialPost } = await import("@mr/social-worker/worker");

const TERMINAL = new Set(["succeeded", "failed", "cancelled"]);

async function drainRenders(jobIds: string[]) {
  const config = getVideoWorkerConfig();
  for (let i = 0; i < 30; i += 1) {
    const jobs = await Promise.all(jobIds.map(getVideoGenerationJob));
    if (jobs.every((job) => job && TERMINAL.has(job.status))) return;
    const processed = await processNextVideoJob({ config });
    if (!processed) await sleep(1000);
  }
}

async function drainPublishing() {
  const config = getSocialWorkerConfig();
  for (let i = 0; i < 60; i += 1) {
    const processed = await processNextSocialPost({ config });
    if (!processed) return;
  }
}

// 1) Enqueue real Remotion renders.
const renderSpinner = p.spinner();
renderSpinner.start("Renderizando media con el video worker…");

const imageJob = await enqueueVideoGenerationJob({
  templateId: "result-card",
  kind: "image",
  inputProps: {
    homeTeam: "Redondela",
    awayTeam: "A Xunqueira",
    homeScore: 2,
    awayScore: 1,
    category: "Senior",
  },
});
const videoJob = await enqueueVideoGenerationJob({
  templateId: "hello-world",
  kind: "video",
  inputProps: { title: "Mundialito Redondela" },
});

if (!imageJob || !videoJob) {
  renderSpinner.stop("No se pudieron encolar los renders.");
  process.exit(1);
}

await drainRenders([imageJob.id, videoJob.id]);

const renderedImage = await getVideoGenerationJob(imageJob.id);
const renderedVideo = await getVideoGenerationJob(videoJob.id);

if (
  renderedImage?.status !== "succeeded" ||
  renderedVideo?.status !== "succeeded"
) {
  renderSpinner.stop("Fallo al renderizar media.");
  p.log.error(
    `imagen=${renderedImage?.status ?? "?"} (${renderedImage?.errorMessage ?? "-"})\n` +
      `vídeo=${renderedVideo?.status ?? "?"} (${renderedVideo?.errorMessage ?? "-"})`,
  );
  process.exit(1);
}

renderSpinner.stop("Media renderizada y subida a R2.");
p.log.info(`imagen: ${renderedImage.outputPath ?? "-"}`);
p.log.info(`vídeo:  ${renderedVideo.outputPath ?? "-"}`);

// 2) Create one publication per post type, scheduled in the past so it is due.
// Stories are tested as both an image and a video.
const scheduledAt = new Date(Date.now() - 60_000);

const specs = [
  {
    label: "Feed (imagen)",
    postType: "feed" as const,
    mediaKind: "image" as const,
    platforms: ["instagram", "facebook"] as const,
    jobId: imageJob.id,
  },
  {
    label: "Reel (vídeo)",
    postType: "reel" as const,
    mediaKind: "video" as const,
    platforms: ["instagram", "facebook"] as const,
    jobId: videoJob.id,
  },
  {
    label: "Story imagen",
    postType: "story" as const,
    mediaKind: "image" as const,
    platforms: ["instagram"] as const,
    jobId: imageJob.id,
  },
  {
    label: "Story vídeo",
    postType: "story" as const,
    mediaKind: "video" as const,
    platforms: ["instagram"] as const,
    jobId: videoJob.id,
  },
];

const created = [];
for (const spec of specs) {
  const result = await createSocialPost({
    postType: spec.postType,
    mediaKind: spec.mediaKind,
    caption: `✅ Verificación · ${spec.label}`,
    scheduledAt,
    platforms: [...spec.platforms],
    videoJobId: spec.jobId,
  });
  created.push({ label: spec.label, postId: result.post.id });
}

// 3) Drive the social worker to publish through Postiz.
const publishSpinner = p.spinner();
publishSpinner.start("Publicando en Postiz…");
await drainPublishing();
publishSpinner.stop("Publicación procesada.");

// 4) Report per-target outcome.
let anyFailed = false;

for (const item of created) {
  const post = await getSocialPost(item.postId);
  if (!post) continue;
  p.log.message(`\n${item.label}`);
  for (const target of post.targets) {
    const ok = target.status === "published";
    if (!ok) anyFailed = true;
    p.log.message(
      `  ${ok ? "✅" : "❌"} ${target.platform.padEnd(10)} ${target.status}` +
        (target.providerPostId ? `  id=${target.providerPostId}` : "") +
        (target.errorMessage ? `  ${target.errorMessage}` : ""),
    );
  }
}

if (anyFailed) {
  p.outro("Verificación completada con fallos. Revisa los errores arriba.");
  process.exit(1);
}

p.outro("Verificación completada: todo publicado correctamente.");
process.exit(0);
