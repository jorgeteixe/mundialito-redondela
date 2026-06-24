"use server";

import { revalidatePath } from "next/cache";
import {
  createSocialPost,
  retrySocialPostTarget,
  type SocialMediaKind,
  type SocialPlatform,
  type SocialPostType,
} from "@mr/db";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import { requireAdminWrite } from "@/lib/authz";
import { triggerPublicationPublish, triggerSocialPublish } from "@/lib/trigger";

export type PublicationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    platforms?: string;
    postType?: string;
    media?: string;
    scheduledAt?: string;
  };
};

const PLATFORMS: SocialPlatform[] = ["instagram", "facebook"];
const POST_TYPES: SocialPostType[] = ["feed", "reel", "story"];
const MEDIA_KINDS: SocialMediaKind[] = ["image", "video"];
const FIVE_MINUTES_MS = 5 * 60 * 1000;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const invalid = (
  fieldErrors: PublicationFormState["fieldErrors"],
): PublicationFormState => ({
  status: "error",
  message: "Revisa los campos marcados.",
  fieldErrors,
});

export async function createPublication(
  _state: PublicationFormState,
  formData: FormData,
): Promise<PublicationFormState> {
  const session = await requireAdminWrite();

  const platforms = formData
    .getAll("platforms")
    .filter((value): value is SocialPlatform =>
      PLATFORMS.includes(value as SocialPlatform),
    );
  if (platforms.length === 0) {
    return invalid({ platforms: "Selecciona al menos una plataforma." });
  }

  const postType = readString(formData, "postType") as SocialPostType;
  if (!POST_TYPES.includes(postType)) {
    return invalid({ postType: "Selecciona un tipo de publicación." });
  }

  // Facebook stories aren't supported yet; reject the combination outright.
  if (postType === "story" && platforms.includes("facebook")) {
    return invalid({
      platforms: "Las stories de Facebook no están disponibles por ahora.",
    });
  }

  // "now" publishes immediately; "schedule" delegates timing to Postiz, which
  // needs the date at least 5 minutes out to avoid being skipped.
  const mode = readString(formData, "mode") === "schedule" ? "schedule" : "now";
  let scheduledAt = new Date();
  if (mode === "schedule") {
    const scheduledRaw = readString(formData, "scheduledAt");
    if (!scheduledRaw) {
      return invalid({ scheduledAt: "Indica una fecha y hora." });
    }
    scheduledAt = new Date(scheduledRaw);
    if (Number.isNaN(scheduledAt.getTime())) {
      return invalid({ scheduledAt: "Indica una fecha y hora válidas." });
    }
    // 30s grace for submit latency / clock skew on an exactly-+5m pick.
    if (scheduledAt.getTime() < Date.now() + FIVE_MINUTES_MS - 30_000) {
      return invalid({
        scheduledAt: "Programa al menos 5 minutos desde ahora.",
      });
    }
  }

  const caption = readString(formData, "caption");
  const mediaSource = readString(formData, "mediaSource");

  let mediaKind: SocialMediaKind;
  let videoJobId: string | null = null;
  let mediaUrl: string | null = null;
  let render:
    | {
        templateId: string;
        inputProps: Record<string, unknown>;
      }
    | undefined;

  if (mediaSource === "generate") {
    const templateId = readString(formData, "templateId");
    const template = TEMPLATE_DEFINITIONS.find(
      (candidate) => candidate.id === templateId,
    );
    if (!template) {
      return invalid({ media: "Selecciona una plantilla válida." });
    }

    let inputProps: unknown;
    try {
      inputProps = JSON.parse(readString(formData, "inputProps"));
    } catch {
      return invalid({ media: "Los parámetros no son un JSON válido." });
    }

    const parsed = template.schema.safeParse(inputProps);
    if (!parsed.success) {
      return invalid({
        media: parsed.error.issues.map((issue) => issue.message).join(" "),
      });
    }

    mediaKind = template.kind;
    render = {
      templateId: template.id,
      inputProps: parsed.data,
    };
  } else if (mediaSource === "existing") {
    videoJobId = readString(formData, "mediaJobId") || null;
    const kind = readString(formData, "mediaKind") as SocialMediaKind;
    if (!videoJobId || !MEDIA_KINDS.includes(kind)) {
      return invalid({ media: "Selecciona un contenido generado." });
    }
    mediaKind = kind;
  } else if (mediaSource === "url") {
    mediaUrl = readString(formData, "mediaUrl") || null;
    const kind = readString(formData, "mediaKind") as SocialMediaKind;
    if (!mediaUrl || !MEDIA_KINDS.includes(kind)) {
      return invalid({ media: "Indica una URL pública y el tipo de medio." });
    }
    mediaKind = kind;
  } else {
    return invalid({ media: "Selecciona el origen del contenido." });
  }

  if (postType === "reel" && mediaKind !== "video") {
    return invalid({ media: "Los reels requieren un vídeo." });
  }

  const { post } = await createSocialPost({
    postType,
    mediaKind,
    caption,
    scheduledAt,
    platforms,
    videoJobId,
    mediaUrl,
    createdByUserId: session.user.id,
  });

  await triggerPublicationPublish({
    postId: post.id,
    render,
  });

  revalidatePath("/publicaciones");
  return {
    status: "success",
    message:
      mode === "schedule"
        ? "Publicación programada en Trigger."
        : "Publicación enviada a Trigger.",
  };
}

export async function retryPublicationTarget(formData: FormData) {
  await requireAdminWrite();
  const id = readString(formData, "id");
  if (!id) return;

  const target = await retrySocialPostTarget(id);
  if (target) {
    await triggerSocialPublish({ targetId: target.id });
  }
  revalidatePath("/publicaciones");
}
