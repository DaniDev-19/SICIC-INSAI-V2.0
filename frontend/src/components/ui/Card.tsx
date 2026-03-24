import React from 'react';
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface CardProps {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    icon?: LucideIcon;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    iconClassName?: string;
    value?: string | number;
    trend?: {
        value: string | number;
        label: string;
        positive?: boolean;
        neutral?: boolean;
    };
    loading?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    title,
    description,
    icon: Icon,
    onClick,
    className,
    headerClassName,
    contentClassName,
    iconClassName,
    value,
    trend,
    loading
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-100/20 active:scale-[0.98]",
                onClick && "cursor-pointer",
                className
            )}
        >
            <div className={cn("flex flex-col p-6 space-y-2", headerClassName)}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 transition-colors group-hover:bg-primary/10",
                            iconClassName
                        )}>
                            {Icon && (
                                <Icon className="size-4" />
                            )}
                        </div>
                        <div className="space-y-1">
                            {title && (
                                <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-1">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex-1">
                        {!loading && trend && (
                            <div className="flex flex-col gap-1">
                                <span className={cn(
                                    "inline-flex w-fit text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border shadow-sm transition-colors",
                                    trend.positive && "bg-green-500 text-white border-green-600 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
                                    !trend.positive && !trend.neutral && "bg-red-500 text-white border-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
                                    trend.neutral && "bg-slate-700 text-white border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700"
                                )}>
                                    {trend.value}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold opacity-70">
                                    {trend.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end">
                        {loading ? (
                            <div className="h-9 w-16 animate-pulse rounded bg-muted/60" />
                        ) : (
                            value !== undefined && (
                                <span className="text-xl font-black tracking-tighter text-foreground leading-none">
                                    {value}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>

            {children && (
                <div className={cn("px-6 pb-6 pt-0", contentClassName)}>
                    {children}
                </div>
            )}

            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
        </div>
    );
};

export default Card;
