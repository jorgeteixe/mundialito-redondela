import { randomBytes } from "node:crypto";
import { applyMatchResult } from "@mr/tournament";
import { Actions, Button, Card, CardText, type Chat } from "chat";

type ApprovalInput = {
  matchId: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homePenalties?: number;
  awayPenalties?: number;
  category?: string;
  dateLabel?: string;
  time?: string;
};

type PendingApproval = {
  input: ApprovalInput;
  messageId?: string;
  threadId: string;
};

const pendingApprovals = new Map<string, PendingApproval>();
let chat: Chat | undefined;

function approvalId(): string {
  return randomBytes(8).toString("hex");
}

function scoreLine(input: ApprovalInput): string {
  const penalties =
    typeof input.homePenalties === "number" &&
    typeof input.awayPenalties === "number"
      ? ` · Penaltis ${input.homePenalties}-${input.awayPenalties}`
      : "";

  return `${input.homeName} ${input.homeScore}-${input.awayScore} ${input.awayName}${penalties}`;
}

function approvalLines(input: ApprovalInput): string[] {
  const lines = [scoreLine(input)];

  if (input.category) {
    lines.push(`🏆 ${input.category}`);
  }

  const dateTime = [input.dateLabel, input.time].filter(Boolean).join(" · ");
  if (dateTime) {
    lines.push(`📅 ${dateTime}`);
  }

  lines.push("Pulsa Aprobar para guardar.");
  return lines;
}

export function createResultApprovalCard(id: string, input: ApprovalInput) {
  return Card({
    children: [
      CardText("📝 Resultado detectado"),
      ...approvalLines(input).map((line) => CardText(line)),
      Actions([
        Button({
          id: `mr_result_ok:${id}`,
          label: "Aprobar",
          style: "primary",
        }),
        Button({
          id: `mr_result_no:${id}`,
          label: "Denegar",
          style: "danger",
        }),
      ]),
    ],
  });
}

function finalCard(input: ApprovalInput, status: string) {
  return Card({
    children: [
      CardText("📝 Resultado detectado"),
      ...approvalLines(input)
        .filter((line) => line !== "Pulsa Aprobar para guardar.")
        .map((line) => CardText(line)),
      CardText(status),
    ],
  });
}

export function configureResultApprovalChat(nextChat: Chat): void {
  chat = nextChat;
}

export async function requestResultApproval(
  threadId: string,
  input: ApprovalInput,
): Promise<{ ok: true; approvalId: string }> {
  if (!chat) {
    throw new Error("Telegram approval chat is not configured");
  }

  const id = approvalId();
  const sent = await chat
    .thread(threadId)
    .post(createResultApprovalCard(id, input));
  pendingApprovals.set(id, { input, messageId: sent.id, threadId });
  return { ok: true, approvalId: id };
}

export function registerResultApprovalActions(nextChat: Chat): void {
  nextChat.onAction(async (event) => {
    const actionId = event.actionId;
    if (
      !actionId.startsWith("mr_result_ok:") &&
      !actionId.startsWith("mr_result_no:")
    ) {
      return;
    }

    const id = actionId.split(":")[1];
    const pending = id ? pendingApprovals.get(id) : undefined;
    if (!id || !pending) {
      await event.thread?.post("⚠️ Esta aprobación ya no está disponible.");
      return;
    }

    pendingApprovals.delete(id);

    if (actionId.startsWith("mr_result_no:")) {
      await event.adapter.editMessage(
        pending.threadId,
        pending.messageId ?? event.messageId,
        finalCard(pending.input, "❌ Denegado. No se guardó nada."),
      );
      return;
    }

    const outcome = await applyMatchResult({
      matchId: pending.input.matchId,
      homeScore: pending.input.homeScore,
      awayScore: pending.input.awayScore,
      homePenalties: pending.input.homePenalties ?? null,
      awayPenalties: pending.input.awayPenalties ?? null,
    });

    if (!outcome.ok) {
      await event.adapter.editMessage(
        pending.threadId,
        pending.messageId ?? event.messageId,
        finalCard(pending.input, `⚠️ ${outcome.message}`),
      );
      return;
    }

    const penalties =
      outcome.homePenalties !== null && outcome.awayPenalties !== null
        ? ` (penaltis ${outcome.homePenalties}-${outcome.awayPenalties})`
        : "";
    await event.adapter.editMessage(
      pending.threadId,
      pending.messageId ?? event.messageId,
      finalCard(pending.input, "✅ Aprobado y guardado."),
    );
    await event.thread?.post(
      `✅ Resultado guardado: ${outcome.homeName} ${outcome.homeScore}-${outcome.awayScore} ${outcome.awayName}${penalties}.`,
    );
  });
}
