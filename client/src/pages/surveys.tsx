import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Vote, CheckCircle, PieChart, BarChart3, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  title: string;
  description?: string;
  target: 'students' | 'parents' | 'both';
  questions: string[];
  isActive: boolean;
  endDate?: string;
  responseCount: number;
  createdAt: string;
}

export default function Surveys() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: surveys, isLoading } = useQuery<Survey[]>({
    queryKey: ['/api/surveys'],
    queryFn: async () => {
      const response = await fetch('/api/surveys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar encuestas');
      return response.json();
    },
  });

  const activeSurveys = surveys?.filter(s => s.isActive).length || 0;
  const totalResponses = surveys?.reduce((sum, s) => sum + s.responseCount, 0) || 0;
  const participationRate = surveys?.length ? Math.round((totalResponses / (surveys.length * 100)) * 100) : 0;

  const getTargetBadge = (target: string) => {
    switch (target) {
      case 'students':
        return <Badge className="bg-blue-500/10 text-blue-600">Estudiantes</Badge>;
      case 'parents':
        return <Badge className="bg-green-500/10 text-green-600">Padres</Badge>;
      case 'both':
        return <Badge className="bg-purple-500/10 text-purple-600">Ambos</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(dateString));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Encuestas</h2>
          <p className="text-muted-foreground">Crea y gestiona encuestas para estudiantes y padres</p>
        </div>
        <Button data-testid="button-new-survey">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Encuesta
        </Button>
      </div>

      {/* Survey Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-active-surveys">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encuestas Activas</p>
                <p className="text-2xl font-bold text-foreground">{activeSurveys}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Vote className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-survey-responses">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Respuestas Recibidas</p>
                <p className="text-2xl font-bold text-foreground">{totalResponses}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-participation-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Participación</p>
                <p className="text-2xl font-bold text-foreground">{participationRate}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <PieChart className="text-blue-500 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>Encuestas Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-muted/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/40 rounded w-1/3"></div>
                      <div className="h-3 bg-muted/40 rounded w-2/3"></div>
                      <div className="h-3 bg-muted/40 rounded w-1/2"></div>
                    </div>
                    <div className="space-x-2">
                      <div className="h-8 bg-muted/40 rounded w-24 inline-block"></div>
                      <div className="h-8 bg-muted/40 rounded w-8 inline-block"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : surveys?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay encuestas disponibles.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {surveys?.filter(survey => survey.isActive).map((survey) => (
                <div key={survey.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{survey.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {survey.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Dirigida a:</span>
                          {getTargetBadge(survey.target)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{survey.responseCount} respuestas</span>
                        </div>
                        {survey.endDate && (
                          <div className="text-sm text-muted-foreground">
                            <span>Finaliza: {formatDate(survey.endDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-view-results-${survey.id}`}
                      >
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Ver Resultados
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-edit-survey-${survey.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {surveys?.filter(survey => !survey.isActive).map((survey) => (
                <div key={survey.id} className="p-4 hover:bg-muted/20 transition-colors opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{survey.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {survey.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Dirigida a:</span>
                          {getTargetBadge(survey.target)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{survey.responseCount} respuestas</span>
                        </div>
                        <Badge variant="outline">Finalizada</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-view-results-${survey.id}`}
                      >
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Ver Resultados
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
