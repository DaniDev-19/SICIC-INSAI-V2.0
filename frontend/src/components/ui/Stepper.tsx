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
  const stepCount = Math.max(steps.length, 1);
  const halfStepPercent = 100 / (2 * stepCount);
  const maxProgressPercent = 100 - (100 / stepCount);
  const progressRatio = stepCount > 1 ? currentStep / (stepCount - 1) : 0;
  const activeWidthPercent = progressRatio * maxProgressPercent;

  return (
    <div className={cn("relative flex items-start justify-between w-full max-w-4xl mx-auto px-1 sm:px-4", className)}>
      {/* Linea de progreso de fondo conectando los centros de los circulos */}
      <div
        className="absolute top-[18px] sm:top-[20px] h-0.5 bg-muted -translate-y-1/2 z-0 pointer-events-none"
        style={{
          left: `${halfStepPercent}%`,
          right: `${halfStepPercent}%`,
        }}
      />

      {/* Linea de progreso activa */}
      <div
        className="absolute top-[18px] sm:top-[20px] h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out pointer-events-none"
        style={{
          left: `${halfStepPercent}%`,
          width: `${activeWidthPercent}%`,
        }}
      />

      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex flex-col items-center relative z-10 group flex-1 min-w-0 px-0.5 sm:px-1">
            <div
              className={cn(
                "size-9 sm:size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 bg-background",
                isCompleted
                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                  : isActive
                  ? "bg-background border-primary text-primary shadow-lg ring-4 ring-primary/10"
                  : "border-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="size-4 sm:size-5 animate-in zoom-in duration-300" />
              ) : (
                <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
              )}
            </div>

            <div className="mt-1.5 sm:mt-2 flex flex-col items-center text-center w-full min-w-0">
              <span
                className={cn(
                  "text-[8px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 text-center break-words max-w-full leading-tight line-clamp-2",
                  isActive
                    ? "text-primary font-black"
                    : isCompleted
                    ? "text-foreground/80 font-bold"
                    : "text-muted-foreground/60 font-semibold"
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="hidden sm:block text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 font-medium line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
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
