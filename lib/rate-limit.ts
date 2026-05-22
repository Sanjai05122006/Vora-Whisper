type CounterBucket = {
  count: number;
  resetAt: number;
};

type GlobalLimiterState = Map<string, Map<string, CounterBucket>>;

function getGlobalLimiterState() {
  const root = globalThis as typeof globalThis & {
    __voraRateLimits?: GlobalLimiterState;
  };

  if (!root.__voraRateLimits) {
    root.__voraRateLimits = new Map();
  }

  return root.__voraRateLimits;
}

export function createRateLimiter(namespace: string, limit: number, windowMs: number) {
  return {
    check(key: string) {
      const allNamespaces = getGlobalLimiterState();
      const now = Date.now();
      const namespaceState = allNamespaces.get(namespace) ?? new Map<string, CounterBucket>();
      allNamespaces.set(namespace, namespaceState);
      const current = namespaceState.get(key);

      if (!current || current.resetAt <= now) {
        namespaceState.set(key, {
          count: 1,
          resetAt: now + windowMs
        });

        return {
          allowed: true,
          retryAfter: 0
        };
      }

      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
        };
      }

      current.count += 1;
      namespaceState.set(key, current);

      return {
        allowed: true,
        retryAfter: 0
      };
    }
  };
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip") || "unknown";
}
