"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AttachmentForm } from "./attachment-form";

interface AttachmentModalProps {
  patientId: string;
  trigger: React.ReactElement;
}

export function AttachmentModal({ patientId, trigger }: AttachmentModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Anexar Documento</DialogTitle>
          <DialogDescription>
            Faça o upload de documentos, exames ou relatórios do paciente.
          </DialogDescription>
        </DialogHeader>
        
        <AttachmentForm 
          patientId={patientId} 
          onSuccess={() => setOpen(false)} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
