import { ContextChip } from './types';

export function composeMessage(message: string, chips: ContextChip[]): string {
  let finalMessage = message;

  if (chips.length > 0) {
    const contextBlock = chips
      .map(chip => `[${chip.label}]:\n${chip.text}`)
      .join('\n\n');

    finalMessage = `Context:\n---\n${contextBlock}\n---\n\n${message}`;
  }

  // Escape all actual newlines to the literal string "\n"
  // so the entire payload is sent to the terminal on a single line.
  return finalMessage.replace(/\r?\n/g, '\\n');
}
