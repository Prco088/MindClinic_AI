"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, MoreHorizontal, FileEdit, Archive, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archivePatient } from "@/app/actions/patients";

type PatientData = {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
};

interface PatientsTableProps {
  patients: PatientData[];
  total: number;
  pageCount: number;
}

export function PatientsTable({ patients, total, pageCount }: PatientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleArchive = (id: string) => {
    if (confirm("Tem certeza que deseja arquivar este paciente?")) {
      startTransition(async () => {
        await archivePatient(id);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-sm gap-2">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button render={
          <Link href="/patients/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Link>
        } />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id} className={!patient.isActive ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.cpf || "-"}</TableCell>
                  <TableCell>{patient.phone || "-"}</TableCell>
                  <TableCell>
                    {patient.isActive ? (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        Arquivado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(patient.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        } />
                        <DropdownMenuItem render={
                          <Link href={`/patients/${patient.id}/edit`}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        } />
                        {patient.isActive && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(patient.id)}
                            className="text-destructive focus:text-destructive"
                            disabled={isPending}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Arquivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Basic Pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {patients.length} de {total} pacientes
        </div>
        <div className="flex gap-2">
          {pageCount > 1 && (
            <span>Página 1 de {pageCount}</span> // Note: simple pagination UI for now
          )}
        </div>
      </div>
    </div>
  );
}
