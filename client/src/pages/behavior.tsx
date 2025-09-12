import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { BehaviorModal } from '@/components/behavior-modal';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
}

interface BehaviorReport {
  id: string;
  studentId: string;
  teacherName: string;
  type: 'positive' | 'negative';
  title: string;
  description: string;
  date: string;
  createdAt: string;
  student: Student;
}

export default function Behavior() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative' | 'pending'>('all');

  const { data: behaviorReports, isLoading } = useQuery<BehaviorReport[]>({
    queryKey: ['/api/behavior-reports'],
    queryFn: async () => {
      const response = await fetch('/api/behavior-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar reportes');
      return response.json();
    },
  });

  const positiveReports = behaviorReports?.filter(r => r.type === 'positive').length || 0;
  const negativeReports = behaviorReports?.filter(r => r.type === 'negative').length || 0;
  const pendingReports = behaviorReports?.filter(r => r.type === 'negative' && new Date().getTime() - new Date(r.createdAt).getTime() > 24 * 60 * 60 * 1000).length || 0; // Reportes negativos de más de 24 horas

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours === 1) return 'Hace 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reportes de Comportamiento</h2>
          <p className="text-muted-foreground">Gestiona reportes positivos y negativos de estudiantes</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          data-testid="button-new-report"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          data-testid="button-filter-all"
        >
          Todos
        </Button>
        <Button 
          variant={filterType === 'positive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('positive')}
          data-testid="button-filter-positive"
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          Positivos
        </Button>
        <Button 
          variant={filterType === 'negative' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('negative')}
          data-testid="button-filter-negative"
        >
          <ThumbsDown className="mr-1 h-4 w-4" />
          Negativos
        </Button>
        <Button 
          variant={filterType === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('pending')}
          data-testid="button-filter-pending"
        >
          <Clock className="mr-1 h-4 w-4" />
          Pendientes
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-positive-reports">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <ThumbsUp className="text-green-500 h-6 w-6" />
            </div>
            <h3 className="font-semibold text-green-600">Reportes Positivos</h3>
            <p className="text-2xl font-bold mt-1">{positiveReports}</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-negative-reports">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <ThumbsDown className="text-red-500 h-6 w-6" />
            </div>
            <h3 className="font-semibold text-red-600">Reportes Negativos</h3>
            <p className="text-2xl font-bold mt-1">{negativeReports}</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-pending-reports">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="text-amber-500 h-6 w-6" />
            </div>
            <h3 className="font-semibold text-amber-600">Pendientes</h3>
            <p className="text-2xl font-bold mt-1">{pendingReports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                  <div className="w-10 h-10 bg-muted/40 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/40 rounded w-1/4"></div>
                    <div className="h-3 bg-muted/40 rounded w-3/4"></div>
                    <div className="h-3 bg-muted/40 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : behaviorReports?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay reportes de comportamiento disponibles.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {behaviorReports?.filter(report => {
                if (filterType === 'all') return true;
                if (filterType === 'pending') {
                  // Show negative reports older than 24 hours as pending
                  return report.type === 'negative' && 
                         new Date().getTime() - new Date(report.createdAt).getTime() > 24 * 60 * 60 * 1000;
                }
                return report.type === filterType;
              }).map((report) => (
                <div key={report.id} className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`w-10 h-10 ${report.type === 'positive' ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full flex items-center justify-center`}>
                    {report.type === 'positive' ? (
                      <ThumbsUp className="text-green-500 h-5 w-5" />
                    ) : (
                      <ThumbsDown className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{report.student.firstName} {report.student.lastName}</h4>
                      <Badge 
                        className={
                          report.type === 'positive' 
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        }
                      >
                        {report.type === 'positive' ? 'Positivo' : 'Negativo'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1">{report.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>{report.student.grade} {report.student.section}</span>
                      <span>Prof. {report.teacherName}</span>
                      <span>{formatTimeAgo(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BehaviorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
