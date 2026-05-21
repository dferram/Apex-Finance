import { Redis } from '@upstash/redis';

// Redis configuration from Upstash
// Supports both REST API and Redis protocol
const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisUrl = process.env.REDIS_URL;

// Initialize Redis client
let redis: Redis | null = null;

if (restUrl && restToken) {
  // REST API connection (recommended for serverless)
  try {
    redis = new Redis({
      url: restUrl,
      token: restToken,
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REDIS CONNECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status: Connected');
    console.log('Type: REST API');
    console.log('Provider: Upstash');
    console.log('URL:', restUrl.substring(0, 40) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Redis REST API initialization error:', error);
    redis = null;
  }
} else if (redisUrl) {
  // Redis protocol connection (rediss://)
  // Parse the URL to extract REST endpoint and token
  try {
    // Upstash Redis URL format: rediss://default:TOKEN@HOST:PORT
    const match = redisUrl.match(/rediss?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
    
    if (match) {
      const [, , token, host] = match;
      const restUrl = `https://${host}`;
      
      redis = new Redis({
        url: restUrl,
        token: token,
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('REDIS CONNECTION');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Status: Connected');
      console.log('Type: REST API (from REDIS_URL)');
      console.log('Provider: Upstash');
      console.log('Host:', host);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Invalid REDIS_URL format. Expected: rediss://default:TOKEN@HOST:PORT');
      redis = null;
    }
  } catch (error) {
    console.error('❌ Redis initialization error:', error);
    redis = null;
  }
} else {
  console.log('WARNING: Redis not configured');
  console.log('   Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN');
  console.log('   OR set REDIS_URL\n');
}

// Cache helper functions
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get<T>(key);
      return value;
    } catch (error) {
      console.error(`[Redis] GET error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error(`[Redis] SET error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redis) {
      return false;
    }

    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`[Redis] DEL error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!redis) {
      return 0;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`[Redis] DEL pattern error for ${pattern}:`, error);
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
