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
  cell?: (props: { row: TData; index: number }) => ReactNode
  sortable?: boolean
  filterable?: boolean
}

export type DataTableProps<TData> = {
  columns: DataTableColumn<TData>[]
  data: TData[]
  pageSize?: number
  extraClass?: string
  disableClientPagination?: boolean
  isLoading?: boolean
  emptyMessage?: string
  loadingMessage?: string
  onRowClick?: (row: TData, index: number) => void
  rowClassName?: string | ((row: TData, index: number) => string)
  getRowKey?: (row: TData, index: number) => string | number
  paginationPosition?: "top" | "bottom" | "both"
  showPageInfo?: boolean
}

type PaginationProps = {
  pageIndex: number
  pageCount: number
  canPreviousPage: boolean
  canNextPage: boolean
  currentPageDataLength: number
  totalDataLength: number
  showPageInfo: boolean
  onPageChange: (newPageIndex: number) => void
}

const Pagination = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  currentPageDataLength,
  totalDataLength,
  showPageInfo,
  onPageChange,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      {showPageInfo && (
        <span className="text-sm text-muted-foreground">
          Mostrando {currentPageDataLength} de {totalDataLength} registros
          {pageCount > 1 && ` · Página ${pageIndex + 1} de ${pageCount}`}
        </span>
      )}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  extraClass,
  isLoading = false,
  disableClientPagination = false,
  emptyMessage = "No hay datos disponibles",
  loadingMessage = "Cargando...",
  onRowClick,
  rowClassName,
  getRowKey,
  paginationPosition = "bottom",
  showPageInfo = true,
}: DataTableProps<TData>) {
  const [pageIndex, setPageIndex] = useState(0)

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const pageCount = useMemo(() => {
    if (disableClientPagination) return 1
    return Math.max(1, Math.ceil(safeData.length / pageSize))
  }, [disableClientPagination, safeData.length, pageSize])

  const currentPageData = useMemo(() => {
    if (disableClientPagination) return safeData
    return safeData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [disableClientPagination, safeData, pageIndex, pageSize])

  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(Math.max(0, Math.min(newPageIndex, pageCount - 1)))
  }

  const renderPagination = () => {
    if (disableClientPagination) return null

    return (
      <Pagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        currentPageDataLength={currentPageData.length}
        totalDataLength={safeData.length}
        showPageInfo={showPageInfo}
        onPageChange={handlePageChange}
      />
    )
  }

  return (
    <div className={`flex flex-col ${extraClass}`}>
      {paginationPosition === "top" && renderPagination()}

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
                    <span>{loadingMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 bg-background3 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map((row, rowIndex) => {
                const key = getRowKey
                  ? getRowKey(row, rowIndex)
                  : ((row as { id?: string | number }).id ??
                    `row-${pageIndex * pageSize + rowIndex}`)

                const className =
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName

                return (
                  <TableRow
                    key={key}
                    className={`odd:bg-background3 even:bg-background4 hover:bg-background5 ${className || ""}`}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={
                          column.id ??
                          String(column.accessorKey ?? column.header)
                        }
                        className={column.className}
                      >
                        {column.cell
                          ? column.cell({ row, index: rowIndex })
                          : column.accessorKey
                            ? String(row[column.accessorKey] ?? "—")
                            : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {paginationPosition === "bottom" && renderPagination()}
      {paginationPosition === "both" && renderPagination()}
    </div>
  )
}
