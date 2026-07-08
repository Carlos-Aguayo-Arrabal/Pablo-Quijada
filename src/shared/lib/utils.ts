import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toneClasses = {
  orange: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  yellow: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  red: 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]',
} as const
