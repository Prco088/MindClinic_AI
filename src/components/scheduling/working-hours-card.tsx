/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveWorkingHours, deleteWorkingHours } from "@/lib/actions/scheduling";
import { toast } from "sonner";
import { Clock, Plus, Trash2 } from "lucide-react";

export function WorkingHoursCard({ workingHours }: { workingHours: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weekday: 1,
    startTime: "08:00",
    endTime: "18:00",
    isActive: true
  });

  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveWorkingHours(formData);
      toast.success("Horário adicionado");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar horário");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteWorkingHours(id);
      toast.success("Horário removido");
    } catch (error) {
      toast.error("Erro ao remover horário");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (wh: any) => {
    setLoading(true);
    try {
      await saveWorkingHours({ ...wh, isActive: !wh.isActive });
      toast.success(wh.isActive ? "Horário desativado" : "Horário ativado");
    } catch (error) {
      toast.error("Erro ao alterar status");
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
              <Clock className="w-4 h-4" />
              Jornada de Trabalho
            </CardTitle>
            <CardDescription>Configure seus horários de atendimento</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Horário</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Dia da Semana</Label>
                  <Select 
                    value={formData.weekday.toString()} 
                    onValueChange={(v) => setFormData({ ...formData, weekday: parseInt(v || "1") })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdays.map((d, i) => (
                        <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Início</Label>
                    <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fim</Label>
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
          {workingHours.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhum horário configurado.</p>
          ) : (
            workingHours.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{weekdays[wh.weekday]}</div>
                  <div className="text-muted-foreground text-xs">{wh.startTime} - {wh.endTime}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={wh.isActive} onCheckedChange={() => handleToggleActive(wh)} disabled={loading} />
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(wh.id)} disabled={loading}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
