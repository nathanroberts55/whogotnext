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
        console.log(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT} with TLS=${REDIS_TLS}`);
        
        try {
            const config = {
                host: REDIS_HOST,
                port: Number(REDIS_PORT),
                password: REDIS_PASSWORD,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    console.log(`Redis connection attempt ${times}, retrying in ${delay}ms`);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                connectTimeout: 10000, // 10 seconds
                tls: REDIS_TLS === 'true' ? {
                    servername: REDIS_HOST,
                    rejectUnauthorized: false // Only if using self-signed certificates
                } : undefined
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