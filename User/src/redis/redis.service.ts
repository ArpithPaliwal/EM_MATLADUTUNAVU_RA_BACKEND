import { redisClient } from "./index.js";


export class RedisService {
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await redisClient.exists(key)) === 1;
  }
}
