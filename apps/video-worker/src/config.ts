export type VideoWorkerConfig = {
  storage: S3StorageConfig;
};

export type S3StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
  applyPublicReadPolicy: boolean;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for media rendering.`);
  return value;
}

export function getVideoWorkerConfig(): VideoWorkerConfig {
  return {
    storage: {
      endpoint: required("S3_ENDPOINT"),
      region: required("S3_REGION"),
      bucket: required("S3_BUCKET"),
      accessKeyId: required("S3_ACCESS_KEY_ID"),
      secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
      publicBaseUrl: required("S3_PUBLIC_BASE_URL"),
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      applyPublicReadPolicy: process.env.S3_APPLY_PUBLIC_READ_POLICY === "true",
    },
  };
}
