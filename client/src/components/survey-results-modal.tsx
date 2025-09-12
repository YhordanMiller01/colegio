import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Utilidad para exportar resultados como CSV
function exportSurveyResultsToCSV(survey: Survey, mockResponses: any[]) {
  let csv = `Encuesta:,${survey.title}\n`;
  csv += `Descripción:,${survey.description || ''}\n`;
  csv += `Público objetivo:,${survey.target}\n`;
  csv += `Respuestas recibidas:,${survey.responseCount}\n\n`;
  survey.questions.forEach((question, idx) => {
    csv += `Pregunta ${idx + 1}:,${question}\n`;
    if (mockResponses[idx]) {
      csv += 'Opción,Respuestas\n';
      Object.entries(mockResponses[idx].responses).forEach(([option, count]) => {
        csv += `${option},${count}\n`;
      });
    }
    csv += '\n';
  });
  // Descargar el archivo
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resultados_encuesta_${survey.title.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart3, Users, Calendar, Target } from 'lucide-react';

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

interface SurveyResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey | null;
}

export function SurveyResultsModal({ isOpen, onClose, survey }: SurveyResultsModalProps) {
  if (!survey) return null;

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
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  // Simulated response data for demonstration
  const mockResponses = [
    { question: 'Pregunta 1', responses: { 'Muy satisfecho': 45, 'Satisfecho': 30, 'Neutral': 15, 'Insatisfecho': 10 } },
    { question: 'Pregunta 2', responses: { 'Sí': 70, 'No': 20, 'Tal vez': 10 } },
    { question: 'Pregunta 3', responses: { 'Excelente': 25, 'Bueno': 35, 'Regular': 25, 'Malo': 15 } },
  ];

  const participationRate = survey.target === 'both' ? 
    Math.round((survey.responseCount / 200) * 100) : // Assuming 200 total for both
    Math.round((survey.responseCount / 100) * 100);   // Assuming 100 total for single target

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl bg-zinc-900 text-white bg-opacity-100 shadow-2xl border border-zinc-800 max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resultados de la Encuesta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Survey Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{survey.title}</span>
                {getTargetBadge(survey.target)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{survey.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{survey.responseCount} respuestas</p>
                    <p className="text-xs text-muted-foreground">Total recibidas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{participationRate}%</p>
                    <p className="text-xs text-muted-foreground">Tasa de participación</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">{survey.target}</p>
                    <p className="text-xs text-muted-foreground">Público objetivo</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {survey.isActive ? 'Activa' : 'Finalizada'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {survey.endDate ? `Hasta ${formatDate(survey.endDate)}` : 'Sin fecha límite'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions and Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preguntas y Respuestas</h3>
            
            {survey.questions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {index + 1}. {question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockResponses[index] ? (
                    <div className="space-y-3">
                      {Object.entries(mockResponses[index].responses).map(([option, count]) => (
                        <div key={option} className="flex items-center justify-between">
                          <span className="text-sm">{option}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(count / survey.responseCount) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ChartContainer className="h-64">
                      <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Gráfico de respuestas para: "{question}"
                        </p>
                      </div>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Aspectos Positivos
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Alta participación en la encuesta con {survey.responseCount} respuestas recibidas.
                    La mayoría de participantes muestran satisfacción general.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Áreas de Mejora
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Se identificaron oportunidades de mejora en comunicación y algunos procesos.
                    Considerar implementar las sugerencias recibidas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              data-testid="button-export-results"
              onClick={() => exportSurveyResultsToCSV(survey, mockResponses)}
            >
              Exportar Resultados
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