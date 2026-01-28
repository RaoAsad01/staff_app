// Simple logger utility to replace direct console usage
// In production builds, you can limit logs by adjusting ENABLE_DEBUG_LOGS

const ENABLE_DEBUG_LOGS = __DEV__;

const formatMessage = (args) => {
  // You can enhance this with timestamps, tags, etc.
  return args;
};

export const logger = {
  log: (...args) => {
    if (!ENABLE_DEBUG_LOGS) return;
    console.log(...formatMessage(args));
  },
  debug: (...args) => {
    if (!ENABLE_DEBUG_LOGS) return;
    console.debug ? console.debug(...formatMessage(args)) : console.log(...formatMessage(args));
  },
  warn: (...args) => {
    if (!ENABLE_DEBUG_LOGS) return;
    console.warn(...formatMessage(args));
  },
  error: (...args) => {
    // Errors are generally useful even in production
    console.error(...formatMessage(args));
  },
};


