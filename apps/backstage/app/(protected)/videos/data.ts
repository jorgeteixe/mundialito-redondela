import { listVideoGenerationJobs } from "@mr/db";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";

export type VideoTemplateSummary = {
  id: string;
  title: string;
  defaultPropsJson: string;
};

export type VideoJobSummary = Awaited<
  ReturnType<typeof listVideoGenerationJobs>
>[number] & {
  templateTitle: string;
};

export function listVideoTemplates(): VideoTemplateSummary[] {
  return TEMPLATE_DEFINITIONS.filter(
    (template) => template.kind === "video",
  ).map((template) => ({
    id: template.id,
    title: template.title,
    defaultPropsJson: JSON.stringify(template.defaultProps, null, 2),
  }));
}

export async function listVideoJobs(): Promise<VideoJobSummary[]> {
  const jobs = await listVideoGenerationJobs();

  return jobs.map((job) => ({
    ...job,
    templateTitle:
      TEMPLATE_DEFINITIONS.find((template) => template.id === job.templateId)
        ?.title ?? job.templateId,
  }));
}
