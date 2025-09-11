import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { StudentModal } from '@/components/student-modal';

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
  createdAt: string;
}

export default function Students() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { data: students, isLoading } = useQuery<Student[]>({
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

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al eliminar estudiante');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Estudiante eliminado",
        description: "El estudiante se ha eliminado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante.",
        variant: "destructive",
      });
    },
  });

  // Filter students based on search and filter criteria
  const filteredStudents = students?.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || selectedGrade === '' || student.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || selectedStatus === '' || student.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Inactivo</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Graduado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const currentPage = 1;
  const itemsPerPage = 10;
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Estudiantes</h2>
          <p className="text-muted-foreground">Administra la información de los estudiantes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={() => {
              setSelectedStudent(undefined);
              setModalMode('create');
              setIsModalOpen(true);
            }}
            data-testid="button-new-student"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Buscar</Label>
              <Input 
                type="text" 
                placeholder="Nombre o ID del estudiante"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger data-testid="select-grade">
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
              <Label className="block text-sm font-medium mb-2">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="graduated">Graduado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGrade('all');
                  setSelectedStatus('all');
                }}
                data-testid="button-clear-filters"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
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
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || selectedGrade || selectedStatus 
                  ? 'No se encontraron estudiantes que coincidan con los filtros.' 
                  : 'No hay estudiantes registrados.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Estudiante</th>
                      <th className="text-left p-4 font-medium">Grado</th>
                      <th className="text-left p-4 font-medium">Estado</th>
                      <th className="text-left p-4 font-medium">Padre/Tutor</th>
                      <th className="text-left p-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {student.firstName[0]}{student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.firstName} {student.lastName}</p>
                              <p className="text-sm text-muted-foreground">ID: {student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{student.grade} {student.section}</td>
                        <td className="p-4">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">{student.parentName}</p>
                            <p className="text-xs text-muted-foreground">{student.parentEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-view-${student.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setModalMode('edit');
                                setIsModalOpen(true);
                              }}
                              data-testid={`button-edit-${student.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              data-testid={`button-delete-${student.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} estudiantes
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    data-testid="button-previous-page"
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    data-testid="button-page-1"
                  >
                    1
                  </Button>
                  {totalPages > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-page-2"
                    >
                      2
                    </Button>
                  )}
                  {totalPages > 2 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-page-3"
                    >
                      3
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        mode={modalMode}
      />
    </div>
  );
}
