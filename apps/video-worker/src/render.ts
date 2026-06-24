import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import type { VideoGenerationJob } from "@mr/db";
import type { S3StorageConfig } from "./config";
import { createS3Client, uploadRenderedFile } from "./storage";

export type RenderableGenerationJob = Pick<
  VideoGenerationJob,
  "id" | "templateId" | "kind" | "inputProps"
>;

let serveUrlPromise: Promise<string> | null = null;

export function getVideoOutputFilename(job: Pick<VideoGenerationJob, "id">) {
  return `${job.id}.mp4`;
}

export function getVideoObjectKey(job: RenderableGenerationJob) {
  return `videos/${job.templateId}/${getVideoOutputFilename(job)}`;
}

export function getVideoOutputPath(
  outputDir: string,
  job: RenderableGenerationJob,
) {
  return path.join(outputDir, getVideoOutputFilename(job));
}

export function getImageOutputFilename(job: Pick<VideoGenerationJob, "id">) {
  return `${job.id}.png`;
}

export function getImageObjectKey(job: RenderableGenerationJob) {
  return `images/${job.templateId}/${getImageOutputFilename(job)}`;
}

export function getImageOutputPath(
  outputDir: string,
  job: RenderableGenerationJob,
) {
  return path.join(outputDir, getImageOutputFilename(job));
}

function firstExistingPath(candidates: string[]) {
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `Unable to locate Remotion source files. Tried: ${candidates.join(", ")}`,
    );
  }
  return found;
}

function getRemotionPaths() {
  const cwd = process.cwd();
  const fallbackEntryPoint = fileURLToPath(
    new URL(
      "../../../packages/remotion/src/remotion-entry.ts",
      import.meta.url,
    ),
  );
  const fallbackUiSrc = fileURLToPath(
    new URL("../../../packages/ui/src", import.meta.url),
  );

  return {
    entryPoint:
      process.env.REMOTION_ENTRY_POINT ??
      firstExistingPath([
        path.resolve(cwd, "../../packages/remotion/src/remotion-entry.ts"),
        path.resolve(cwd, "packages/remotion/src/remotion-entry.ts"),
        fallbackEntryPoint,
      ]),
    uiSrc:
      process.env.REMOTION_UI_SRC ??
      firstExistingPath([
        path.resolve(cwd, "../../packages/ui/src"),
        path.resolve(cwd, "packages/ui/src"),
        fallbackUiSrc,
      ]),
  };
}

async function getServeUrl() {
  serveUrlPromise ??= bundle({
    entryPoint: getRemotionPaths().entryPoint,
    webpackOverride: (currentConfig) => {
      const config = enableTailwind(currentConfig);
      const uiSrc = getRemotionPaths().uiSrc;
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            // Resolve the bare "@mr/ui" specifier to the shipped source. Locally
            // this is satisfied by the workspace node_modules symlink, but the
            // deployed image has no such symlink, so alias it explicitly.
            "@mr/ui$": path.resolve(uiSrc, "index.ts"),
            // The UI package's internal "@/..." imports.
            "@": uiSrc,
          },
        },
      };
    },
  });

  return serveUrlPromise;
}

export async function renderVideoGenerationJob({
  job,
  outputDir,
  storage,
}: {
  job: RenderableGenerationJob;
  outputDir: string;
  storage: S3StorageConfig;
}) {
  const template = TEMPLATE_DEFINITIONS.find(
    (candidate) => candidate.id === job.templateId,
  );
  if (!template) {
    throw new Error(`Unknown video template: ${job.templateId}`);
  }

  if (template.kind !== "video") {
    throw new Error(`Template "${template.id}" is not a video template`);
  }

  const parsedProps = template.schema.safeParse(job.inputProps);
  if (!parsedProps.success) {
    throw new Error(`Invalid input props: ${parsedProps.error.message}`);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: template.id,
    inputProps: parsedProps.data,
  });
  const outputLocation = getVideoOutputPath(outputDir, job);

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps: parsedProps.data,
    overwrite: true,
    logLevel: "warn",
  });

  const storedObject = await uploadRenderedFile({
    client: createS3Client(storage),
    config: storage,
    filePath: outputLocation,
    key: getVideoObjectKey(job),
  });

  return {
    outputLocation,
    publicPath: storedObject.url,
  };
}

export async function renderImageGenerationJob({
  job,
  outputDir,
  storage,
}: {
  job: RenderableGenerationJob;
  outputDir: string;
  storage: S3StorageConfig;
}) {
  const template = TEMPLATE_DEFINITIONS.find(
    (candidate) => candidate.id === job.templateId,
  );
  if (!template) {
    throw new Error(`Unknown image template: ${job.templateId}`);
  }

  if (template.kind !== "image") {
    throw new Error(`Template "${template.id}" is not an image template`);
  }

  const parsedProps = template.schema.safeParse(job.inputProps);
  if (!parsedProps.success) {
    throw new Error(`Invalid input props: ${parsedProps.error.message}`);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: template.id,
    inputProps: parsedProps.data,
  });
  const outputLocation = getImageOutputPath(outputDir, job);

  await renderStill({
    composition,
    serveUrl,
    output: outputLocation,
    inputProps: parsedProps.data,
    imageFormat: "png",
    overwrite: true,
    logLevel: "warn",
  });

  const storedObject = await uploadRenderedFile({
    client: createS3Client(storage),
    config: storage,
    filePath: outputLocation,
    key: getImageObjectKey(job),
  });

  return {
    outputLocation,
    publicPath: storedObject.url,
  };
}

/**
 * Dispatches a claimed job to the right renderer based on its kind. Both renderers
 * share the same {outputLocation, publicPath} return shape so the worker is
 * kind-agnostic.
 */
export function renderGenerationJob(args: {
  job: RenderableGenerationJob;
  outputDir: string;
  storage: S3StorageConfig;
}) {
  if (args.job.kind === "image") {
    return renderImageGenerationJob(args);
  }
  return renderVideoGenerationJob(args);
}
