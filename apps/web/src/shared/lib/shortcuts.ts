import { create } from 'zustand';

export interface Shortcut {
  label: string;
  aria: string;
}

export interface Hotkey extends Shortcut {
  code: string;
  key?: string;
  shift?: boolean;
  mod?: boolean;
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export const isTextInput = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const HOTKEYS = {
  search: { label: '/', aria: '/', code: 'Slash', key: '/' },
  help: { label: '?', aria: 'Shift+?', code: 'Slash', key: '?', shift: true },
  save: { label: 'S', aria: 'S', code: 'KeyS' },
  escape: { label: 'Esc', aria: 'Escape', code: 'Escape' },
  searchMod: {
    label: isMac ? '⌘K' : 'Ctrl+K',
    aria: 'Control+K Meta+K',
    code: 'KeyK',
    mod: true,
  },
  helpMod: {
    label: isMac ? '⌘/' : 'Ctrl+/',
    aria: 'Control+/ Meta+/',
    code: 'Slash',
    key: '/',
    mod: true,
  },
  submit: {
    label: isMac ? '⌘↵' : 'Ctrl+Enter',
    aria: 'Control+Enter Meta+Enter',
    code: 'Enter',
    key: 'Enter',
    mod: true,
  },
} as const satisfies Record<string, Hotkey>;

export const GO_TO_PREFIX = { label: 'G', code: 'KeyG' } as const;

const isModPressed = (event: KeyboardEvent) => (isMac ? event.metaKey : event.ctrlKey);

export const matchesHotkey = (event: KeyboardEvent, hotkey: Hotkey) =>
  isModPressed(event) === Boolean(hotkey.mod) &&
  ((event.code === hotkey.code && event.shiftKey === Boolean(hotkey.shift)) ||
    (hotkey.key !== undefined && event.key === hotkey.key));

export const isActionableKeyEvent = (event: KeyboardEvent) =>
  !event.defaultPrevented && !event.repeat && !event.isComposing && !event.altKey;

export const isModalOpen = () =>
  Boolean(document.querySelector('dialog[open], [aria-modal="true"]'));

export const isPlainKeyEvent = (event: KeyboardEvent) =>
  isActionableKeyEvent(event) &&
  !event.ctrlKey &&
  !event.metaKey &&
  !isTextInput(event.target) &&
  !isModalOpen();

interface ShortcutsHelpState {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const useShortcutsHelpStore = create<ShortcutsHelpState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}));
