import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Sparkles,
  UserCheck,
  Truck,
  CheckCircle2,
  BadgeCheck,
  Copy,
  AlertOctagon,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const { t } = useTranslation();

  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: Clock,
          label: t('status.pending', 'Pending'),
        };
      case 'analyzing':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          icon: Sparkles,
          label: t('status.analyzing', 'Analyzing'),
        };
      case 'assigned':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: UserCheck,
          label: t('status.assigned', 'Assigned'),
        };
      case 'in_progress':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: Truck,
          label: t('status.in_progress', 'In Progress'),
        };
      case 'completed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          label: t('status.completed', 'Completed'),
        };
      case 'verified':
        return {
          bg: 'bg-[#EAF6EF]',
          text: 'text-[#0F5132]',
          border: 'border-[#168A5B]/30',
          icon: BadgeCheck,
          label: t('status.verified', 'Verified'),
        };
      case 'duplicate':
        return {
          bg: 'bg-stone-100',
          text: 'text-stone-700',
          border: 'border-stone-300',
          icon: Copy,
          label: t('status.duplicate', 'Duplicate'),
        };
      case 'escalated':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: AlertOctagon,
          label: t('status.escalated', 'Escalated'),
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          icon: Clock,
          label: s,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
