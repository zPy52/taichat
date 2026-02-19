export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}

export function formatToolArgs(args?: Record<string, unknown>): string {
  if (!args) {
    return '';
  }

  const entries = Object.entries(args);
  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([key, value]) => {
      const textValue = typeof value === 'string' ? truncate(value, 60) : JSON.stringify(value);
      return `${key}=${textValue}`;
    })
    .join(' ');
}
