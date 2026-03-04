"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import updateBoardNameSchema, {
  type UpdateBoardNameSchema,
} from "@/lib/schemas/boards/update-board-name.schema";

type BoardNameEditorFormProps = {
  initialName: string;
  isPending: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmitName: (name: string) => void;
};

export default function BoardNameEditorForm({
  initialName,
  isPending,
  submitError,
  onCancel,
  onSubmitName,
}: BoardNameEditorFormProps) {
  const form = useForm<UpdateBoardNameSchema>({
    resolver: zodResolver(updateBoardNameSchema),
    defaultValues: {
      name: initialName,
    },
  });

  useEffect(() => {
    form.reset({ name: initialName });
  }, [form, initialName]);

  function onSubmit(data: UpdateBoardNameSchema) {
    onSubmitName(data.name);
  }

  return (
    <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Board name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                maxLength={50}
                disabled={isPending}
                placeholder="Board name"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        {submitError ? <FieldError>{submitError}</FieldError> : null}
      </FieldGroup>
    </form>
  );
}
