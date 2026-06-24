export type PostizConfig = {
  apiUrl: string;
  apiKey: string;
  // Optional explicit channel ids. When unset the provider resolves them from
  // GET /integrations by matching the channel identifier to the platform.
  integrationIds: {
    instagram?: string;
    facebook?: string;
  };
};

export type SocialWorkerConfig = {
  // Used to turn a stored media path into a public URL the provider can fetch.
  s3PublicBaseUrl: string;
  postiz: PostizConfig;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for social publishing.`);
  return value;
}

export function getSocialWorkerConfig(): SocialWorkerConfig {
  return {
    s3PublicBaseUrl: required("S3_PUBLIC_BASE_URL"),
    postiz: {
      apiUrl: process.env.POSTIZ_API_URL ?? "https://api.postiz.com/public/v1",
      apiKey: required("POSTIZ_API_KEY"),
      integrationIds: {
        instagram: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID,
        facebook: process.env.POSTIZ_FACEBOOK_INTEGRATION_ID,
      },
    },
  };
}
