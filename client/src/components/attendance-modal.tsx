import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceModal({ isOpen, onClose }: AttendanceModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present' as 'present' | 'absent' | 'late',
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    notes: '',
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    queryFn: async () => {
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar estudiantes');
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al registrar asistencia');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Asistencia registrada',
        description: 'El registro se ha guardado correctamente.',
      });
      onClose();
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        notes: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo registrar la asistencia.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.date || !formData.status) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(formData);
  };

  const selectedStudent = students?.find(s => s.id === formData.studentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800">
        <DialogHeader>
          <DialogTitle>Registrar Asistencia</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">Estudiante *</Label>
            <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
              <SelectTrigger data-testid="select-student" className="bg-zinc-800 text-white border-zinc-700">
                <SelectValue placeholder="Seleccionar estudiante" className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id} className="bg-zinc-900 text-white">
                    {student.firstName} {student.lastName} - {student.grade} {student.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Fecha *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Hora</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                data-testid="input-time"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Estado *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger data-testid="select-status" className="bg-zinc-800 text-white border-zinc-700">
                <SelectValue className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                <SelectItem value="present" className="bg-zinc-900 text-white">Presente</SelectItem>
                <SelectItem value="absent" className="bg-zinc-900 text-white">Ausente</SelectItem>
                <SelectItem value="late" className="bg-zinc-900 text-white">Tarde</SelectItem>
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
              data-testid="textarea-notes"
            />
          </div>

          {selectedStudent && (
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-sm font-medium">Estudiante seleccionado:</p>
              <p className="text-sm text-muted-foreground">
                {selectedStudent.firstName} {selectedStudent.lastName} - {selectedStudent.grade} {selectedStudent.section}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-save">
              {mutation.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}