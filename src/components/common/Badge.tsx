import React from 'react';

export type BadgeVariant =
  | 'approved'
  | 'disapproved'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'success'
  | 'danger'
  | 'warning'
  | 'primary'
  | 'neutral'
  | string;

interface BadgeProps {
  status?: string;
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '' }) => {
  const content = children ?? status ?? '';
  const textRepresentation = typeof content === 'string' ? content : (status || '');
  const normalized = (variant || textRepresentation || 'active').toLowerCase();

  let badgeClass = 'badge ';
  if (normalized.includes('app') && !normalized.includes('dis') || normalized === 'success') {
    badgeClass += 'badge-approved';
  } else if (normalized.includes('dis') || normalized.includes('inact') || normalized.includes('block') || normalized === 'danger') {
    badgeClass += 'badge-disapproved';
  } else if (normalized.includes('pend') || normalized === 'warn' || normalized === 'warning') {
    badgeClass += 'badge-pending';
  } else if (normalized === 'primary') {
    badgeClass += 'badge-active';
  } else if (normalized === 'neutral') {
    badgeClass += 'badge-inactive';
  } else {
    badgeClass += 'badge-active';
  }

  return <span className={`${badgeClass} ${className}`}>{content}</span>;
};
