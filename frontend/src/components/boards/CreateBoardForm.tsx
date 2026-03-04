"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import createBoardSchema, {
  type CreateBoardSchema,
} from "@/lib/schemas/boards/create-board.schema";
import { getErrorMessageByStatus } from "@/lib/errors/api-error";
import {
  getBoardsControllerFindMyBoardsQueryKey,
  useBoardsControllerCreate,
} from "@/lib/api/generated/boards/boards";

type CreateBoardFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateBoardForm({
  onSuccess,
  onCancel,
}: CreateBoardFormProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createBoardMutation = useBoardsControllerCreate();

  const form = useForm<CreateBoardSchema>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: CreateBoardSchema) {
    setSubmitError(null);
    createBoardMutation.mutate(
      { data: { name: data.name } },
      {
        onSuccess: (res) => {
          if (res.status === 201) {
            queryClient.invalidateQueries({
              queryKey: getBoardsControllerFindMyBoardsQueryKey(),
            });
            form.reset();
            toast.success("Board created.");
            onSuccess?.();
            return;
          }
          setSubmitError(
            getErrorMessageByStatus(res.status, {
              400: "Invalid board data.",
              403: "You do not have permission to create boards.",
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
    <form
      id="create-board-form"
      className="w-full"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="My awesome board."
                autoComplete="name"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
              disabled={createBoardMutation.isPending}
            >
              Cancel
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="submit"
            className="w-full"
            form="create-board-form"
            disabled={createBoardMutation.isPending}
          >
            {createBoardMutation.isPending ? "Creating..." : "Add"}
          </Button>
        </div>

        {submitError && <FieldError>{submitError}</FieldError>}
      </FieldGroup>
    </form>
  );
}
