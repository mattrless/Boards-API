"use client";

import { notFound, useParams } from "next/navigation";

import { boardIdParamSchema } from "@/lib/schemas/boards/board-id-param.schema";

type RouteParams = Record<string, string | string[] | undefined>;

export function useBoardIdParam(paramName = "id"): number {
  const params = useParams<RouteParams>();
  const rawValue = params[paramName];
  const rawId = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  const parsed = boardIdParamSchema.safeParse(rawId);
  if (!parsed.success) {
    notFound();
  }

  return parsed.data;
}
