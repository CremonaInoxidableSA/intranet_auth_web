"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export type DataTableColumn<TData> = {
  accessorKey?: keyof TData
  header?: string
  id?: string
  className?: string
  cell?: (props: { row: TData }) => ReactNode
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[]
  data: TData[]
  pageSize?: number
  extraClass?: string
  disableClientPagination?: boolean
  isLoading?: boolean
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  extraClass,
  isLoading = false,
  disableClientPagination = false,
}: DataTableProps<TData>) {
  const [pageIndex, setPageIndex] = useState(0)

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const pageCount = disableClientPagination
    ? 1
    : Math.max(1, Math.ceil(safeData.length / pageSize))
  const currentPageData = useMemo(
    () =>
      disableClientPagination
        ? safeData
        : safeData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [disableClientPagination, safeData, pageIndex, pageSize]
  )

  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1

  return (
    <div className={`flex flex-col ${extraClass}`}>
      <div className="overflow-hidden rounded border">
        <Table>
          <TableHeader className="bg-background2">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={
                    column.id ??
                    String(column.accessorKey ?? column.header ?? "")
                  }
                  className={`border border-background2 bg-background2 ${column.className ?? ""}`}
                >
                  {column.header ?? ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 bg-background3 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-base font-medium">
                    <Spinner />
                    <span>Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 bg-background3 text-center"
                >
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map((row, rowIndex) => (
                <TableRow
                  key={
                    (row as { id?: string | number }).id ??
                    `row-${pageIndex * pageSize + rowIndex}`
                  }
                  className="odd:bg-background3 even:bg-background4 hover:bg-background5"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={
                        column.id ?? String(column.accessorKey ?? column.header)
                      }
                      className={column.className}
                    >
                      {column.cell
                        ? column.cell({ row })
                        : column.accessorKey
                          ? String(row[column.accessorKey] ?? "—")
                          : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!disableClientPagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPageIndex((prev) => Math.min(prev + 1, pageCount - 1))
            }
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
