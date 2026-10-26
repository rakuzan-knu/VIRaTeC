import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import {
  GO_TO_PREFIX,
  HOTKEYS,
  isHotkeyAllowed,
  isSubmitHotkeyAllowed,
  matchesHotkey,
  useHotkey,
  useShortcutsHelpStore,
} from '@/shared/lib';
import { Dialog } from '@/shared/ui/dialog';

const SEQUENCE_TIMEOUT = 1500;

const GO_TO = [
  { code: 'KeyH', label: 'H', to: ROUTES.HOME, id: 'home' },
  { code: 'KeyP', label: 'P', to: ROUTES.PROJECTS, id: 'projects' },
  { code: 'KeyU', label: 'U', to: ROUTES.PUBLICATIONS, id: 'publications' },
  { code: 'KeyE', label: 'E', to: ROUTES.PEOPLE, id: 'people' },
  { code: 'KeyO', label: 'O', to: ROUTES.OPPORTUNITIES, id: 'opportunities' },
  { code: 'KeyC', label: 'C', to: ROUTES.CONTACT, id: 'contact' },
  { code: 'KeyA', label: 'A', to: ROUTES.ACCOUNT, id: 'account' },
] as const;

type GoToId = (typeof GO_TO)[number]['id'];

const SHORTCUTS_MESSAGES = defineMessages({
  en: {
    title: 'Keyboard shortcuts',
    description:
      'Single-key shortcuts are paused while you type in a field. Ctrl/⌘ shortcuts work everywhere.',
    general: 'General',
    navigation: 'Go to',
    page: 'On this page',
    forms: 'In forms',
    submit: 'Submit the form you are typing in',
    sequenceThen: 'then',
    search: 'Focus search',
    help: 'Show keyboard shortcuts',
    escape: 'Close a menu or dialog, leave a field',
    save: 'Save or unsave a project or publication',
    goTo: {
      home: 'Home',
      projects: 'Projects',
      publications: 'Publications',
      people: 'People',
      opportunities: 'Opportunities',
      contact: 'Contact',
      account: 'My account',
    } satisfies Record<GoToId, string>,
  },
  uk: {
    title: 'Гарячі клавіші',
    description:
      'Однолітерні клавіші не діють, поки ви вводите текст у поле. Комбінації з Ctrl/⌘ працюють завжди.',
    general: 'Загальні',
    navigation: 'Перейти до',
    page: 'На цій сторінці',
    forms: 'У формах',
    submit: 'Надіслати форму, яку ви заповнюєте',
    sequenceThen: 'потім',
    search: 'Перейти до пошуку',
    help: 'Показати гарячі клавіші',
    escape: 'Закрити меню чи діалог, вийти з поля',
    save: 'Зберегти проєкт чи публікацію або прибрати зі збереженого',
    goTo: {
      home: 'Головна',
      projects: 'Проєкти',
      publications: 'Публікації',
      people: 'Люди',
      opportunities: 'Можливості',
      contact: 'Контакти',
      account: 'Мій акаунт',
    } satisfies Record<GoToId, string>,
  },
});

const KBD_CLASS =
  'inline-flex min-w-7 justify-center rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-sans text-[13px] text-white';

interface ShortcutRow {
  keys: readonly string[];
  alternative?: string;
  description: string;
}

function ShortcutGroup({
  title,
  rows,
  then,
}: {
  title: string;
  rows: ShortcutRow[];
  then: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[15px] font-medium text-white">{title}</h3>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5 text-[14px]">
        {rows.map(({ keys, alternative, description }) => (
          <div key={description} className="contents">
            <dt className="flex items-center gap-1.5 text-xs text-viratec-subtle">
              {keys.map((key, index) => (
                <span key={key} className="contents">
                  {index > 0 && <span>{then}</span>}
                  <kbd className={KBD_CLASS}>{key}</kbd>
                </span>
              ))}
              {alternative && (
                <>
                  <span>/</span>
                  <kbd className={KBD_CLASS}>{alternative}</kbd>
                </>
              )}
            </dt>
            <dd className="text-viratec-muted">{description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const isOpen = useShortcutsHelpStore((state) => state.isOpen);
  const setOpen = useShortcutsHelpStore((state) => state.setOpen);
  const t = useLocalized(SHORTCUTS_MESSAGES);
  const common = useCommonMessages();

  useHotkey(HOTKEYS.helpMod, () => setOpen(true));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!matchesHotkey(event, HOTKEYS.submit) || !isSubmitHotkeyAllowed(event)) return;
      const form = event.target instanceof Element ? event.target.closest('form') : null;
      if (!form) return;
      event.preventDefault();
      form.requestSubmit();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let sequenceStartedAt = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isHotkeyAllowed(event)) return;
      const isInSequence = Date.now() - sequenceStartedAt < SEQUENCE_TIMEOUT;
      sequenceStartedAt = 0;

      if (isInSequence && !event.shiftKey) {
        const target = GO_TO.find((item) => item.code === event.code);
        if (target) {
          event.preventDefault();
          navigate(target.to);
          return;
        }
      }
      if (event.code === GO_TO_PREFIX.code && !event.shiftKey) {
        sequenceStartedAt = Date.now();
        return;
      }
      if (matchesHotkey(event, HOTKEYS.help)) {
        event.preventDefault();
        useShortcutsHelpStore.getState().setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Dialog
      open={isOpen}
      title={t.title}
      description={t.description}
      closeLabel={common.close}
      onClose={() => setOpen(false)}
    >
      <ShortcutGroup
        title={t.general}
        then={t.sequenceThen}
        rows={[
          {
            keys: [HOTKEYS.searchMod.label],
            alternative: HOTKEYS.search.label,
            description: t.search,
          },
          { keys: [HOTKEYS.helpMod.label], alternative: HOTKEYS.help.label, description: t.help },
          { keys: [HOTKEYS.escape.label], description: t.escape },
        ]}
      />
      <ShortcutGroup
        title={t.navigation}
        then={t.sequenceThen}
        rows={GO_TO.map((item) => ({
          keys: [GO_TO_PREFIX.label, item.label],
          description: t.goTo[item.id],
        }))}
      />
      <ShortcutGroup
        title={t.page}
        then={t.sequenceThen}
        rows={[{ keys: [HOTKEYS.save.label], description: t.save }]}
      />
      <ShortcutGroup
        title={t.forms}
        then={t.sequenceThen}
        rows={[{ keys: [HOTKEYS.submit.label], description: t.submit }]}
      />
    </Dialog>
  );
}
