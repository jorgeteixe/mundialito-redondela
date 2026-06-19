"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  cancelQueuedVideoGenerationJob,
  enqueueVideoGenerationJob,
  retryVideoGenerationJob,
} from "@mr/db";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import { auth } from "@/lib/auth";

export type VideoJobFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    templateId?: string;
    inputProps?: string;
  };
};

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createVideoGenerationJob(
  _state: VideoJobFormState,
  formData: FormData,
): Promise<VideoJobFormState> {
  const session = await requireSession();
  const templateId = readString(formData, "templateId");
  const inputPropsValue = readString(formData, "inputProps");
  const template = TEMPLATE_DEFINITIONS.find(
    (candidate) => candidate.id === templateId,
  );

  if (!template || template.kind !== "video") {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { templateId: "Selecciona una plantilla de vídeo." },
    };
  }

  let inputProps: unknown;
  try {
    inputProps = JSON.parse(inputPropsValue);
  } catch {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { inputProps: "Introduce JSON válido." },
    };
  }

  const parsedProps = template.schema.safeParse(inputProps);
  if (!parsedProps.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        inputProps: parsedProps.error.issues
          .map((issue) => issue.message)
          .join(" "),
      },
    };
  }

  await enqueueVideoGenerationJob({
    templateId: template.id,
    kind: template.kind,
    inputProps: parsedProps.data,
    createdByUserId: session.user.id,
  });

  revalidatePath("/videos");
  return { status: "success", message: "Vídeo añadido a la cola." };
}

export async function cancelVideoGenerationJob(formData: FormData) {
  await requireSession();
  const id = readString(formData, "id");
  if (!id) return;

  await cancelQueuedVideoGenerationJob(id);
  revalidatePath("/videos");
}

export async function retryFailedVideoGenerationJob(formData: FormData) {
  await requireSession();
  const id = readString(formData, "id");
  if (!id) return;

  await retryVideoGenerationJob(id);
  revalidatePath("/videos");
}
