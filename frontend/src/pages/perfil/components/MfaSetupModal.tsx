import React, { useState, useEffect } from 'react';
import { useSetupMfa, useEnableMfa, useDisableMfa, useRegenerateBackupCodes } from '../../../hooks/use-mfa';
import { ShieldCheck, ShieldAlert, Copy, Check, Download, Loader2, X, ArrowRight, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface MfaSetupModalProps {
  isOpen: boolean;
  isMfaEnabled: boolean;
  actionType?: 'setup' | 'disable' | 'regenerate';
  onClose: () => void;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ isOpen, isMfaEnabled, actionType = 'setup', onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mfaData, setMfaData] = useState<{ secret: string; otpauthUrl: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Estados para Desactivar MFA
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  // Estado para Regenerar Códigos de Respaldo
  const [regenerateCode, setRegenerateCode] = useState('');

  const setupMutation = useSetupMfa();
  const enableMutation = useEnableMfa();
  const disableMutation = useDisableMfa();
  const regenerateMutation = useRegenerateBackupCodes();

  useEffect(() => {
    if (isOpen && !isMfaEnabled && actionType === 'setup' && !mfaData) {
      setupMutation.mutate(undefined, {
        onSuccess: (res) => {
          if (res.data) {
            setMfaData(res.data);
          }
        },
      });
    }
  }, [isOpen, isMfaEnabled, actionType]);

  const handleResetModal = () => {
    setStep(1);
    setMfaData(null);
    setVerificationCode('');
    setBackupCodes([]);
    setDisablePassword('');
    setDisableCode('');
    setRegenerateCode('');
    onClose();
  };

  if (!isOpen) return null;

  const handleEnableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaData || !verificationCode.trim()) return;

    enableMutation.mutate(
      { secret: mfaData.secret, token: verificationCode.trim() },
      {
        onSuccess: (res) => {
          setBackupCodes(res.data.backupCodes || []);
          setStep(3);
        },
      }
    );
  };

  const handleDisableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword || !disableCode) return;

    disableMutation.mutate(
      { currentPassword: disablePassword, token: disableCode.trim() },
      {
        onSuccess: () => {
          handleResetModal();
        },
      }
    );
  };

  const handleRegenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regenerateCode.trim()) return;

    regenerateMutation.mutate(
      { token: regenerateCode.trim() },
      {
        onSuccess: (res) => {
          setBackupCodes(res.data.backupCodes || []);
          setStep(3);
        },
      }
    );
  };

  const copySecret = () => {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret);
      setCopiedSecret(true);
      toast.success('Clave secreta copiada al portapapeles');
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedCodes(true);
      toast.success('8 códigos de respaldo copiados al portapapeles');
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const textContent = `CÓDIGOS DE RESPALDO DE EMERGENCIA MFA - SICIC INSAI\nGenerado: ${new Date().toLocaleString()}\n\n` +
      backupCodes.map((code, idx) => `${idx + 1}. ${code}`).join('\n') +
      `\n\n* Guarde estos 8 códigos en un lugar seguro. Cada código solo puede ser utilizado una vez en el login en lugar del token de 6 dígitos.`;
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codigos-respaldo-mfa-insai-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo .txt descargado con éxito');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 p-6 sm:p-8">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${actionType === 'disable' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {actionType === 'disable' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {actionType === 'disable'
                  ? 'Desactivar Autenticación MFA'
                  : actionType === 'regenerate' && step !== 3
                    ? 'Regenerar Códigos de Respaldo'
                    : 'Configurar Autenticación MFA (2FA)'}
              </h3>
              <p className="text-xs text-slate-400">
                {actionType === 'disable'
                  ? 'Deshabilitar segundo factor de seguridad'
                  : actionType === 'regenerate' && step !== 3
                    ? 'Generar 8 nuevos códigos de emergencia'
                    : `Paso ${step} de 3 — Protección con TOTP`}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL 1: DESACTIVAR MFA */}
        {actionType === 'disable' ? (
          <form onSubmit={handleDisableSubmit} className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Al desactivar MFA, su cuenta estará protegida únicamente por su contraseña. Para confirmar la desactivación, ingrese su contraseña actual y el código de su app autenticadora.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña Actual</label>
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Código Autenticador (TOTP de 6 dígitos)</label>
              <input
                type="text"
                required
                maxLength={9}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm tracking-widest font-mono text-center focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleResetModal}
                className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={disableMutation.isPending}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
              >
                {disableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Desactivación'}
              </button>
            </div>
          </form>
        ) : actionType === 'regenerate' && step !== 3 ? (
          /* MODAL 2: REGENERAR CÓDIGOS DE RESPALDO */
          <form onSubmit={handleRegenerateSubmit} className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs leading-relaxed flex items-start space-x-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                Al regenerar códigos, se crearán **8 nuevos códigos de respaldo** de 8 dígitos y los anteriores quedarán invalidados. Ingrese su código de 6 dígitos actual de Google Authenticator para continuar.
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 text-center">Código Autenticador Actual (TOTP)</label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={regenerateCode}
                onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-400 font-mono text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleResetModal}
                className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={regenerateMutation.isPending || regenerateCode.length < 6}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition disabled:opacity-50 cursor-pointer"
              >
                {regenerateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Generar Nuevos Códigos</span>}
              </button>
            </div>
          </form>
        ) : (
          /* MODAL 3: ACTIVACIÓN MFA EN PASOS */
          <div>
            {/* PASO 1: Escaneo de Código QR */}
            {step === 1 && (
              <div className="space-y-5">
                {setupMutation.isPending || !mfaData ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-xs text-slate-400">Generando secreto de autenticación y código QR...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Escanee el código QR desde su aplicación autenticadora (Google Authenticator, Authy, Microsoft Authenticator).
                    </p>

                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-700 shadow-inner w-fit mx-auto">
                      <img src={mfaData.qrCodeUrl} alt="MFA QR Code" className="w-48 h-48 object-contain rounded-lg" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        ¿No puede escanear? Ingrese esta clave manualmente:
                      </label>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-400">
                        <span className="truncate pr-2 tracking-wider">{mfaData.secret}</span>
                        <button
                          type="button"
                          onClick={copySecret}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Copiar Clave"
                        >
                          {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleResetModal}
                        className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PASO 2: Confirmación con Token de 6 Dígitos */}
            {step === 2 && (
              <form onSubmit={handleEnableSubmit} className="space-y-5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingrese el código de 6 dígitos que muestra su aplicación autenticadora para confirmar la vinculación de su cuenta.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 text-center">Código de Verificación (TOTP)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-400 font-mono text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>
                  <button
                    type="submit"
                    disabled={enableMutation.isPending || verificationCode.length < 6}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {enableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Activar y Confirmar</span>}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: Muestra de Códigos de Respaldo */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">¡8 Códigos de Respaldo de Emergencia!</span>
                    Guarde estos 8 códigos únicos en un lugar seguro. Podrá utilizarlos para acceder si pierde acceso a su app autenticadora. Cada uno funciona solo una vez.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center text-xs text-slate-200">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 tracking-widest text-emerald-400 font-bold">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={copyBackupCodes}
                    className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    {copiedCodes ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCodes ? '¡8 Códigos Copiados!' : 'Copiar Códigos'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-900/20"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Descargar (.txt)</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-right">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
