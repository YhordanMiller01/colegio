import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationData {
  id: string;
  subject: string;
  message: string;
  recipients: string[];
  type: string;
  status: 'sent' | 'draft' | 'failed';
  sentAt?: string;
  createdAt: string;
  readCount?: number;
  totalRecipients?: number;
}

interface ViewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationData | null;
}

export function ViewNotificationModal({ isOpen, onClose, notification }: ViewNotificationModalProps) {
  if (!notification) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500/10 text-red-600">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/10 text-orange-600">Alta</Badge>;
      case 'normal':
        return <Badge className="bg-blue-500/10 text-blue-600">Normal</Badge>;
      case 'low':
        return <Badge className="bg-gray-500/10 text-gray-600">Baja</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  const getTargetBadge = (target: string) => {
    switch (target) {
      case 'parents':
        return <Badge className="bg-green-500/10 text-green-600">Padres</Badge>;
      case 'students':
        return <Badge className="bg-blue-500/10 text-blue-600">Estudiantes</Badge>;
      case 'both':
        return <Badge className="bg-purple-500/10 text-purple-600">Ambos</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/10 text-green-600">Enviada</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/10 text-blue-600">Programada</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500/10 text-gray-600">Borrador</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const readRate = notification.readCount && notification.totalRecipients ? 
    Math.round((notification.readCount / notification.totalRecipients) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800 max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Notificación</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header con información básica */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{notification.subject}</h2>
              <div className="flex space-x-2">
                {getStatusBadge(notification.status)}
                <Badge className="bg-blue-500/10 text-blue-600">{notification.type}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {notification.sentAt && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Enviada</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.sentAt)}</p>
                  </div>
                </div>
              )}
              
              {notification.scheduledDate && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Programada para</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.scheduledDate)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Destinatarios</p>
                  <p className="text-xs text-muted-foreground capitalize">{notification.target}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenido del Mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{notification.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de entrega (solo si está enviada) */}
          {notification.status === 'sent' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{notification.totalRecipients || 0}</p>
                      <p className="text-sm text-muted-foreground">Total enviadas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{notification.readCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Leídas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{readRate}%</p>
                      <p className="text-sm text-muted-foreground">Tasa de lectura</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso de lectura</span>
                    <span>{notification.readCount || 0} de {notification.totalRecipients || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${readRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {notification.status === 'draft' && (
              <Button variant="outline" data-testid="button-edit-notification">
                Editar
              </Button>
            )}
            {notification.status === 'scheduled' && (
              <Button variant="outline" data-testid="button-send-now">
                Enviar Ahora
              </Button>
            )}
            <Button onClick={onClose} data-testid="button-close">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}