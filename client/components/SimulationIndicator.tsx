import React from 'react';
import { Badge } from './ui/badge';
import { Activity, Pause } from 'lucide-react';

interface SimulationIndicatorProps {
  isRunning: boolean;
  className?: string;
}

export default function SimulationIndicator({ isRunning, className = "" }: SimulationIndicatorProps) {
  if (!isRunning) return null;

  return (
    <Badge variant="secondary" className={`animate-pulse ${className}`}>
      <Activity className="w-3 h-3 mr-1" />
      Live Simulation
    </Badge>
  );
}
