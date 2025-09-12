import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id?: string;
  title: string;
  description?: string;
  target: 'students' | 'parents' | 'both';
  questions: string[];
  isActive: boolean;
  endDate?: string;
}

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: Survey;
  mode: 'create' | 'edit';
}

export function SurveyModal({ isOpen, onClose, survey, mode }: SurveyModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Survey>({
    title: survey?.title || '',
    description: survey?.description || '',
    target: survey?.target || 'students',
    questions: survey?.questions || [''],
    isActive: survey?.isActive ?? true,
    endDate: survey?.endDate || '',
  });

  const mutation = useMutation({
    mutationFn: async (data: Survey) => {
      const url = mode === 'edit' ? `/api/surveys/${survey?.id}` : '/api/surveys';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          questions: data.questions.filter(q => q.trim() !== ''),
        }),
      });
      
      if (!response.ok) throw new Error('Error al guardar encuesta');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: mode === 'edit' ? 'Encuesta actualizada' : 'Encuesta creada',
        description: 'Los datos se han guardado correctamente.',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la encuesta.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validQuestions = formData.questions.filter(q => q.trim() !== '');
    
    if (!formData.title || validQuestions.length === 0) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el título y al menos una pregunta.',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate({
      ...formData,
      questions: validQuestions,
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, ''],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800 max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">Título de la Encuesta *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Evaluación del servicio de comedor"
              data-testid="input-title"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción del propósito de la encuesta..."
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Dirigida a *</Label>
              <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value as any })}>
                <SelectTrigger data-testid="select-target" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="students" className="bg-zinc-900 text-white">Estudiantes</SelectItem>
                  <SelectItem value="parents" className="bg-zinc-900 text-white">Padres</SelectItem>
                  <SelectItem value="both" className="bg-zinc-900 text-white">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Fecha de Finalización</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                data-testid="input-end-date"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              data-testid="switch-active"
            />
            <Label className="text-sm font-medium">
              Encuesta activa (los usuarios pueden responder)
            </Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Preguntas de la Encuesta *</Label>
              <Button type="button" onClick={addQuestion} size="sm" data-testid="button-add-question">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Pregunta
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder={`Pregunta ${index + 1}`}
                      data-testid={`input-question-${index}`}
                    />
                  </div>
                  {formData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      data-testid={`button-remove-question-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-save">
              {mutation.isPending ? 'Guardando...' : 'Guardar Encuesta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}