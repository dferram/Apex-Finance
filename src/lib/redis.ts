import { Redis } from '@upstash/redis';

// Redis configuration from Upstash
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client
let redis: Redis | null = null;

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 REDIS CONNECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 Status: Connected');
    console.log('🔹 Provider: Upstash');
    console.log('🔹 URL:', redisUrl.substring(0, 30) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
    redis = null;
  }
} else {
  console.log('⚠️  Redis not configured (UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing)\n');
}

// Cache helper functions
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      console.log(`⚠️  Redis not available, skipping cache GET: ${key}`);
      return null;
    }

    try {
      const value = await redis.get<T>(key);
      if (value) {
        console.log(`✅ Cache HIT: ${key}`);
      } else {
        console.log(`❌ Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!redis) {
      console.log(`⚠️  Redis not available, skipping cache SET: ${key}`);
      return false;
    }

    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value));
        console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
      } else {
        await redis.set(key, JSON.stringify(value));
        console.log(`✅ Cache SET: ${key} (no TTL)`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redis) {
      console.log(`⚠️  Redis not available, skipping cache DEL: ${key}`);
      return false;
    }

    try {
      await redis.del(key);
      console.log(`✅ Cache DEL: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Redis DEL error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!redis) {
      console.log(`⚠️  Redis not available, skipping cache DEL pattern: ${pattern}`);
      return 0;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`✅ Cache DEL pattern: ${pattern} (${keys.length} keys)`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`❌ Redis DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return redis !== null;
  },
};

export { redis };
