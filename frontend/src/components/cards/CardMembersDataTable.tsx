"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardMemberResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import {
  getCardMembersControllerFindCardMembersQueryKey,
  useCardMembersControllerAddMember,
  useCardMembersControllerFindCardMembers,
  useCardMembersControllerRemoveMember,
} from "@/lib/api/generated/card-members/card-members";
import { useMeQuery } from "@/hooks/auth/use-me-query";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CardMembersDataTable({
  boardId,
  cardId,
  canRemoveMembers,
}: {
  boardId: number;
  cardId: number;
  canRemoveMembers: boolean;
}) {
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const currentUserId = meQuery.data?.id;

  const cardMembersQuery = useCardMembersControllerFindCardMembers(
    boardId,
    cardId,
  );

  const rawCardMembers = cardMembersQuery.data?.status === 200
    ? cardMembersQuery.data.data
    : [];

  const cardMembers: CardMemberResponseDto[] = Array.isArray(rawCardMembers)
    ? rawCardMembers
    : [];

  const isCurrentUserMember =
    !!currentUserId &&
    cardMembers.some((member) => member.user.id === currentUserId);

  const joinCardQuery = useCardMembersControllerAddMember();
  const removeCardMemberQuery = useCardMembersControllerRemoveMember();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: getCardMembersControllerFindCardMembersQueryKey(
        boardId,
        cardId,
      ),
    });
  };

  const handleJoinLeaveCard = () => {
    if (isCurrentUserMember) {
      removeCardMemberQuery.mutate(
        {
          boardId,
          cardId,
          targetUserId: currentUserId,
        },
        {
          onSuccess: () => {
            toast.success("You left the card");
            invalidateQueries();
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    } else {
      joinCardQuery.mutate(
        {
          boardId,
          cardId,
          data: {
            userId: currentUserId!,
          },
        },
        {
          onSuccess: () => {
            toast.success("You are a member!!");
            invalidateQueries();
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    }
  };

  const handleRemoveCardMember = (userId: number) => {
    removeCardMemberQuery.mutate(
      {
        boardId,
        cardId,
        targetUserId: userId,
      },
      {
        onSuccess: () => {
          toast.success("Member has been removed");
          invalidateQueries();
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
  };

  const columns = useMemo<ColumnDef<CardMemberResponseDto>[]>(() => {
    const baseColumns: ColumnDef<CardMemberResponseDto>[] = [
      {
        id: "avatar",
        header: "Avatar",
        cell: ({ row }) => {
          const profile = row.original.user.profile;
          const name = profile?.name ?? "Member";
          const avatar = profile?.avatar;

          return (
            <div className="flex items-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-full bg-muted"
                  aria-label="Avatar placeholder"
                />
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        header: "Name",
        accessorFn: (member) => member.user.profile?.name ?? "",
        cell: ({ getValue }) => (
          <span className="block max-w-[9rem] truncate font-medium sm:max-w-[13rem]">
            {String(getValue())}
          </span>
        ),
      },
    ];

    if (canRemoveMembers) {
      baseColumns.push({
        id: "action",
        header: "Remove",
        cell: ({ row }) => {
          if (currentUserId && row.original.user.id === currentUserId) {
            return null;
          }

          const name = row.original.user.profile?.name ?? "Member";
          const userId = row.original.user.id;

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${name}`}
              onClick={() => {
                handleRemoveCardMember(userId);
              }}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          );
        },
        enableSorting: false,
        enableHiding: false,
      });
    }

    return baseColumns;
  }, [canRemoveMembers, currentUserId]);

  const table = useReactTable({
    data: cardMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[18rem] [&_td]:py-1 [&_th]:py-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No members yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {currentUserId ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              handleJoinLeaveCard();
            }}
          >
            {isCurrentUserMember ? "Leave card" : "Join card"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
