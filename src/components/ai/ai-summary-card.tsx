"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AiSummaryCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onGenerate: () => Promise<void>;
  disabled?: boolean;
}

export function AiSummaryCard({
  title,
  description,
  buttonText = "Gerar Resumo",
  onGenerate,
  disabled = false,
}: AiSummaryCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await onGenerate();
      toast.success("Resumo Solicitado", {
        description: "O resumo está sendo gerado pela inteligência artificial.",
      });
    } catch (error: unknown) {
      toast.error("Erro na geração", {
        description: error instanceof Error ? error.message : "Não foi possível iniciar a análise.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={disabled || isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isGenerating && <Bot className="mr-2 h-4 w-4" />}
          {isGenerating ? "Gerando..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
