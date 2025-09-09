import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NotebookPen, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  subject: string;
  message: string;
  recipients: string[];
  type: string;
  status: 'sent' | 'draft' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export default function Notifications() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    recipients: '',
    type: '',
    subject: '',
    message: '',
  });

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar notificaciones');
      return response.json();
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          recipients: [data.recipients], // Convert to array
        }),
      });
      if (!response.ok) throw new Error('Error al crear notificación');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setFormData({ recipients: '', type: '', subject: '', message: '' });
      toast({
        title: "Notificación enviada",
        description: "La notificación se ha enviado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipients || !formData.subject || !formData.message) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    createNotificationMutation.mutate(formData);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notificaciones a Padres</h2>
          <p className="text-muted-foreground">Envía y gestiona comunicaciones con los padres de familia</p>
        </div>
        <Button data-testid="button-new-notification">
          <NotebookPen className="mr-2 h-4 w-4" />
          Nueva Notificación
        </Button>
      </div>

      {/* Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Destinatarios</Label>
                <Select value={formData.recipients} onValueChange={(value) => setFormData({ ...formData, recipients: value })}>
                  <SelectTrigger data-testid="select-recipients">
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los padres</SelectItem>
                    <SelectItem value="10A">Padres de 10° A</SelectItem>
                    <SelectItem value="9B">Padres de 9° B</SelectItem>
                    <SelectItem value="especificos">Padres específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="comportamiento">Comportamiento</SelectItem>
                    <SelectItem value="asistencia">Asistencia</SelectItem>
                    <SelectItem value="academico">Académico</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Asunto</Label>
              <Input 
                type="text" 
                placeholder="Asunto del mensaje"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                data-testid="input-subject"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-2">Mensaje</Label>
              <Textarea 
                rows={4} 
                placeholder="Escriba su mensaje aquí..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                data-testid="textarea-message"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                data-testid="button-save-draft"
              >
                Guardar Borrador
              </Button>
              <Button 
                type="submit"
                disabled={createNotificationMutation.isPending}
                data-testid="button-send-now"
              >
                {createNotificationMutation.isPending ? 'Enviando...' : 'Enviar Ahora'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-muted/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/40 rounded w-1/3"></div>
                      <div className="h-3 bg-muted/40 rounded w-2/3"></div>
                      <div className="h-3 bg-muted/40 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-muted/40 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay notificaciones enviadas.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications?.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.subject}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{notification.recipients.length} destinatarios</span>
                        <span>Tipo: {notification.type}</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={
                          notification.status === 'sent' 
                            ? "bg-green-500/10 text-green-600" 
                            : notification.status === 'failed'
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        }
                      >
                        {notification.status === 'sent' ? 'Enviado' : 
                         notification.status === 'failed' ? 'Fallido' : 'Borrador'}
                      </Badge>
                      <Button variant="ghost" size="sm" data-testid={`button-view-${notification.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
