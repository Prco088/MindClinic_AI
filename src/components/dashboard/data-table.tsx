import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "./empty-state"
import { FileQuestion } from "lucide-react"

interface DataTableProps<T> {
  columns: { header: string; accessorKey: keyof T | string; render?: (item: T) => React.ReactNode }[]
  data: T[]
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({ columns, data, emptyTitle = "Nenhum registro", emptyDescription = "Não encontramos dados para exibir aqui." }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="border rounded-md">
        <EmptyState 
          icon={FileQuestion} 
          title={emptyTitle} 
          description={emptyDescription} 
        />
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              {columns.map((col, j) => (
                <TableCell key={j}>
                  {col.render ? col.render(item) : String(item[col.accessorKey as keyof T] || "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
