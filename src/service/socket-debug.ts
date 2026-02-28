const isSocketDebugEnabled = () => {
  const envFlag = process.env.EXPO_PUBLIC_SOCKET_DEBUG === "true";
  const devFlag = typeof __DEV__ !== "undefined" ? __DEV__ : false;
  return envFlag || devFlag;
};

const formatPrefix = (scope: string, step: string) =>
  `[SocketDebug][${scope}] ${step}`;

export const socketDebug = (scope: string, step: string, details?: unknown) => {
  if (!isSocketDebugEnabled()) return;
  if (details === undefined) {
    console.log(formatPrefix(scope, step));
    return;
  }
  console.log(formatPrefix(scope, step), details);
};

export const socketWarn = (scope: string, step: string, details?: unknown) => {
  if (!isSocketDebugEnabled()) return;
  if (details === undefined) {
    console.warn(formatPrefix(scope, step));
    return;
  }
  console.warn(formatPrefix(scope, step), details);
};

export const socketError = (scope: string, step: string, details?: unknown) => {
  if (!isSocketDebugEnabled()) return;
  if (details === undefined) {
    console.error(formatPrefix(scope, step));
    return;
  }
  console.error(formatPrefix(scope, step), details);
};
