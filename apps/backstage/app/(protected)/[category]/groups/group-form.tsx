"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@mr/ui";
import { createGroup, updateGroup, type FormState } from "./actions";
import type { Category } from "@/lib/category";
import type { GroupStage } from "@/lib/group-stage";

const initialFormState: FormState = { status: "idle" };

type GroupFormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

type GroupFormProps = {
  mode: "create" | "edit";
  category: Category;
  stage: GroupStage;
  group?: {
    id: string;
    name: string;
    avatarLabel: string;
  };
  onSuccess?: () => void;
};

export function GroupForm({
  mode,
  category,
  stage,
  group,
  onSuccess,
}: GroupFormProps) {
  const action: GroupFormAction = mode === "create" ? createGroup : updateGroup;
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const handledStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle") return;

    const stateKey = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === stateKey) return;

    handledStateRef.current = stateKey;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="stage" value={stage} />
      {group && <input type="hidden" name="id" value={group.id} />}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-group-name`}>Nombre del grupo</Label>
        <Input
          id={`${mode}-group-name`}
          name="name"
          defaultValue={group?.name}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-group-avatar-label`}>Letra o número</Label>
        <Input
          id={`${mode}-group-avatar-label`}
          name="avatarLabel"
          defaultValue={group?.avatarLabel}
          autoComplete="off"
          maxLength={1}
          aria-invalid={Boolean(state.fieldErrors?.avatarLabel)}
          required
        />
        {state.fieldErrors?.avatarLabel && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.avatarLabel}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Registrar grupo"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
