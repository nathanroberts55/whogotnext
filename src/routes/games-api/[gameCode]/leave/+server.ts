import { error, json } from '@sveltejs/kit';
import { getRedisClient } from '$lib/server/redis';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
    const gameCode = params.gameCode;
    let redis = await getRedisClient();

    try {
        const { playerId } = await request.json();
        
        const gameDataStr = await redis.get(gameCode);
        if (!gameDataStr) {
            throw error(404, { message: 'Game not found' });
        }

        const gameData = JSON.parse(gameDataStr);
        
        // Remove player from the game
        gameData.playersCheckedIn = gameData.playersCheckedIn.filter(
            (p: { id: string }) => p.id !== playerId
        );

        // Update game data in Redis
        await redis.set(gameCode, JSON.stringify(gameData), 'EX', 18000);
        
        // Fix cookie deletion by adding required options
        cookies.delete(`player_id_${gameCode}`, { path: '/' });

        return json({ success: true });
    } catch (err) {
        console.error('Error during player leave:', err);
        throw error(500, { message: 'Failed to leave game' });
    }
};