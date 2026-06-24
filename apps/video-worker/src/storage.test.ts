import { describe, expect, it } from "vitest";
import type { S3StorageConfig } from "./config";
import { contentTypeForPath, getObjectUrl } from "./storage";

const config: S3StorageConfig = {
  endpoint: "https://s3.example.com",
  region: "auto",
  bucket: "mundialito-videos",
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  publicBaseUrl: "https://media.example.com",
  forcePathStyle: true,
  applyPublicReadPolicy: true,
};

describe("getObjectUrl", () => {
  it("builds path-style public URLs", () => {
    expect(getObjectUrl(config, "videos/job.mp4")).toBe(
      "https://media.example.com/mundialito-videos/videos/job.mp4",
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

describe("contentTypeForPath", () => {
  it("maps mp4 to video/mp4", () => {
    expect(contentTypeForPath("/tmp/job.mp4")).toBe("video/mp4");
  });

  it("maps png to image/png", () => {
    expect(contentTypeForPath("/tmp/job.png")).toBe("image/png");
  });

  it("falls back to octet-stream for unknown extensions", () => {
    expect(contentTypeForPath("/tmp/job.bin")).toBe("application/octet-stream");
  });
});
