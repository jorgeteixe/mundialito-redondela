"use server";

import { revalidatePath } from "next/cache";
import {
  createSocialPost,
  enqueueVideoGenerationJob,
  retrySocialPostTarget,
  type SocialMediaKind,
  type SocialPlatform,
  type SocialPostType,
} from "@mr/db";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import { requireAdminWrite } from "@/lib/authz";

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

  const scheduledRaw = readString(formData, "scheduledAt");
  // No date = publish now. A past date is allowed and goes out on the next poll.
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : new Date();
  if (Number.isNaN(scheduledAt.getTime())) {
    return invalid({ scheduledAt: "Indica una fecha y hora válidas." });
  }

  const caption = readString(formData, "caption");
  const mediaSource = readString(formData, "mediaSource");

  let mediaKind: SocialMediaKind;
  let videoJobId: string | null = null;
  let mediaUrl: string | null = null;

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

    const job = await enqueueVideoGenerationJob({
      templateId: template.id,
      kind: template.kind,
      inputProps: parsed.data,
      createdByUserId: session.user.id,
    });
    if (!job) {
      return invalid({ media: "No se pudo encolar la generación." });
    }
    videoJobId = job.id;
    mediaKind = template.kind;
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

  await createSocialPost({
    postType,
    mediaKind,
    caption,
    scheduledAt,
    platforms,
    videoJobId,
    mediaUrl,
    createdByUserId: session.user.id,
  });

  revalidatePath("/publicaciones");
  return { status: "success", message: "Publicación programada." };
}

export async function retryPublicationTarget(formData: FormData) {
  await requireAdminWrite();
  const id = readString(formData, "id");
  if (!id) return;

  await retrySocialPostTarget(id);
  revalidatePath("/publicaciones");
}
