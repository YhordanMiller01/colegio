import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a DisciCole",
      });
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-blue-100/80 via-white/90 to-indigo-200/80">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
              <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-full shadow-lg bg-gradient-to-br from-primary/80 to-secondary/60 border-4 border-white">
                <img
                  src="/logo-colegio.png"
                  alt="Logo Colegio"
                  className="h-20 w-20 object-contain rounded-full drop-shadow-md bg-white p-1"
                />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">DisciCole</h1>
              <p className="text-muted-foreground mt-2 text-base">Sistema de Gestión Estudiantil</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo Electrónico
              </Label>
              <Input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@colegio.edu.co"
                required
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </Label>
              <Input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary hover:text-primary/80">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
