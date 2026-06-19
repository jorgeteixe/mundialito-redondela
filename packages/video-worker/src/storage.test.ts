import { describe, expect, it } from "vitest";
import type { S3StorageConfig } from "./config";
import { getObjectUrl } from "./storage";

const config: S3StorageConfig = {
  endpoint: "http://localhost:9000",
  region: "auto",
  bucket: "mundialito-videos",
  accessKeyId: "mundialito",
  secretAccessKey: "mundialito",
  publicBaseUrl: "http://localhost:9000",
  forcePathStyle: true,
  applyPublicReadPolicy: true,
};

describe("getObjectUrl", () => {
  it("builds local MinIO path-style URLs", () => {
    expect(getObjectUrl(config, "videos/job.mp4")).toBe(
      "http://localhost:9000/mundialito-videos/videos/job.mp4",
    );
  });

  it("builds custom public base URLs for production storage", () => {
    expect(
      getObjectUrl(
        {
          ...config,
          bucket: "ignored-for-virtual-host-url",
          publicBaseUrl: "https://media.mundialitoredondela.com",
          forcePathStyle: false,
        },
        "videos/job.mp4",
      ),
    ).toBe("https://media.mundialitoredondela.com/videos/job.mp4");
  });
});
