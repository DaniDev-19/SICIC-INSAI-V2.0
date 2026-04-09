import React from 'react';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Cargando Ecosistema...",
  className = ""
}) => {
  return (
    <div className={`h-screen w-full flex items-center justify-center bg-emerald-950 relative overflow-hidden ${className}`}>

      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 flex flex-col items-center gap-6">

        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-t-4 border-emerald-400 animate-spin shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </div>


        <div className="flex flex-col items-center gap-2">
          <h2 className="text-emerald-50 font-bold tracking-[0.2em] text-xl animate-pulse">
            SICIC-INSAI
          </h2>
          <div className="h-1 w-12 bg-emerald-500/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 animate-[loading_2s_infinite]"
              style={{ width: '30%' }}
            />
          </div>
          <p className="text-emerald-50/40 text-[10px] uppercase font-semibold tracking-widest mt-2 px-4 text-center">
            {message}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
