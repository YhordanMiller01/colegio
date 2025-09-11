import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id?: string;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  status: 'active' | 'inactive' | 'graduated';
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  mode: 'create' | 'edit';
}

export function StudentModal({ isOpen, onClose, student, mode }: StudentModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Student>({
    studentId: student?.studentId || '',
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    grade: student?.grade || '',
    section: student?.section || '',
    status: student?.status || 'active',
    parentName: student?.parentName || '',
    parentEmail: student?.parentEmail || '',
    parentPhone: student?.parentPhone || '',
  });

  useEffect(() => {
    setFormData({
      studentId: student?.studentId || '',
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      grade: student?.grade || '',
      section: student?.section || '',
      status: student?.status || 'active',
      parentName: student?.parentName || '',
      parentEmail: student?.parentEmail || '',
      parentPhone: student?.parentPhone || '',
    });
  }, [student, mode, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: Student) => {
      const url = mode === 'edit' ? `/api/students/${student?.id}` : '/api/students';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Error al guardar estudiante');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: mode === 'edit' ? 'Estudiante actualizado' : 'Estudiante creado',
        description: 'Los datos se han guardado correctamente.',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el estudiante.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.firstName || !formData.lastName || !formData.grade || !formData.section || !formData.parentName || !formData.parentEmail) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">ID Estudiante *</Label>
              <Input
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="EST001"
                data-testid="input-student-id"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger data-testid="select-student-status" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="active" className="bg-zinc-900 text-white">Activo</SelectItem>
                  <SelectItem value="inactive" className="bg-zinc-900 text-white">Inactivo</SelectItem>
                  <SelectItem value="graduated" className="bg-zinc-900 text-white">Graduado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Nombres *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Lina"
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Apellidos *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Orozco"
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Grado *</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                <SelectTrigger data-testid="select-grade" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue placeholder="Seleccionar grado" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="6°" className="bg-zinc-900 text-white">6°</SelectItem>
                  <SelectItem value="7°" className="bg-zinc-900 text-white">7°</SelectItem>
                  <SelectItem value="8°" className="bg-zinc-900 text-white">8°</SelectItem>
                  <SelectItem value="9°" className="bg-zinc-900 text-white">9°</SelectItem>
                  <SelectItem value="10°" className="bg-zinc-900 text-white">10°</SelectItem>
                  <SelectItem value="11°" className="bg-zinc-900 text-white">11°</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Sección *</Label>
              <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                <SelectTrigger data-testid="select-section" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue placeholder="Seleccionar sección" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="A" className="bg-zinc-900 text-white">A</SelectItem>
                  <SelectItem value="B" className="bg-zinc-900 text-white">B</SelectItem>
                  <SelectItem value="C" className="bg-zinc-900 text-white">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Nombre del Padre/Tutor *</Label>
            <Input
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="María García"
              data-testid="input-parent-name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Email del Padre/Tutor *</Label>
              <Input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="maria.garcia@email.com"
                data-testid="input-parent-email"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Teléfono del Padre/Tutor</Label>
              <Input
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+57 300 123 4567"
                data-testid="input-parent-phone"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-save">
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}