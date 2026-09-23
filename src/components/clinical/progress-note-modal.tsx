"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProgressNoteForm } from "./progress-note-form";
import { Button } from "@/components/ui/button";

interface ProgressNoteModalProps {
  patientId: string;
  trigger?: React.ReactElement;
}

export function ProgressNoteModal({ patientId, trigger }: ProgressNoteModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="default">Nova Evolução</Button>} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Evolução Clínica</DialogTitle>
        </DialogHeader>
        <ProgressNoteForm 
          patientId={patientId} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
