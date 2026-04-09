import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
  I: string;
  a: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ I, a, children, fallback = null }) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(a, I)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Can;
