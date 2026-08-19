import React from 'react';
import type { PriorityLevel } from '../../types/report';
import { useTranslation } from 'react-i18next';
import { AlertCircle, AlertTriangle, Flame, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useTranslation();

  const config = {
    low: {
      bg: 'bg-[#2E8B57]/10',
      text: 'text-[#2E8B57]',
      border: 'border-[#2E8B57]/30',
      icon: Info,
      label: t('priority.low', 'LOW'),
    },
    medium: {
      bg: 'bg-[#D89B18]/10',
      text: 'text-[#B27B08]',
      border: 'border-[#D89B18]/30',
      icon: AlertCircle,
      label: t('priority.medium', 'MEDIUM'),
    },
    high: {
      bg: 'bg-[#E56B2F]/10',
      text: 'text-[#E56B2F]',
      border: 'border-[#E56B2F]/30',
      icon: AlertTriangle,
      label: t('priority.high', 'HIGH'),
    },
    critical: {
      bg: 'bg-[#D64545]/10',
      text: 'text-[#D64545]',
      border: 'border-[#D64545]/30',
      icon: Flame,
      label: t('priority.critical', 'CRITICAL'),
    },
  }[priority] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: Info,
    label: priority.toUpperCase(),
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-md border tracking-wider uppercase ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} stroke-[2.5]`} />}
      <span>{config.label}</span>
    </span>
  );
};
