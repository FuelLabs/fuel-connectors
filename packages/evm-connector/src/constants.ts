const HAS_WINDOW = typeof window !== 'undefined';
// biome-ignore lint/suspicious/noExplicitAny: the Window type doesn't recognise the ethereum property.
export const WINDOW: any = HAS_WINDOW ? window : {};
