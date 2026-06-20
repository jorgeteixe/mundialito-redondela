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
import type { ImageTemplateSummary } from "./data";
import { ImageJobForm } from "./image-job-form";

type CreateImageSheetProps = {
  templates: ImageTemplateSummary[];
  className?: string;
};

export function CreateImageSheet({
  templates,
  className,
}: CreateImageSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className={className}>
          <Plus className="h-4 w-4" />
          Generar imagen
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Generar imagen</SheetTitle>
          <SheetDescription>
            Configura la plantilla y añade el trabajo a la cola.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <ImageJobForm
            templates={templates}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
