"use client";

import { useState } from "react";
import { TimelineEvent } from "@/services/clinical/timeline.service";
import { TimelineView } from "./timeline-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";

interface PatientTimelineProps {
  events: TimelineEvent[];
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || event.eventType === filterType;
    return matchesSearch && matchesType;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar histórico..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(val) => setFilterType(val || "ALL")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Registros</SelectItem>
              <SelectItem value="ANAMNESIS">📝 Anamneses</SelectItem>
              <SelectItem value="PROGRESS_NOTE">📋 Evoluções</SelectItem>
              <SelectItem value="ADDENDUM">➕ Adendos</SelectItem>
              <SelectItem value="DIAGNOSIS">🧠 Diagnósticos</SelectItem>
              <SelectItem value="ATTACHMENT">📎 Documentos</SelectItem>
              <SelectItem value="CONSENT_TERM">✅ Consentimentos</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm !== "" || filterType !== "ALL") && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setSearchTerm("");
                setFilterType("ALL");
              }}
              title="Limpar Filtros"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <TimelineView events={visibleEvents} />
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
            Nenhum resultado encontrado para os filtros aplicados.
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 10)}>
              Carregar Mais
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
