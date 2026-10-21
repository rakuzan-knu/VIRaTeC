import { Fragment, type CSSProperties } from 'react';

interface SplitWordsProps {
  text: string;
  offset?: number;
}

export function countWords(text: string): number {
  return text.split(' ').length;
}

export function SplitWords({ text, offset = 0 }: SplitWordsProps) {
  return text.split(' ').map((word, index) => (
    <Fragment key={index}>
      {index > 0 && ' '}
      <span className="split-word">
        <span style={{ '--word-index': offset + index } as CSSProperties}>{word}</span>
      </span>
    </Fragment>
  ));
}
