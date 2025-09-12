import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Users, CalendarCheck, AlertTriangle, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface DashboardStats {
  totalStudents: number;
  attendanceToday: number;
  pendingReports: number;
  notificationsSent: number;
  positiveReports: number;
  negativeReports: number;
  activeSurveys: number;
  surveyResponses: number;
}

interface WeeklyAttendanceData {
  day: string;
  percentage: number;
}

interface BehaviorByGradeData {
  grade: string;
  positive: number;
  negative: number;
}

export default function Dashboard() {
  const { token } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      return response.json();
    },
  });

  const { data: weeklyAttendance, isLoading: isLoadingWeekly } = useQuery<WeeklyAttendanceData[]>({
    queryKey: ['/api/dashboard/weekly-attendance'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/weekly-attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar datos de asistencia semanal');
      return response.json();
    },
  });

  const { data: behaviorByGrade, isLoading: isLoadingBehavior } = useQuery<BehaviorByGradeData[]>({
    queryKey: ['/api/dashboard/behavior-by-grade'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/behavior-by-grade', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar datos de comportamiento por grado');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted/20 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-students">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes Totales</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalStudents || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-attendance-today">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Asistencia Hoy</p>
                <p className="text-2xl font-bold text-foreground">{stats?.attendanceToday || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CalendarCheck className="text-green-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-pending-reports">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reportes Pendientes</p>
                <p className="text-2xl font-bold text-foreground">{stats?.pendingReports || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-amber-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-notifications-sent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notificaciones Enviadas</p>
                <p className="text-2xl font-bold text-foreground">{stats?.notificationsSent || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64">
              <div className="h-full p-4">
                {isLoadingWeekly ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
                  </div>
                ) : weeklyAttendance && weeklyAttendance.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyAttendance.map((day, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{day.day}</span>
                        <div className="flex-1 mx-2 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${day.percentage >= 90 ? 'bg-green-500' : day.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{width: `${day.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{day.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">No hay datos de asistencia disponibles</div>
                  </div>
                )}
              </div>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Comportamiento por Grado</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64">
              <div className="h-full p-4">
                {isLoadingBehavior ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-muted-foreground">Cargando datos...</div>
                  </div>
                ) : behaviorByGrade && behaviorByGrade.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {behaviorByGrade.map((grade, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{grade.grade}</span>
                          <div className="flex space-x-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-xs">{grade.positive}</span>
                            <div className="w-4 h-4 bg-red-500 rounded-full ml-2"></div>
                            <span className="text-xs">{grade.negative}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Positivos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Negativos</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">No hay datos de comportamiento disponibles</div>
                  </div>
                )}
              </div>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 hover:bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <CalendarCheck className="text-green-500 h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Registro de asistencia completado</p>
                <p className="text-xs text-muted-foreground">Sistema automático</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 hover:bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Bell className="text-blue-500 h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema de notificaciones activo</p>
                <p className="text-xs text-muted-foreground">Comunicación con padres habilitada</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 hover:bg-muted/20 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="text-primary h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Base de datos de estudiantes actualizada</p>
                <p className="text-xs text-muted-foreground">Gestión académica</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
