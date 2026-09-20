/** Wrap approved wording without abbreviation or word splitting. */
export function wrapGraphLabel(label: string, limit = 23) {
  const lines: string[] = [];
  for (const word of label.split(" ")) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + word.length + 1 <= limit) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}
