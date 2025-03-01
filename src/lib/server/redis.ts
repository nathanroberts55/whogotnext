import { Redis } from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } from '$env/static/private';
import { dev } from '$app/environment';

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
    throw new Error('Required Redis environment variables are not set');
}

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
    if (!redisClient || !redisClient.status || redisClient.status === 'end') {
        console.log('Creating new Redis connection...');
        try {
            const config = {
                host: REDIS_HOST,
                port: Number(REDIS_PORT),
                password: REDIS_PASSWORD,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true
            };

            // Add TLS configuration for production
            if (REDIS_TLS === 'true') {
                Object.assign(config, {
                    tls: {
                        servername: REDIS_HOST
                    }
                });
            }

            redisClient = new Redis(config);

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