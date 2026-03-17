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
    iconClassName
}) => {
    return (
        <div
            title={title}
            onClick={onClick}
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow-xl shadow-green-100 transition-all",
                className
            )}
        >
            <div className={cn("flex flex-col space-y-1.5 p-6", headerClassName)}>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <Icon className={cn("size-5 text-muted-foreground", iconClassName)} />
                    )}
                    {title && (
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">
                            {title}
                        </h3>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className={cn("p-6 pt-0", contentClassName)}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Card;
