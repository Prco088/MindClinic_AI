"use client";

import { useState } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { executeSemanticSearchAction } from "@/app/(protected)/ai/actions";

type SemanticSearchResult = {
  id: string;
  sourceType: string;
  sourceId: string;
  content: string;
  patientId: string;
  patientName: string;
  distance: number;
};

export function AiSemanticSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const typeFilter = filter === "ALL" ? undefined : filter;
      const data = await executeSemanticSearchAction(query, 10, typeFilter);
      setResults(data);
    } catch (error) {
      console.error(error);
      // fallback
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Busca Semântica</CardTitle>
          <CardDescription>
            Busque por informações clínicas em prontuários e documentos utilizando linguagem natural.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Ex: Paciente com histórico de ansiedade e insônia..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={filter} onValueChange={(val) => setFilter(val || "ALL")}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo de Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as Origens</SelectItem>
                  <SelectItem value="ANAMNESIS">Anamnese</SelectItem>
                  <SelectItem value="PROGRESS_NOTE">Evolução</SelectItem>
                  <SelectItem value="DIAGNOSIS">Diagnóstico</SelectItem>
                  <SelectItem value="ATTACHMENT">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resultados da Busca</h3>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm text-muted-foreground">Tente utilizar outros termos na sua busca.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((result) => {
                const similarityScore = Math.max(0, 100 - (result.distance * 50)).toFixed(1); // Rough conversion of cosine distance to % match
                return (
                  <Card key={result.id}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{result.patientName}</CardTitle>
                        <CardDescription className="text-xs font-mono uppercase mt-1">
                          {result.sourceType} • SCORE: {similarityScore}%
                        </CardDescription>
                      </div>
                      <a href={`/patients/${result.patientId}`}>
                        <Button variant="outline" size="sm">
                          Ver Paciente
                        </Button>
                      </a>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {result.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
