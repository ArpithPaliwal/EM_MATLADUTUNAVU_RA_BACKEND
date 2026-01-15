import { redisClient } from "./index.js";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowInSeconds: number;
}

export async function rateLimit({
  key,
  limit,
  windowInSeconds,
}: RateLimitOptions): Promise<void> {
  const current = await redisClient.incr(key);

  if (current === 1) {
    await redisClient.expire(key, windowInSeconds);
  }

  if (current > limit) {
    throw new Error("Too many requests. Please try again later.");
  }
}
