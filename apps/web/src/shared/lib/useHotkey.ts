import { useEffect, useRef } from 'react';
import { useContentPreviewStore } from './contentPreview';
import {
  isActionableKeyEvent,
  isModalOpen,
  isPlainKeyEvent,
  matchesHotkey,
  type Hotkey,
} from './shortcuts';

const isSiteEditorOpen = () => useContentPreviewStore.getState().enabled;

export const isHotkeyAllowed = (event: KeyboardEvent) =>
  isPlainKeyEvent(event) && !isSiteEditorOpen();

export const isModHotkeyAllowed = (event: KeyboardEvent) =>
  isActionableKeyEvent(event) && !isModalOpen() && !isSiteEditorOpen();

export const isSubmitHotkeyAllowed = (event: KeyboardEvent) =>
  isActionableKeyEvent(event) &&
  !isSiteEditorOpen() &&
  (!isModalOpen() ||
    (event.target instanceof Element &&
      Boolean(event.target.closest('dialog[open], [aria-modal="true"]'))));

export function useHotkey(hotkey: Hotkey, onPress: () => boolean | void, isEnabled = true) {
  const onPressRef = useRef(onPress);

  useEffect(() => {
    onPressRef.current = onPress;
  });

  useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const isAllowed = hotkey.mod ? isModHotkeyAllowed(event) : isHotkeyAllowed(event);
      if (!isAllowed || !matchesHotkey(event, hotkey)) return;
      if (onPressRef.current() !== false) event.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, isEnabled]);
}
