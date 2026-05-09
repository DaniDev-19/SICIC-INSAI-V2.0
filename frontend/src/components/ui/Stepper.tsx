import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between w-full max-w-4xl mx-auto mb-12 relative px-4", className)}>
      {/* Linea de progreso de fondo */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
      
      {/* Linea de progreso activa */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out" 
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        
        return (
          <div key={index} className="flex flex-col items-center relative z-10 group">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              isCompleted ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : 
              isActive ? "bg-background border-primary text-primary shadow-xl ring-4 ring-primary/10" : 
              "bg-background border-muted text-muted-foreground"
            )}>
              {isCompleted ? (
                <Check className="size-5 animate-in zoom-in duration-300" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            
            <div className="absolute top-12 flex flex-col items-center text-center w-32">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                isActive ? "text-primary" : isCompleted ? "text-foreground/80" : "text-muted-foreground/50"
              )}>
                {step.title}
              </span>
              {step.description && (
                <span className="text-[9px] text-muted-foreground mt-0.5 font-medium line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {step.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
