export const RENDER_MEDIA_TASK_ID = "media.render";
export const SOCIAL_PUBLISH_TASK_ID = "social.publish";
export const SOCIAL_RECONCILE_PERMALINKS_TASK_ID =
  "social.reconcile-permalinks";
export const PUBLICATION_PUBLISH_TASK_ID = "publication.publish";
export const RESULTS_PUBLISH_AFTER_SAVE_TASK_ID = "results.publish-after-save";
export const SCHEDULE_PUBLISH_MORNING_TASK_ID = "schedule.publish-morning";

export type RenderMediaPayload = {
  id?: string;
  jobId?: string;
  templateId: string;
  inputProps: Record<string, unknown>;
};

export type RenderMediaOutput = {
  id: string;
  jobId: string | null;
  templateId: string;
  kind: "video" | "image";
  // Null only when the run skipped rendering (a duplicate/replay for a job
  // another run is already handling and which has no output yet).
  publicPath: string | null;
  // True when this run did not render: the job was already done (cached output
  // returned) or is being handled by another run.
  skipped?: boolean;
};

export type SocialPublishPayload = {
  targetId: string;
};

export type SocialPublishOutput = {
  targetId: string;
  providerPostId: string;
  permalink: string | null;
};

export type SocialReconcilePermalinksOutput = {
  updated: number;
};

export type PublicationPublishPayload = {
  postId: string;
  render?: {
    id?: string;
    templateId: string;
    inputProps: Record<string, unknown>;
  };
};

export type PublicationPublishOutput = {
  postId: string;
  mediaUrl: string | null;
  targetCount: number;
};

export type ResultsPublishAfterSavePayload = {
  matchId: string;
};

export type ResultsPublishAfterSaveOutput = {
  matchId: string;
  storyPostId: string | null;
  dayPostId: string | null;
  dayComplete: boolean;
  renderedImageCount: number;
};

export type SchedulePublishMorningOutput = {
  date: string;
  hasMatches: boolean;
  storyPostId: string | null;
  postId: string | null;
  matchCount: number;
};
