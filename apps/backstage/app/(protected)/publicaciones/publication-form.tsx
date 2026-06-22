"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  DateTimePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from "@mr/ui";
import type { SocialPlatform, SocialPostType } from "@mr/db";
import { PlatformIcon } from "@/app/components/social-icons";
import { createPublication, type PublicationFormState } from "./actions";
import type { MediaOption, MediaTemplateSummary } from "./data";
import { ParameterField } from "../videos/video-job-form";

const initialFormState: PublicationFormState = { status: "idle" };

type MediaSource = "existing" | "generate" | "url";

const platformOptions: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

// Reel is intentionally omitted: a video published in Feed mode is posted as a
// reel automatically on both Instagram and Facebook.
const postTypeOptions: { value: SocialPostType; label: string }[] = [
  { value: "feed", label: "Feed" },
  { value: "story", label: "Story" },
];

const sourceOptions: { value: MediaSource; label: string }[] = [
  { value: "existing", label: "Existente" },
  { value: "generate", label: "Generar" },
  { value: "url", label: "URL" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type PublicationFormProps = {
  mediaOptions: MediaOption[];
  templates: MediaTemplateSummary[];
  onSuccess?: () => void;
};

export function PublicationForm({
  mediaOptions,
  templates,
  onSuccess,
}: PublicationFormProps) {
  const [state, formAction, pending] = useActionState(
    createPublication,
    initialFormState,
  );
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [postType, setPostType] = useState<SocialPostType>("feed");
  const [mediaSource, setMediaSource] = useState<MediaSource>(
    mediaOptions.length > 0 ? "existing" : "generate",
  );
  const [mediaJobId, setMediaJobId] = useState(mediaOptions[0]?.id ?? "");
  const [urlMediaKind, setUrlMediaKind] = useState<"image" | "video">("image");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [inputProps, setInputProps] = useState<Record<string, unknown>>(
    templates[0]?.defaultProps ?? {},
  );
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
  const handledStateRef = useRef<string | null>(null);

  function handleModeChange(value: string) {
    if (value !== "now" && value !== "schedule") return;
    setMode(value);
    // Default the picker to the earliest allowed slot (now + 5 min).
    if (value === "schedule" && !scheduledAt) {
      setScheduledAt(new Date(Date.now() + 5 * 60 * 1000));
    }
  }

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templateId, templates],
  );
  const selectedJob = useMemo(
    () => mediaOptions.find((option) => option.id === mediaJobId),
    [mediaJobId, mediaOptions],
  );

  useEffect(() => {
    setInputProps(selectedTemplate?.defaultProps ?? {});
  }, [selectedTemplate]);

  useEffect(() => {
    if (state.status === "idle") return;
    const key = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === key) return;
    handledStateRef.current = key;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [onSuccess, state]);

  function setParameter(name: string, value: unknown) {
    setInputProps((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Type first: it constrains which platforms are valid. */}
      <Section title="Destino" description="Formato y dónde se publica.">
        <div className="flex flex-col gap-2">
          <Label>Tipo</Label>
          <input type="hidden" name="postType" value={postType} />
          <ToggleGroup
            type="single"
            variant="outline"
            value={postType}
            onValueChange={(value) => {
              if (value) setPostType(value as SocialPostType);
            }}
            className="w-full"
          >
            {postTypeOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="flex-1"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {postType === "feed" ? (
            <p className="text-xs text-muted-foreground">
              Un vídeo en Feed se publica como Reel automáticamente.
            </p>
          ) : null}
          {state.fieldErrors?.postType && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.postType}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Plataformas</Label>
          {/* ToggleGroup is controlled; hidden inputs carry the value to the form. */}
          {platforms.map((platform) => (
            <input
              key={platform}
              type="hidden"
              name="platforms"
              value={platform}
            />
          ))}
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={platforms}
            onValueChange={(value) => setPlatforms(value as SocialPlatform[])}
            className="w-full"
          >
            {platformOptions.map((platform) => (
              <ToggleGroupItem
                key={platform.value}
                value={platform.value}
                aria-label={platform.label}
                className="flex-1 gap-2"
              >
                <PlatformIcon platform={platform.value} className="size-4" />
                {platform.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {state.fieldErrors?.platforms && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.platforms}
            </p>
          )}
        </div>
      </Section>

      <Separator />

      {/* Media: the actual asset to publish. */}
      <Section title="Contenido" description="El medio que se va a publicar.">
        <input type="hidden" name="mediaSource" value={mediaSource} />
        <ToggleGroup
          type="single"
          variant="outline"
          value={mediaSource}
          onValueChange={(value) => {
            if (value) setMediaSource(value as MediaSource);
          }}
          className="w-full"
        >
          {sourceOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="flex-1"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {mediaSource === "existing" && (
          <div className="flex flex-col gap-2">
            {selectedJob && (
              <input type="hidden" name="mediaKind" value={selectedJob.kind} />
            )}
            <Select
              name="mediaJobId"
              value={mediaJobId}
              onValueChange={setMediaJobId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un contenido generado" />
              </SelectTrigger>
              <SelectContent>
                {mediaOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label} (
                    {option.kind === "video" ? "Vídeo" : "Imagen"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mediaOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay contenido generado todavía. Genera uno nuevo.
              </p>
            )}
          </div>
        )}

        {mediaSource === "generate" && (
          <div className="flex flex-col gap-3 rounded-md border border-dashed p-3">
            <input
              type="hidden"
              name="inputProps"
              value={JSON.stringify(inputProps)}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="template">Plantilla</Label>
              <Select
                name="templateId"
                value={templateId}
                onValueChange={setTemplateId}
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title} (
                      {template.kind === "video" ? "Vídeo" : "Imagen"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate?.parameters.map((parameter) => (
              <ParameterField
                key={parameter.name}
                parameter={parameter}
                value={inputProps[parameter.name]}
                onChange={(value) => setParameter(parameter.name, value)}
              />
            ))}
          </div>
        )}

        {mediaSource === "url" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="media-url">URL del medio</Label>
              <Input
                id="media-url"
                name="mediaUrl"
                type="url"
                placeholder="https://media.example.com/clip.mp4"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="url-kind">Tipo de medio</Label>
              <Select
                name="mediaKind"
                value={urlMediaKind}
                onValueChange={(value) =>
                  setUrlMediaKind(value as "image" | "video")
                }
              >
                <SelectTrigger id="url-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {state.fieldErrors?.media && (
          <p className="text-xs text-destructive">{state.fieldErrors.media}</p>
        )}
      </Section>

      <Separator />

      {/* Publication: the text and when it goes out. */}
      <Section title="Publicación" description="Texto y programación.">
        <div className="flex flex-col gap-2">
          <Label htmlFor="caption">Texto</Label>
          <Textarea
            id="caption"
            name="caption"
            rows={4}
            placeholder="Escribe el pie de la publicación..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Cuándo</Label>
          <input type="hidden" name="mode" value={mode} />
          <ToggleGroup
            type="single"
            variant="outline"
            value={mode}
            onValueChange={handleModeChange}
            className="w-full"
          >
            <ToggleGroupItem value="now" className="flex-1">
              Publicar ahora
            </ToggleGroupItem>
            <ToggleGroupItem value="schedule" className="flex-1">
              Programar
            </ToggleGroupItem>
          </ToggleGroup>

          {mode === "schedule" && (
            <>
              <DateTimePicker
                id="scheduled-at"
                name="scheduledAt"
                value={scheduledAt}
                onChange={setScheduledAt}
                placeholder="Selecciona fecha y hora"
                aria-invalid={Boolean(state.fieldErrors?.scheduledAt)}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 5 minutos desde ahora. Postiz gestiona la publicación.
              </p>
            </>
          )}
          {state.fieldErrors?.scheduledAt && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.scheduledAt}
            </p>
          )}
        </div>
      </Section>

      <Button type="submit" disabled={pending}>
        {pending
          ? "Enviando..."
          : mode === "schedule"
            ? "Programar publicación"
            : "Publicar ahora"}
      </Button>
    </form>
  );
}
