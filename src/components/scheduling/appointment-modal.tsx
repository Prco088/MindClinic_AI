/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { saveAppointment, deleteAppointment } from "@/lib/actions/scheduling";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  appointmentType: z.nativeEnum(AppointmentType),
  status: z.nativeEnum(AppointmentStatus),
  startDate: z.string().min(1, "Data inicial é obrigatória"),
  startTime: z.string().min(1, "Hora inicial é obrigatória"),
  endDate: z.string().min(1, "Data final é obrigatória"),
  endTime: z.string().min(1, "Hora final é obrigatória"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  initialDates?: { start: Date; end: Date } | null;
  patients: { id: string; fullName: string }[];
}

export function AppointmentModal({ open, onOpenChange, appointment, initialDates, patients }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentType: "IN_PERSON",
      status: "SCHEDULED",
    }
  });

  useEffect(() => {
    if (open) {
      if (appointment) {
        form.reset({
          id: appointment.id,
          patientId: appointment.patientId,
          title: appointment.title || "",
          description: appointment.description || "",
          location: appointment.location || "",
          appointmentType: appointment.appointmentType || "IN_PERSON",
          status: appointment.status || "SCHEDULED",
          startDate: format(new Date(appointment.start), "yyyy-MM-dd"),
          startTime: format(new Date(appointment.start), "HH:mm"),
          endDate: format(new Date(appointment.end), "yyyy-MM-dd"),
          endTime: format(new Date(appointment.end), "HH:mm"),
          notes: appointment.notes || "",
        });
      } else if (initialDates) {
        form.reset({
          patientId: "",
          title: "",
          description: "",
          location: "",
          appointmentType: "IN_PERSON",
          status: "SCHEDULED",
          startDate: format(initialDates.start, "yyyy-MM-dd"),
          startTime: format(initialDates.start, "HH:mm"),
          endDate: format(initialDates.end, "yyyy-MM-dd"),
          endTime: format(initialDates.end, "HH:mm"),
          notes: "",
        });
      } else {
        form.reset({
          patientId: "",
          title: "",
          description: "",
          location: "",
          appointmentType: "IN_PERSON",
          status: "SCHEDULED",
          startDate: format(new Date(), "yyyy-MM-dd"),
          startTime: format(new Date(), "HH:00"),
          endDate: format(new Date(), "yyyy-MM-dd"),
          endTime: format(new Date(Date.now() + 3600000), "HH:00"),
          notes: "",
        });
      }
    }
  }, [open, appointment, initialDates, form]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const startsAt = new Date(`${data.startDate}T${data.startTime}`);
      const endsAt = new Date(`${data.endDate}T${data.endTime}`);
      const durationMinutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
      
      await saveAppointment({
        id: data.id,
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        location: data.location,
        appointmentType: data.appointmentType,
        status: data.status,
        startsAt,
        endsAt,
        durationMinutes,
        notes: data.notes
      });
      
      toast.success(data.id ? "Consulta atualizada!" : "Consulta agendada!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar consulta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment?.id) return;
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;
    
    setLoading(true);
    try {
      await deleteAppointment(appointment.id);
      toast.success("Consulta excluída");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao excluir consulta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Consulta" : "Nova Consulta"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Altere os detalhes da consulta abaixo." : "Preencha os dados para agendar uma nova consulta."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Paciente *</Label>
              <Select 
                value={form.watch("patientId")} 
                onValueChange={(val) => form.setValue("patientId", val || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.patientId && (
                <p className="text-sm text-red-500">{form.formState.errors.patientId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Inicial</Label>
                <Input type="date" {...form.register("startDate")} />
              </div>
              <div className="grid gap-2">
                <Label>Hora Inicial</Label>
                <Input type="time" {...form.register("startTime")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Final</Label>
                <Input type="date" {...form.register("endDate")} />
              </div>
              <div className="grid gap-2">
                <Label>Hora Final</Label>
                <Input type="time" {...form.register("endTime")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Consulta</Label>
                <Select 
                  value={form.watch("appointmentType")} 
                  onValueChange={(val: any) => form.setValue("appointmentType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PERSON">Presencial</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="HOME_VISIT">Domiciliar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select 
                  value={form.watch("status")} 
                  onValueChange={(val: any) => form.setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Agendado</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="NO_SHOW">Faltou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Anotações (opcional)</Label>
              <Textarea {...form.register("notes")} placeholder="Observações sobre o agendamento" />
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between pt-4 border-t">
            {appointment ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Excluir
              </Button>
            ) : <div></div>}
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
