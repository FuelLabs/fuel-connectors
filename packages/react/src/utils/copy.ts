export async function handleCopy(value: string) {
  await navigator.clipboard.writeText(value);
}
