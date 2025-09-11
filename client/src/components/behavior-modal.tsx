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

interface BehaviorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BehaviorModal({ isOpen, onClose }: BehaviorModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    studentId: '',
    teacherName: '',
    type: 'positive' as 'positive' | 'negative',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
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
      const response = await fetch('/api/behavior-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al crear reporte');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/behavior-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Reporte creado',
        description: 'El reporte de comportamiento se ha guardado correctamente.',
      });
      onClose();
      setFormData({
        studentId: '',
        teacherName: '',
        type: 'positive',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el reporte.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.teacherName || !formData.title || !formData.description) {
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
          <DialogTitle>Nuevo Reporte de Comportamiento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <Label className="block text-sm font-medium mb-2">Profesor/Docente *</Label>
              <Input
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="Prof. Sandra Torres"
                data-testid="input-teacher-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Tipo de Reporte *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                <SelectTrigger data-testid="select-type" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="positive" className="bg-zinc-900 text-white">Positivo</SelectItem>
                  <SelectItem value="negative" className="bg-zinc-900 text-white">Negativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Fecha *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-date"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Título del Reporte *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={formData.type === 'positive' ? 'Excelente participación' : 'Comportamiento inadecuado'}
              data-testid="input-title"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Descripción *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe detalladamente el comportamiento observado..."
              rows={4}
              data-testid="textarea-description"
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
              {mutation.isPending ? 'Guardando...' : 'Guardar Reporte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}