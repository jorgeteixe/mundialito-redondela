export type GroupStage = "f1" | "f2";

export function isGroupStage(value: string): value is GroupStage {
  return value === "f1" || value === "f2";
}

export function parseGroupStageParam(value: string): GroupStage {
  if (isGroupStage(value)) return value;
  throw new Error(`Unknown group stage: ${value}`);
}

export function groupStageLabel(stage: GroupStage): string {
  return stage === "f1" ? "F1" : "F2";
}
