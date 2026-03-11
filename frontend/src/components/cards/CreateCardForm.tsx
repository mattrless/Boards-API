"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessageByStatus } from "@/lib/errors/api-error";
import {
  getCardsControllerFindAllQueryKey,
  useCardsControllerCreate,
} from "@/lib/api/generated/cards/cards";
import createCardSchema, {
  CreateCardSchema,
} from "@/lib/schemas/cards/create-card.schema";

type CreateCardFormProps = {
  boardId: number;
  listId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateCardForm({
  boardId,
  listId,
  onSuccess,
  onCancel,
}: CreateCardFormProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createCardMutation = useCardsControllerCreate();

  const form = useForm<CreateCardSchema>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(data: CreateCardSchema) {
    setSubmitError(null);
    createCardMutation.mutate(
      {
        boardId,
        listId,
        data: { title: data.title },
      },
      {
        onSuccess: (res) => {
          if (res.status === 201) {
            queryClient.invalidateQueries({
              queryKey: getCardsControllerFindAllQueryKey(boardId, listId),
            });
            form.reset();
            toast.success("Card created.");
            onSuccess?.();
            return;
          }
          setSubmitError(
            getErrorMessageByStatus(res.status, {
              400: "Invalid data.",
              403: "You do not have permission to create cards.",
            }),
          );
        },
        onError: () => {
          setSubmitError("Something went wrong. Please try again.");
        },
      },
    );
  }

  return (
    <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            <div className="flex items-start gap-2">
              <Field
                data-invalid={fieldState.invalid}
                className="min-w-0 flex-1"
              >
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  maxLength={50}
                  autoFocus
                  placeholder="My awesome card"
                  autoComplete="off"
                  className="h-8 text-base font-semibold"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
              <div className="flex items-center gap-1 pt-0.5">
                <Button
                  type="submit"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Add new list"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Cancel create list"
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
