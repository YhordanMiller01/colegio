import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
  notes?: string;
}

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord | null;
}

export function EditAttendanceModal({ isOpen, onClose, attendance }: EditAttendanceModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    date: '',
    status: 'present' as 'present' | 'absent' | 'late',
    time: '',
    notes: '',
  });

  useEffect(() => {
    if (attendance) {
      setFormData({
        date: attendance.date,
        status: attendance.status,
        time: attendance.time || '',
        notes: attendance.notes || '',
      });
    }
  }, [attendance]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/attendance/${attendance?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al actualizar asistencia');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Asistencia actualizada',
        description: 'El registro se ha actualizado correctamente.',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la asistencia.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.status) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(formData);
  };

  if (!attendance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800">
        <DialogHeader>
          <DialogTitle>Editar Asistencia</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-sm font-medium">Estudiante:</p>
          <p className="text-sm text-muted-foreground">{attendance.studentName}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Fecha *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-edit-date"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Hora</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                data-testid="input-edit-time"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Estado *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger data-testid="select-edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Presente</SelectItem>
                <SelectItem value="absent">Ausente</SelectItem>
                <SelectItem value="late">Tarde</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales..."
              rows={3}
              data-testid="textarea-edit-notes"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-update">
              {mutation.isPending ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}