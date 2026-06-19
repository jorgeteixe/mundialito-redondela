import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import type { VideoGenerationJob } from "@mr/db";
import type { S3StorageConfig } from "./config";
import { createS3Client, uploadVideoFile } from "./storage";

const remotionEntryPoint = fileURLToPath(
  new URL("../../remotion/src/remotion-entry.ts", import.meta.url),
);

const uiSrc = fileURLToPath(new URL("../../ui/src", import.meta.url));

let serveUrlPromise: Promise<string> | null = null;

export function getVideoOutputFilename(job: Pick<VideoGenerationJob, "id">) {
  return `${job.id}.mp4`;
}

export function getVideoObjectKey(job: VideoGenerationJob) {
  return `videos/${job.templateId}/${getVideoOutputFilename(job)}`;
}

export function getVideoOutputPath(outputDir: string, job: VideoGenerationJob) {
  return path.join(outputDir, getVideoOutputFilename(job));
}

async function getServeUrl() {
  serveUrlPromise ??= bundle({
    entryPoint: remotionEntryPoint,
    webpackOverride: (currentConfig) => {
      const config = enableTailwind(currentConfig);
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
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
  job: VideoGenerationJob;
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

  const storedObject = await uploadVideoFile({
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
