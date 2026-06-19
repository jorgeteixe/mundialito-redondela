import fs from "node:fs/promises";
import path from "node:path";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { S3StorageConfig } from "./config";

export type StoredObject = {
  key: string;
  url: string;
};

export function createS3Client(config: S3StorageConfig) {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function getObjectUrl(config: S3StorageConfig, key: string) {
  const baseUrl = config.publicBaseUrl.replace(/\/$/, "");
  return config.forcePathStyle
    ? `${baseUrl}/${config.bucket}/${key}`
    : `${baseUrl}/${key}`;
}

export async function ensureVideoBucket({
  client,
  config,
}: {
  client: S3Client;
  config: S3StorageConfig;
}) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: config.bucket }));
  }

  if (!config.applyPublicReadPolicy) return;

  await client.send(
    new PutBucketPolicyCommand({
      Bucket: config.bucket,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${config.bucket}/*`],
          },
        ],
      }),
    }),
  );
}

export async function uploadVideoFile({
  client,
  config,
  filePath,
  key,
}: {
  client: S3Client;
  config: S3StorageConfig;
  filePath: string;
  key: string;
}): Promise<StoredObject> {
  await ensureVideoBucket({ client, config });

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: await fs.readFile(filePath),
      ContentType: contentTypeForPath(filePath),
    }),
  );

  return {
    key,
    url: getObjectUrl(config, key),
  };
}

function contentTypeForPath(filePath: string) {
  if (path.extname(filePath) === ".mp4") return "video/mp4";
  return "application/octet-stream";
}
