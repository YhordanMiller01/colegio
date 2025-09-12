import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, User, GraduationCap, Calendar, CheckCircle } from 'lucide-react';

interface Student {
  id: string;
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

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  if (!student) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/10 text-red-600">Inactivo</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-500/10 text-blue-600">Graduado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Estadísticas simuladas para demostración
  const mockStats = {
    attendanceRate: 95,
    positiveReports: 8,
    negativeReports: 2,
    totalClasses: 120,
    presentDays: 114,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800 max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Estudiante</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header con información básica */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {getInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                {getStatusBadge(student.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>ID: {student.studentId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Grado: {student.grade} - Sección {student.section}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del padre/tutor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Padre/Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.parentName}</p>
                    <p className="text-sm text-muted-foreground">Padre/Tutor</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.parentEmail}</p>
                    <p className="text-sm text-muted-foreground">Email de contacto</p>
                  </div>
                </div>
                {student.parentPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{student.parentPhone}</p>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas académicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{mockStats.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Asistencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{mockStats.presentDays}</p>
                    <p className="text-xs text-muted-foreground">Días presentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{mockStats.positiveReports}</p>
                    <p className="text-xs text-muted-foreground">Reportes (+)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{mockStats.negativeReports}</p>
                    <p className="text-xs text-muted-foreground">Reportes (-)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historial reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Excelente participación en clase</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Reporte positivo - Prof. Ana García</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 2 días</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Asistencia registrada</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Presente - 08:00 AM</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hoy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // HTML escape function to prevent XSS
                const escapeHtml = (text: string | undefined | null): string => {
                  if (!text) return '';
                  return text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
                };

                // Generate and print report
                const printContent = `
                  <html>
                    <head>
                      <title>Reporte del Estudiante - ${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</title>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .info { margin: 20px 0; }
                        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                        @media print { body { margin: 0; } }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>Reporte del Estudiante</h1>
                        <h2>${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</h2>
                        <p>ID: ${student.studentId} | Grado: ${student.grade} - Secci\u00f3n ${student.section}</p>
                        <p>Estado: ${student.status === 'active' ? 'Activo' : student.status === 'graduated' ? 'Graduado' : 'Inactivo'}</p>
                      </div>
                      
                      <div class="info">
                        <h3>Información del Padre/Tutor</h3>
                        <p><strong>Nombre:</strong> ${escapeHtml(student.parentName)}</p>
                        <p><strong>Email:</strong> ${escapeHtml(student.parentEmail)}</p>
                        <p><strong>Teléfono:</strong> ${escapeHtml(student.parentPhone) || 'No proporcionado'}</p>
                      </div>
                      
                      <div class="stats">
                        <div class="stat-card">
                          <h4>Estadísticas Académicas</h4>
                          <p>Asistencia: ${mockStats.attendanceRate}%</p>
                          <p>Días presentes: ${mockStats.presentDays}/${mockStats.totalClasses}</p>
                        </div>
                        <div class="stat-card">
                          <h4>Comportamiento</h4>
                          <p>Reportes Positivos: ${mockStats.positiveReports}</p>
                          <p>Reportes Negativos: ${mockStats.negativeReports}</p>
                        </div>
                      </div>
                      
                      <div class="info">
                        <p><small>Reporte generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</small></p>
                      </div>
                    </body>
                  </html>
                `;
                
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.onload = () => {
                    printWindow.print();
                    printWindow.close();
                  };
                }
              }}
              data-testid="button-print-report"
            >
              Imprimir Reporte
            </Button>
            <Button onClick={onClose} data-testid="button-close">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}