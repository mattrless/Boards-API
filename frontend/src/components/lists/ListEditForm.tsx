"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import updateListSchema, {
  type UpdateListSchema,
} from "@/lib/schemas/lists/update-board-name.schema";

type ListEditFormProps = {
  initialTitle: string;
  isPending: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmitName: (name: string) => void;
};

export default function ListEditForm({
  initialTitle,
  isPending,
  submitError,
  onCancel,
  onSubmitName,
}: ListEditFormProps) {
  const form = useForm<UpdateListSchema>({
    resolver: zodResolver(updateListSchema),
    defaultValues: {
      title: initialTitle,
    },
  });

  useEffect(() => {
    form.reset({ title: initialTitle });
  }, [form, initialTitle]);

  function onSubmit(data: UpdateListSchema) {
    onSubmitName(data.title);
  }

  return (
    <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            <div className="flex items-start gap-2">
              <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1">
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  maxLength={50}
                  disabled={isPending}
                  autoFocus
                  placeholder="My awesome list"
                  autoComplete="off"
                  className="h-8 text-base font-semibold"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
              <div className="flex items-center gap-1 pt-0.5">
                <Button
                  type="submit"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Save list title"
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Cancel rename"
                  disabled={isPending}
                  onClick={onCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {submitError ? <FieldError>{submitError}</FieldError> : null}
          </>
        )}
      />
    </form>
  );
}
