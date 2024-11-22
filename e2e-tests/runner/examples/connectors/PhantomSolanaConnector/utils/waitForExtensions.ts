import { setTimeout } from 'node:timers/promises';
import type { BrowserContext } from '@playwright/test';

export async function waitForExtensions(
  context: BrowserContext,
  extensions: Record<
    string,
    {
      id: string;
      version: string;
    }
  >,
  maxAttempts = 5,
  attempt = 0,
): Promise<boolean> {
  if (!context) throw new Error('BrowserContext is required.');
  if (!extensions || typeof extensions !== 'object') {
    throw new Error('Invalid extensions object provided.');
  }
  console.log(`Checking extensions (Attempt ${attempt + 1}/${maxAttempts})...`);
  const pages = context.pages();
  if (!pages.length) {
    console.warn('No pages found in the context. Retrying...');
  }
  const phantomPage = pages.find((page) =>
    page.url().includes(extensions.phantom?.id),
  );
  if (phantomPage) {
    console.log('Phantom extension is ready!');
    return true;
  }
  if (attempt >= maxAttempts - 1) {
    throw new Error(
      `Failed to detect extensions after ${maxAttempts} attempts.`,
    );
  }
  console.log('Phantom extension not found. Retrying in 3 seconds...');
  await setTimeout(3000);
  return waitForExtensions(context, extensions, maxAttempts, attempt + 1);
}
