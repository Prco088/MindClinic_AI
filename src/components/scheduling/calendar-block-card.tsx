/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCalendarBlock, deleteCalendarBlock } from "@/lib/actions/scheduling";
import { toast } from "sonner";
import { Ban, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function CalendarBlockCard({ blocks }: { blocks: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: "",
    reason: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: format(new Date(), "HH:00"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: format(new Date(Date.now() + 3600000), "HH:00"),
  }));

  const handleSave = async () => {
    if (!formData.title) return toast.error("Título é obrigatório");
    
    setLoading(true);
    try {
      const startsAt = new Date(`${formData.startDate}T${formData.startTime}`);
      const endsAt = new Date(`${formData.endDate}T${formData.endTime}`);
      
      await saveCalendarBlock({
        title: formData.title,
        reason: formData.reason,
        startsAt,
        endsAt
      });
      toast.success("Bloqueio adicionado");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar bloqueio");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteCalendarBlock(id);
      toast.success("Bloqueio removido");
    } catch (error) {
      toast.error("Erro ao remover bloqueio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Bloqueios
            </CardTitle>
            <CardDescription>Horários indisponíveis</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Bloqueio</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Título / Motivo *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Almoço, Reunião" />
                </div>
                <div className="grid gap-2">
                  <Label>Descrição (opcional)</Label>
                  <Input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data Inicial</Label>
                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hora Inicial</Label>
                    <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data Final</Label>
                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hora Final</Label>
                    <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhum bloqueio.</p>
          ) : (
            blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{block.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(block.startsAt), "dd/MM HH:mm")} - {format(new Date(block.endsAt), "HH:mm")}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(block.id)} disabled={loading}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
