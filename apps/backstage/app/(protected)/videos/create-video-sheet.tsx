"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@mr/ui";
import type { VideoTemplateSummary } from "./data";
import { VideoJobForm } from "./video-job-form";

type CreateVideoSheetProps = {
  templates: VideoTemplateSummary[];
  className?: string;
};

export function CreateVideoSheet({
  templates,
  className,
}: CreateVideoSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className={className}>
          <Plus className="h-4 w-4" />
          Generar vídeo
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Generar vídeo</SheetTitle>
          <SheetDescription>
            Configura la plantilla y añade el trabajo a la cola.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <VideoJobForm
            templates={templates}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
