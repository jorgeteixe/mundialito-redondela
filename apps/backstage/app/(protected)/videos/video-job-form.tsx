"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@mr/ui";
import { createVideoGenerationJob, type VideoJobFormState } from "./actions";
import type { VideoTemplateSummary } from "./data";

const initialFormState: VideoJobFormState = { status: "idle" };

type VideoJobFormProps = {
  templates: VideoTemplateSummary[];
};

export function VideoJobForm({ templates }: VideoJobFormProps) {
  const [state, formAction, pending] = useActionState(
    createVideoGenerationJob,
    initialFormState,
  );
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const handledStateRef = useRef<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templateId, templates],
  );

  useEffect(() => {
    if (state.status === "idle") return;

    const stateKey = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === stateKey) return;
    handledStateRef.current = stateKey;

    if (state.status === "success") toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="video-template">Plantilla</Label>
        <Select
          name="templateId"
          value={templateId}
          onValueChange={setTemplateId}
          required
        >
          <SelectTrigger
            id="video-template"
            className="w-full"
            aria-invalid={Boolean(state.fieldErrors?.templateId)}
          >
            <SelectValue placeholder="Selecciona una plantilla" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.templateId && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.templateId}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="video-input-props">Datos JSON</Label>
        <Textarea
          id="video-input-props"
          name="inputProps"
          key={selectedTemplate?.id}
          defaultValue={selectedTemplate?.defaultPropsJson ?? "{}"}
          className="min-h-40 font-mono text-xs"
          aria-invalid={Boolean(state.fieldErrors?.inputProps)}
          required
        />
        {state.fieldErrors?.inputProps && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.inputProps}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending || templates.length === 0}>
        {pending ? "Añadiendo..." : "Añadir a la cola"}
      </Button>
    </form>
  );
}
