import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { type AxiosError } from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import type { LoginResponse } from '@/types/auth';

interface ForceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  instanceId: string;
  onSuccess: (response: LoginResponse) => void;
}

export default function ForceLoginModal({
  isOpen,
  onClose,
  email,
  instanceId,
  onSuccess,
}: ForceLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Debe ingresar su contraseña para confirmar la desconexión.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authService.login({
        email: email.trim(),
        instanceId,
        password: password.trim(),
        force: true,
      });

      onSuccess(res);
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg = error.response?.data?.message || 'Error al validar las credenciales';
      setErrorMessage(msg);
      toast.error('No se pudo forzar el inicio de sesión', {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] glass-effect border-amber-500/20 max-w-md rounded-3xl p-0 text-foreground shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-col items-center text-center space-y-2 p-6 pb-4 border-b border-border/30 shrink-0">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner mb-1">
            <ShieldAlert className="size-8 text-amber-500 animate-pulse" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Sesión Activa Detectada
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            Ya existe una sesión abierta con esta cuenta. Para desconectar la sesión previa e ingresar en este navegador, confirma tu contraseña actual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/90 leading-relaxed">
              <span className="font-semibold block text-amber-500">Medida de Seguridad:</span>
              Si tienes habilitada la verificación en dos pasos (2FA), se solicitará tu código de seguridad en el siguiente paso para autorizar la desconexión.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-foreground ml-1">
              Contraseña de Confirmación
            </label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground group-focus-within/input:text-amber-500 transition-all" />
              <Input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Ingresa tu contraseña actual"
                className="pl-12 pr-12 bg-background/50 border-input text-foreground h-12 rounded-2xl transition-all"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {errorMessage && (
              <p className="text-xs text-destructive font-medium ml-2 animate-in fade-in duration-200">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-1/2 h-11 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full sm:w-1/2 h-11 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                </>
              ) : (
                'Desconectar e Ingresar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
