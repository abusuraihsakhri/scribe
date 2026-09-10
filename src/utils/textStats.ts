export interface TextStats {
  words: number;
  characters: number;
}

export function computeTextStats(content: string): TextStats {
  const trimmed = content.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  return { words, characters: content.length };
}
