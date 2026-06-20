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
import type { MediaOption, MediaTemplateSummary } from "./data";
import { PublicationForm } from "./publication-form";

type CreatePublicationSheetProps = {
  mediaOptions: MediaOption[];
  templates: MediaTemplateSummary[];
  className?: string;
};

export function CreatePublicationSheet({
  mediaOptions,
  templates,
  className,
}: CreatePublicationSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className={className}>
          <Plus className="h-4 w-4" />
          Nueva publicación
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nueva publicación</SheetTitle>
          <SheetDescription>
            Elige plataformas, contenido y programa la publicación.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <PublicationForm
            mediaOptions={mediaOptions}
            templates={templates}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
