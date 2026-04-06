import React from 'react'

export type ColumnDef<T> = {
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: {
  columns: ColumnDef<T>[]
  rows: T[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (nextPage: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={`whitespace-nowrap px-4 py-3 font-semibold ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="text-slate-800">
                {columns.map((c) => (
                  <td key={c.header} className={`whitespace-nowrap px-4 py-3 ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-600" colSpan={columns.length}>
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-white px-4 py-3">
        <div className="text-sm text-slate-600">
          Page {page} of {totalPages} · {totalCount} total
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

