import type { Redis } from 'ioredis';
import { getRedisClient } from './redis';
import type { GameData } from '$lib/types/game';

export async function getGameDataByCode(gameCode: string): Promise<GameData | null> {
    console.log(`[lib/server/game] Fetching game data for code: ${gameCode}`);
    let redis: Redis | null = null;

    try {
        redis = await getRedisClient();
        const gameDataString = await redis.get(gameCode);
        
        if (!gameDataString) {
            console.log(`[lib/server/game] No game found for code: ${gameCode}`);
            return null;
        }

        const gameData = JSON.parse(gameDataString) as GameData;
        console.log(`[lib/server/game] Found game data:`, gameData);
        return gameData;

    } catch (error) {
        console.error(`[lib/server/game] Error fetching game data:`, error);
        throw new Error(`Failed to fetch game data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}