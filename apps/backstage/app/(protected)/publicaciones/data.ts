import {
  listPublishableMedia,
  listSocialPosts,
  type SocialMediaKind,
  type SocialPlatform,
  type SocialPostTargetStatus,
  type SocialPostType,
} from "@mr/db";
import {
  TEMPLATE_DEFINITIONS,
  type TemplateParameter,
} from "@mr/remotion/templates";

export type PublicationTargetSummary = {
  id: string;
  platform: SocialPlatform;
  status: SocialPostTargetStatus;
  errorMessage: string | null;
  providerPostId: string | null;
  permalink: string | null;
};

export type PublicationSummary = {
  id: string;
  postType: SocialPostType;
  mediaKind: SocialMediaKind;
  caption: string;
  scheduledAt: string;
  createdAt: string;
  mediaPending: boolean;
  /** Public media URL (direct or rendered job output) for preview, when ready. */
  mediaUrl: string | null;
  targets: PublicationTargetSummary[];
};

export type MediaOption = {
  id: string;
  kind: SocialMediaKind;
  label: string;
};

export type MediaTemplateSummary = {
  id: string;
  title: string;
  kind: SocialMediaKind;
  parameters: TemplateParameter[];
  defaultProps: Record<string, unknown>;
};

function templateTitle(templateId: string) {
  return (
    TEMPLATE_DEFINITIONS.find((template) => template.id === templateId)
      ?.title ?? templateId
  );
}

export async function listPublications(): Promise<PublicationSummary[]> {
  const posts = await listSocialPosts(50);

  return posts.map((post) => {
    const hasVideoJob = Boolean(post.videoJobId);
    const jobSucceeded = post.videoJob?.status === "succeeded";

    return {
      id: post.id,
      postType: post.postType,
      mediaKind: post.mediaKind,
      caption: post.caption,
      scheduledAt: post.scheduledAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      // Media not yet renderable: a referenced job that hasn't succeeded.
      mediaPending: hasVideoJob && !jobSucceeded,
      mediaUrl:
        post.mediaUrl ??
        post.mediaUrls?.[0] ??
        post.videoJob?.outputPath ??
        null,
      targets: post.targets.map((target) => ({
        id: target.id,
        platform: target.platform,
        status: target.status,
        errorMessage: target.errorMessage,
        providerPostId: target.providerPostId,
        permalink: target.providerPermalink,
      })),
    };
  });
}

export async function listMediaOptions(): Promise<MediaOption[]> {
  const media = await listPublishableMedia(50);

  return media.map((item) => ({
    id: item.id,
    kind: item.kind,
    label: `${templateTitle(item.templateId)} · ${new Intl.DateTimeFormat(
      "es-ES",
      { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" },
    ).format(item.createdAt)}`,
  }));
}

export function listMediaTemplates(): MediaTemplateSummary[] {
  return TEMPLATE_DEFINITIONS.map((template) => ({
    id: template.id,
    title: template.title,
    kind: template.kind,
    parameters: template.parameters,
    defaultProps: template.defaultProps,
  }));
}
