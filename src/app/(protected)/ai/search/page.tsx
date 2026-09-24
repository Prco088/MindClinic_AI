import { AiSemanticSearch } from "@/components/ai/ai-semantic-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Busca Semântica | MindClinic AI",
  description: "Busca inteligente em prontuários e documentos clínicos",
};

export default function SemanticSearchPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Busca Semântica</h2>
      </div>
      
      <AiSemanticSearch />
    </div>
  );
}
