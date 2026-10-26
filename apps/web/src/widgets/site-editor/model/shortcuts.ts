import { isMac, type Shortcut } from '@/shared/lib';

export { isTextInput, type Shortcut } from '@/shared/lib';

export const SHORTCUTS = {
  save: { label: isMac ? '⌘S' : 'Ctrl+S', aria: 'Control+S Meta+S' },
  undo: { label: isMac ? '⌘Z' : 'Ctrl+Z', aria: 'Control+Z Meta+Z' },
  redo: { label: isMac ? '⇧⌘Z' : 'Ctrl+Shift+Z', aria: 'Control+Shift+Z Meta+Shift+Z' },
  close: { label: 'Esc', aria: 'Escape' },
  link: { label: isMac ? '⌥' : 'Alt', aria: 'Alt' },
} as const satisfies Record<string, Shortcut>;
