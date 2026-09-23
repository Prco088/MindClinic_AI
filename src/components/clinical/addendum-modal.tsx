"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddendumForm } from "./addendum-form";
import { Button } from "@/components/ui/button";

interface AddendumModalProps {
  progressNoteId: string;
  trigger?: React.ReactElement;
}

export function AddendumModal({ progressNoteId, trigger }: AddendumModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="outline" size="sm">Adicionar Adendo</Button>} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Adendo</DialogTitle>
        </DialogHeader>
        <AddendumForm 
          progressNoteId={progressNoteId} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
