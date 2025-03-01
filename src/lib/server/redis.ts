import { Redis } from 'ioredis';
import { REDIS_URL } from '$env/static/private';

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
    if (!redisClient || !redisClient.status || redisClient.status === 'end') {
        console.log('Creating new Redis connection...');
        try {
            redisClient = new Redis(REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true
            });

            redisClient.on('error', (error) => {
                console.error('Redis Client error:', error);
            });

            redisClient.on('connect', () => {
                console.log('Redis client connected to server.');
            });

            // Wait for ready state
            await new Promise((resolve, reject) => {
                redisClient!.once('ready', resolve);
                redisClient!.once('error', reject);
            });

        } catch (error: unknown) {
            console.error('Error connecting to Redis:', error);
            redisClient = null;
            throw new Error("Failed to connect to Redis: " + (error instanceof Error ? error.message : String(error)));
        }
    }

    if (!redisClient) {
        throw new Error("Redis client is not initialized.");
    }
    return redisClient;
}