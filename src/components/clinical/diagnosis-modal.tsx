"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DiagnosisForm } from "./diagnosis-form";
import { Button } from "@/components/ui/button";
import { DiagnosisFormValues } from "@/lib/validations/diagnosis";

interface DiagnosisModalProps {
  patientId: string;
  trigger?: React.ReactElement;
  initialData?: Partial<DiagnosisFormValues> & { id?: string };
  title?: string;
}

export function DiagnosisModal({ patientId, trigger, initialData, title }: DiagnosisModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="default">{title || "Novo Diagnóstico"}</Button>} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || "Novo Diagnóstico"}</DialogTitle>
        </DialogHeader>
        <DiagnosisForm 
          patientId={patientId}
          initialData={initialData}
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
