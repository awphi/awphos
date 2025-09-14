export interface TerminalLine {
  text: string;
  key: string;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export function makeLine(text: string): TerminalLine {
  return {
    text,
    key: crypto.randomUUID(),
  };
}
