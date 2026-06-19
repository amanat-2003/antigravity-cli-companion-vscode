import { ContextChip } from './types';

export function composeMessage(message: string, chips: ContextChip[]): string {
  if (chips.length === 0) {
    return message;
  }

  const contextBlock = chips
    .map(chip => `[${chip.label}]:\n${chip.text}`)
    .join('\n\n');

  return `Context:\n---\n${contextBlock}\n---\n\n${message}`;
}
