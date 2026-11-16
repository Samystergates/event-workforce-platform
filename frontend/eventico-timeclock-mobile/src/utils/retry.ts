export type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
};

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 500,
    maxDelayMs = 5000,
    factor = 2,
    jitter = true,
  } = opts;

  let attempt = 0;
  let delay = baseDelayMs;
  let lastError: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (attempt === retries) break;
      let wait = Math.min(delay, maxDelayMs);
      if (jitter) wait = wait * (0.7 + Math.random() * 0.6);
      await sleep(wait);
      delay = Math.min(delay * factor, maxDelayMs);
      attempt++;
    }
  }
  throw lastError;
}
