import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";

export { createColumnHelper, type ColumnDef };

export type Column<T> = {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
};

export default function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
}: Props<T>) {
  const table = useReactTable({
    data,
    columns: columns.map((col) => ({
      id: String(col.accessor),
      header: col.header,
      accessorKey: col.accessor,
      cell: col.cell
        ? (info: any) => col.cell!(info.getValue(), info.row.original)
        : (info: any) => String(info.getValue()),
    })) as ColumnDef<T>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border/60">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={[
                "transition-colors duration-150",
                onRowClick ? "cursor-pointer" : "",
                "hover:bg-muted/30",
              ].join(' ')}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-foreground text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm font-medium text-muted-foreground">
            No data found
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
