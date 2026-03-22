"use client";

import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoardMemberResponseDto } from "@/lib/api/generated/boardsAPI.schemas";
import ChangeRoleButton from "@/components/boards/ChangeRoleButton";
import TransferOwnershipButton from "@/components/boards/TransferOwnershipButton";
import RemoveFromBoardButton from "@/components/boards/RemoveFromBoardButton";
import { Button } from "../ui/button";
import { useState } from "react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    currentUserId?: number;
    currentUserIsOwner?: boolean;
    boardId: number;
  }
}

type BoardMembersDataTableProps = {
  boardId: number;
  members: BoardMemberResponseDto[];
  currentUserId: number;
};

const globalFilterFn: FilterFn<BoardMemberResponseDto> = (
  row,
  _columnId,
  filterValue,
) => {
  const search = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!search) return true;

  const name = row.original.user.profile?.name ?? "";
  const email = row.original.user.email ?? "";

  return (
    name.toLowerCase().includes(search) || email.toLowerCase().includes(search)
  );
};

const columns: ColumnDef<BoardMemberResponseDto>[] = [
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
    accessorFn: (member) => member.user.profile?.name ?? "",
    header: "Name",
    cell: ({ getValue }) => (
      <span className="block max-w-[8rem] truncate font-medium sm:max-w-[12rem]">
        {String(getValue())}
      </span>
    ),
  },
  {
    id: "email",
    accessorFn: (member) => member.user.email ?? "",
    header: "Email",
    cell: ({ getValue }) => (
      <span className="block max-w-[10rem] truncate sm:max-w-[14rem]">
        {String(getValue())}
      </span>
    ),
  },
  {
    id: "boardRole",
    accessorFn: (member) =>
      member.isOwner ? "Owner" : (member.boardRole?.name ?? "Member"),
    header: "Board role",
    cell: ({ getValue }) => (
      <span className="capitalize">{String(getValue())}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const currentUserId = table.options.meta?.currentUserId;
      const currentUserIsOwner = table.options.meta?.currentUserIsOwner;
      const boardId = table.options.meta!.boardId;
      if (row.original.isOwner) return null;
      if (currentUserId && row.original.user.id === currentUserId) return null;

      return (
        <div className="flex min-w-[14rem] flex-wrap items-center gap-2">
          <ChangeRoleButton boardId={boardId} member={row.original} />
          {currentUserIsOwner ? (
            <TransferOwnershipButton boardId={boardId} member={row.original} />
          ) : null}
          <RemoveFromBoardButton boardId={boardId} member={row.original} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export default function BoardMembersDataTable({
  boardId,
  members,
  currentUserId,
}: BoardMembersDataTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const currentUserIsOwner = members.some(
    (member) => member.user.id === currentUserId && member.isOwner,
  );

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    meta: {
      currentUserId,
      currentUserIsOwner,
      boardId,
    },
    state: {
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex w-full items-center justify-center">
        <Input
          placeholder="Filter by name or email..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[42rem] [&_td]:py-1 [&_th]:py-1">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
