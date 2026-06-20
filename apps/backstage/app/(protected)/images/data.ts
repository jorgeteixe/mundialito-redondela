import { listVideoGenerationJobs, type VideoGenerationJobStatus } from "@mr/db";
import {
  TEMPLATE_DEFINITIONS,
  type TemplateParameter,
} from "@mr/remotion/templates";

export type ImageTemplateSummary = {
  id: string;
  title: string;
  parameters: TemplateParameter[];
  defaultProps: Record<string, unknown>;
};

export type ImageJobSummary = {
  id: string;
  templateId: string;
  templateTitle: string;
  status: VideoGenerationJobStatus;
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  outputPath: string | null;
  createdAt: string;
};

export function listImageTemplates(): ImageTemplateSummary[] {
  return TEMPLATE_DEFINITIONS.filter(
    (template) => template.kind === "image",
  ).map((template) => ({
    id: template.id,
    title: template.title,
    parameters: template.parameters,
    defaultProps: template.defaultProps,
  }));
}

export async function listImageJobs(): Promise<ImageJobSummary[]> {
  const jobs = await listVideoGenerationJobs(50, "image");

  return jobs.map((job) => ({
    id: job.id,
    templateId: job.templateId,
    templateTitle:
      TEMPLATE_DEFINITIONS.find((template) => template.id === job.templateId)
        ?.title ?? job.templateId,
    status: job.status,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    errorMessage: job.errorMessage,
    outputPath: job.outputPath,
    createdAt: job.createdAt.toISOString(),
  }));
}
