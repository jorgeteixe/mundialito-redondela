"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mr/ui";
import type { TemplateParameter } from "@mr/remotion/templates";
import { createVideoGenerationJob, type VideoJobFormState } from "./actions";
import type { VideoTemplateSummary } from "./data";

const initialFormState: VideoJobFormState = { status: "idle" };

type VideoJobFormProps = {
  templates: VideoTemplateSummary[];
  onSuccess?: () => void;
};

export function VideoJobForm({ templates, onSuccess }: VideoJobFormProps) {
  const [state, formAction, pending] = useActionState(
    createVideoGenerationJob,
    initialFormState,
  );
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [inputProps, setInputProps] = useState<Record<string, unknown>>(
    templates[0]?.defaultProps ?? {},
  );
  const handledStateRef = useRef<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templateId, templates],
  );

  useEffect(() => {
    setInputProps(selectedTemplate?.defaultProps ?? {});
  }, [selectedTemplate]);

  useEffect(() => {
    if (state.status === "idle") return;

    const stateKey = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === stateKey) return;
    handledStateRef.current = stateKey;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [onSuccess, state]);

  function setParameter(name: string, value: unknown) {
    setInputProps((current) => ({
      ...current,
      [name]: value,
    }));
  }

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

      <input
        type="hidden"
        name="inputProps"
        value={JSON.stringify(inputProps)}
      />

      <div className="flex flex-col gap-3">
        {selectedTemplate?.parameters.map((parameter) => (
          <ParameterField
            key={parameter.name}
            parameter={parameter}
            value={inputProps[parameter.name]}
            onChange={(value) => setParameter(parameter.name, value)}
          />
        ))}
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

function ParameterField({
  parameter,
  value,
  onChange,
}: {
  parameter: TemplateParameter;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `video-param-${parameter.name}`;

  if (parameter.type === "select") {
    return (
      <div className="flex flex-col gap-2">
        <FieldLabel
          htmlFor={id}
          label={parameter.label}
          required={parameter.required}
        />
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          required={parameter.required}
        >
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            {parameter.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription description={parameter.description} />
      </div>
    );
  }

  if (parameter.type === "number" || parameter.type === "integer") {
    return (
      <div className="flex flex-col gap-2">
        <FieldLabel
          htmlFor={id}
          label={parameter.label}
          required={parameter.required}
        />
        <Input
          id={id}
          type="number"
          value={typeof value === "number" ? String(value) : ""}
          min={parameter.min}
          max={parameter.max}
          step={parameter.type === "integer" ? 1 : "any"}
          required={parameter.required}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue === "" ? undefined : Number(nextValue));
          }}
        />
        <FieldDescription description={parameter.description} />
      </div>
    );
  }

  if (parameter.type === "boolean") {
    return (
      <div className="flex min-h-11 items-center gap-3">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <div className="flex flex-col gap-1">
          <FieldLabel
            htmlFor={id}
            label={parameter.label}
            required={parameter.required}
          />
          <FieldDescription description={parameter.description} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel
        htmlFor={id}
        label={parameter.label}
        required={parameter.required}
      />
      <Input
        id={id}
        value={typeof value === "string" ? value : ""}
        required={parameter.required}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldDescription description={parameter.description} />
    </div>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </Label>
  );
}

function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;
  return <p className="text-xs text-muted-foreground">{description}</p>;
}
