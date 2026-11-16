const isDev = process.env.NODE_ENV !== "production";

type LogArgs = unknown[];

export const appLogger = {
  debug: (...args: LogArgs) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  info: (...args: LogArgs) => {
    if (isDev) {
      console.info(...args);
    }
  },
  warn: (...args: LogArgs) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: LogArgs) => {
    if (isDev) {
      console.error(...args);
    }
  },
};
