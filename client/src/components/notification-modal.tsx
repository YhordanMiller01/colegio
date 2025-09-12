import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipients: 'todos',
    type: 'informativo',
    sendNow: false,
    scheduledDate: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: data.subject,
          message: data.message,
          recipients: [data.recipients], // Convert to array format
          type: data.type,
        }),
      });
      
      if (!response.ok) throw new Error('Error al crear notificación');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Notificación creada',
        description: formData.sendNow ? 'La notificación se ha enviado inmediatamente.' : 'La notificación se ha programado correctamente.',
      });
      onClose();
      setFormData({
        subject: '',
        message: '',
        recipients: 'todos',
        type: 'informativo',
        sendNow: false,
        scheduledDate: '',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear la notificación.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa el asunto y mensaje.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.sendNow && !formData.scheduledDate) {
      toast({
        title: 'Fecha requerida',
        description: 'Si no envías ahora, debes programar una fecha.',
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
          <DialogTitle>Nueva Notificación</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">Asunto *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Reunión de padres de familia"
              data-testid="input-subject"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Mensaje *</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Escriba el contenido de la notificación..."
              rows={4}
              data-testid="textarea-message"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Destinatarios *</Label>
              <Select value={formData.recipients} onValueChange={(value) => setFormData({ ...formData, recipients: value })}>
                <SelectTrigger data-testid="select-recipients" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="todos" className="bg-zinc-900 text-white">Todos los padres</SelectItem>
                  <SelectItem value="10A" className="bg-zinc-900 text-white">Padres de 10° A</SelectItem>
                  <SelectItem value="9B" className="bg-zinc-900 text-white">Padres de 9° B</SelectItem>
                  <SelectItem value="especificos" className="bg-zinc-900 text-white">Padres específicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger data-testid="select-type" className="bg-zinc-800 text-white border-zinc-700">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="informativo" className="bg-zinc-900 text-white">Informativo</SelectItem>
                  <SelectItem value="comportamiento" className="bg-zinc-900 text-white">Comportamiento</SelectItem>
                  <SelectItem value="asistencia" className="bg-zinc-900 text-white">Asistencia</SelectItem>
                  <SelectItem value="academico" className="bg-zinc-900 text-white">Académico</SelectItem>
                  <SelectItem value="evento" className="bg-zinc-900 text-white">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.sendNow}
                onCheckedChange={(checked) => setFormData({ ...formData, sendNow: checked })}
                data-testid="switch-send-now"
              />
              <Label className="text-sm font-medium">
                Enviar inmediatamente
              </Label>
            </div>

            {!formData.sendNow && (
              <div>
                <Label className="block text-sm font-medium mb-2">Fecha programada</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  data-testid="input-scheduled-date"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} data-testid="button-send">
              {mutation.isPending ? 'Enviando...' : (formData.sendNow ? 'Enviar Ahora' : 'Programar Notificación')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}