import { Redis } from 'ioredis';
import { 
    AZURE_CACHE_FOR_REDIS_HOST_NAME, 
    AZURE_CACHE_FOR_REDIS_ACCESS_KEY,
    REDIS_TLS 
} from '$env/static/private';
import { dev } from '$app/environment';

if (!AZURE_CACHE_FOR_REDIS_HOST_NAME || !AZURE_CACHE_FOR_REDIS_ACCESS_KEY) {
    throw new Error('Required Redis environment variables are not set');
}

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
    if (!redisClient || !redisClient.status || redisClient.status === 'end') {
        console.log('Creating new Redis connection...');
        
        try {
            const config = {
                host: AZURE_CACHE_FOR_REDIS_HOST_NAME,
                port: dev ? 6379 : 6380, // Use 6380 for Azure Cache for Redis
                password: AZURE_CACHE_FOR_REDIS_ACCESS_KEY,
                tls: !dev || REDIS_TLS === 'true' ? {
                    servername: AZURE_CACHE_FOR_REDIS_HOST_NAME,
                    rejectUnauthorized: !dev // Only false in development
                } : undefined,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    console.log(`Redis connection attempt ${times}, retrying in ${delay}ms`);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                connectTimeout: 10000, // 10 seconds
            };

            redisClient = new Redis(config);

            redisClient.on('error', (error) => {
                console.error('Redis connection error:', error);
            });

            redisClient.on('connect', () => {
                console.log('Redis client connected successfully');
            });

            // Wait for ready state with timeout
            await Promise.race([
                new Promise((resolve, reject) => {
                    redisClient!.once('ready', resolve);
                    redisClient!.once('error', reject);
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Redis connection timeout')), 10000)
                )
            ]);

        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            redisClient = null;
            throw error;
        }
    }

    return redisClient;
}