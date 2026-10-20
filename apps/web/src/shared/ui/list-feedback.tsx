import { ButtonArrow, linkButtonClassName } from './link-button';

interface ListFeedbackProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function ListFeedback({ message, actionLabel, onAction }: ListFeedbackProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-5 rounded-[22px] border border-dashed border-white/16 px-6 py-14 text-center"
    >
      <p className="text-[17px] text-viratec-muted">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className={linkButtonClassName({
          variant: 'secondary',
          size: 'md',
          className: 'cursor-pointer',
        })}
      >
        {actionLabel}
      </button>
    </div>
  );
}

interface LoadMoreButtonProps {
  onClick: () => void;
}

export function LoadMoreButton({ onClick }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-6">
      <button
        type="button"
        onClick={onClick}
        className={linkButtonClassName({
          variant: 'secondary',
          className: 'w-full cursor-pointer px-[26px] sm:w-auto',
        })}
      >
        Load more
        <ButtonArrow />
      </button>
    </div>
  );
}
