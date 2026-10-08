import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['control-lg', 'control-md', 'card-title', 'label', 'caption'] }],
      'border-w': ['border-control'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
