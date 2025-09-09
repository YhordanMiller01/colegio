import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AttendanceModal } from '@/components/attendance-modal';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
  student: Student;
}

export default function Attendance() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: attendanceRecords, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/attendance', selectedDate, selectedGrade, selectedSection],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedGrade) params.append('grade', selectedGrade);
      if (selectedSection) params.append('section', selectedSection);
      
      const response = await fetch(`/api/attendance?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar asistencia');
      return response.json();
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; date: string; status: 'present' | 'absent' | 'late'; time?: string }) => {
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
      toast({
        title: "Asistencia registrada",
        description: "El registro de asistencia se ha guardado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la asistencia.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Presente</Badge>;
      case 'absent':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Ausente</Badge>;
      case 'late':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Tarde</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Control de Asistencia</h2>
          <p className="text-muted-foreground">Registra y consulta la asistencia de estudiantes</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          data-testid="button-register-attendance"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Asistencia
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Fecha</Label>
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="input-date-filter"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger data-testid="select-grade-filter">
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  <SelectItem value="6°">6°</SelectItem>
                  <SelectItem value="7°">7°</SelectItem>
                  <SelectItem value="8°">8°</SelectItem>
                  <SelectItem value="9°">9°</SelectItem>
                  <SelectItem value="10°">10°</SelectItem>
                  <SelectItem value="11°">11°</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Sección</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger data-testid="select-section-filter">
                  <SelectValue placeholder="Todas las secciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
                }}
                data-testid="button-filter"
              >
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asistencia del Día</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-10 h-10 bg-muted/20 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/20 rounded w-1/4"></div>
                    <div className="h-3 bg-muted/20 rounded w-1/6"></div>
                  </div>
                  <div className="h-6 bg-muted/20 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : attendanceRecords?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay registros de asistencia para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Estudiante</th>
                    <th className="text-left p-4 font-medium">Grado</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Hora</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords?.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {record.student.firstName[0]}{record.student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.student.firstName} {record.student.lastName}</p>
                            <p className="text-sm text-muted-foreground">ID: {record.student.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{record.student.grade} {record.student.section}</td>
                      <td className="p-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="p-4">{record.time || '--'}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-${record.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
