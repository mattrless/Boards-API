"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { CardSummaryResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card } from "../ui/card";
import {
  CardInformationSchema,
  cardInformationSchema,
} from "@/lib/schemas/cards/update-entire-card.schema";
import { useBoardIdParam } from "@/hooks/boards/use-board-id-param";
import { useUpdateCardMutation } from "@/hooks/cards/use-update-card-mutation";
import GenerateDescriptionButton from "./GenerateDescriptionButton";
import CheckDescriptionGrammarButton from "./CheckDescriptionGrammarButton";

export default function CardInformationForm({
  listId,
  card,
}: {
  listId: number;
  card: CardSummaryResponseDto;
}) {
  const boardId = useBoardIdParam();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CardInformationSchema>({
    resolver: zodResolver(cardInformationSchema),
    defaultValues: {
      title: card.title ?? "",
      description: card.description ?? "",
    },
    mode: "onChange",
  });

  const updateCardMutation = useUpdateCardMutation({ boardId, listId });
  const titleValue = form.watch("title");
  const descriptionValue = form.watch("description");

  useEffect(() => {
    if (!isEditing) {
      form.reset({
        title: card.title ?? "",
        description: card.description ?? "",
      });
    }
  }, [card.description, card.title, form, isEditing]);

  function handleStartEdit() {
    if (!isEditing) setIsEditing(true);
  }

  function handleCancel() {
    form.reset({
      title: card.title ?? "",
      description: card.description ?? "",
    });
    setIsEditing(false);
  }

  function onSubmit(data: CardInformationSchema) {
    updateCardMutation.mutate(
      {
        boardId,
        listId,
        cardId: card.id,
        data,
      },
      {
        onSuccess: () => {
          handleCancel();
        },
      },
    );
  }

  return (
    <Card className="p-3 sm:p-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="gap-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  readOnly={!isEditing}
                  aria-disabled={!isEditing}
                  onClick={handleStartEdit}
                  tabIndex={isEditing ? 0 : -1}
                  className={!isEditing ? "cursor-text opacity-100" : undefined}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  {isEditing ? (
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                      <GenerateDescriptionButton
                        title={titleValue}
                        onGenerateDescription={(description) => {
                          form.setValue("description", description, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      <CheckDescriptionGrammarButton
                        description={descriptionValue}
                        onCheckDescriptionGrammar={(description) => {
                          form.setValue("description", description, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  readOnly={!isEditing}
                  aria-disabled={!isEditing}
                  onClick={handleStartEdit}
                  tabIndex={isEditing ? 0 : -1}
                  className={`border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-28 w-full min-w-0 resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    !isEditing ? "cursor-text opacity-100" : ""
                  }`}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {isEditing ? (
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Save</Button>
            </div>
          ) : null}
        </FieldGroup>
      </form>
    </Card>
  );
}
