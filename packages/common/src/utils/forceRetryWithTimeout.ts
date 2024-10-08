export async function forceRetryWithTimeout<T>({
  fn,
  maxTimeout = 5000,
  retryCount = 20,
  retryDelay = 0,
  compareFn,
}: {
  fn: (signal: AbortSignal) => Promise<T>;
  maxTimeout?: number;
  retryCount?: number;
  retryDelay?: number;
  compareFn?: (result: T) => boolean;
}): Promise<T> {
  for (let attempt = 0; attempt < retryCount; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), maxTimeout);

    try {
      const result = await fn(controller.signal);

      if (compareFn?.(result) === false) {
        throw new Error('Result does not pass the compare function');
      }

      return result;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Timeout occurred, will retry');
      }

      if (attempt === retryCount - 1) {
        throw new Error(`Max retries reached: ${error.message || error}`);
      }

      retryDelay &&
        (await new Promise((resolve) => setTimeout(resolve, retryDelay)));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error('Max retries reached without success.');
}
