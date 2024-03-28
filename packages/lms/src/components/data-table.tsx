"use client";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DisplayColumnDef,
  TableOptions,
  TableState,
  flexRender,
  getCoreRowModel,
  createColumnHelper as ogCreateColumnHelper,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useRef, useState } from "react";
import { Separator } from "./separator";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useResizeObserver from "use-resize-observer";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData, TValue> {
    fixedWidth?: boolean;
  }
}

interface DataTableProps<TData>
  extends Pick<
      TableOptions<TData>,
      | "columns"
      | "enableRowSelection"
      | "getRowId"
      | "onPaginationChange"
      | "onRowSelectionChange"
      | "rowCount"
    >,
    Pick<Partial<TableState>, "rowSelection" | "pagination"> {
  data?: TData[];
  emptyMessage?: string;
  href?: (row: TData) => string;
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string;
}

export function DataTable<TData>({
  columns,
  data = [],
  emptyMessage,
  enableRowSelection,
  getRowId,
  href,
  loading,
  onPaginationChange,
  onRowClick,
  onRowSelectionChange,
  pagination,
  rowClassName,
  rowCount,
  rowSelection = {},
}: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    columns,
    data,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    manualPagination: true,
    onPaginationChange: (...args) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (onPaginationChange) {
        onPaginationChange(...args);
      }
    },
    onRowSelectionChange,
    rowCount,
    state: {
      pagination,
      rowSelection,
    },
  });
  const [hasScrollbar, setHasScrollbar] = useState(false);

  const { height, width } = useResizeObserver({
    ref: scrollContainerRef,
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      setHasScrollbar(
        scrollContainerRef.current.scrollHeight >
          scrollContainerRef.current.clientHeight
      );
    }
  }, [height, width]);

  return (
    <div className="flex-1 flex flex-col h-full rounded-md border overflow-y-hidden">
      <div className="border-b">
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className={cn("flex", hasScrollbar && "pr-4")}
          >
            {headerGroup.headers.map((header) => {
              const fixedWidth = header.column.columnDef.meta?.["fixedWidth"];
              return (
                <div
                  key={header.id}
                  className={cn(
                    "truncate p-2 uppercase relative text-xs",
                    fixedWidth ? "flex-none" : "min-w-0 flex-1"
                  )}
                  style={
                    fixedWidth
                      ? {
                          width: `${header.column.getSize()}px`,
                        }
                      : {
                          flexBasis: `${header.column.getSize()}px`,
                        }
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-12 w-12 text-primary" />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex flex-col flex-1 overflow-y-auto min-h-0"
        >
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const rowContent = row.getVisibleCells().map((cell) => {
                const fixedWidth = cell.column.columnDef.meta?.["fixedWidth"];

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "truncate p-2 relative",
                      fixedWidth ? "flex-none" : "min-w-0 flex-1"
                    )}
                    style={
                      fixedWidth
                        ? {
                            width: `${cell.column.getSize()}px`,
                          }
                        : {
                            flexBasis: `${cell.column.getSize()}px`,
                          }
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                );
              });

              return (
                <Fragment key={row.id}>
                  {href ? (
                    <Link
                      className={cn(
                        "flex hover:bg-accent",
                        rowClassName && rowClassName(row.original)
                      )}
                      data-state={row.getIsSelected() && "selected"}
                      href={href(row.original)}
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row.original);
                        }
                      }}
                    >
                      {rowContent}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex",
                        rowClassName && rowClassName(row.original),
                        onRowClick && "hover:bg-accent"
                      )}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => {
                        if (onRowClick) {
                          onRowClick(row.original);
                        }
                      }}
                      role={onRowClick ? "button" : undefined}
                    >
                      {rowContent}
                    </div>
                  )}
                  <Separator />
                </Fragment>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
      {pagination && rowCount ? (
        <div className="border-t flex items-center justify-between p-4">
          <div className="text-sm">
            Showing {pagination.pageIndex * pagination.pageSize + 1} -{" "}
            {pagination.pageIndex * pagination.pageSize + data.length} of{" "}
            {rowCount}
          </div>
          <div className="flex space-x-1">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              variant="ghost"
            >
              <ChevronFirstIcon />
            </Button>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              variant="ghost"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              variant={"ghost"}
            >
              <ChevronRightIcon />
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              variant={"ghost"}
            >
              <ChevronLastIcon />
            </Button>
          </div>
        </div>
      ) : typeof rowCount === "number" ? (
        <div className="border-t flex items-center p-4">
          <div className="text-sm">Total: {rowCount}</div>
        </div>
      ) : null}
    </div>
  );
}

export function createColumnHelper<TData>() {
  return {
    ...ogCreateColumnHelper<TData>(),
    selectColumn: {
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center h-full"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        </div>
      ),
      header: ({ table }) => (
        <div className="flex items-center justify-center h-full">
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
          />
        </div>
      ),
      id: "select",
      meta: {
        fixedWidth: true,
      },
      size: 32,
    } satisfies DisplayColumnDef<TData>,
  };
}
