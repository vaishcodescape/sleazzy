import React from 'react';
import { RiCalendarCheckFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-8 w-8 rounded-xl', icon: 18, text: 'text-lg', gap: 'gap-2' },
  md: { box: 'h-9 w-9 rounded-xl', icon: 22, text: 'text-xl', gap: 'gap-2.5' },
  lg: { box: 'h-11 w-11 rounded-2xl', icon: 28, text: 'text-2xl', gap: 'gap-3' },
  xl: { box: 'h-14 w-14 rounded-2xl', icon: 36, text: 'text-4xl', gap: 'gap-3.5' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const { box, icon, text, gap } = sizeMap[size];

  return (
    <div className={cn('flex items-center', gap, className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center text-white drop-shadow-sm',
          'bg-linear-to-br from-indigo-500 via-violet-500 to-cyan-500',
          'shadow-lg shadow-indigo-500/25 dark:shadow-indigo-950/50',
          'ring-2 ring-white/25 dark:ring-white/15',
          box
        )}
        role="img"
        aria-label="Sleazzy logo"
      >
        <RiCalendarCheckFill size={icon} aria-hidden />
      </span>
      {showText && (
        <span
          className={cn(
            text,
            'font-extrabold tracking-tight select-none bg-clip-text text-transparent',
            'bg-linear-to-r from-brand via-purple-500 to-cyan-500',
            'dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400'
          )}
        >
          Sleazzy
        </span>
      )}
    </div>
  );
}
