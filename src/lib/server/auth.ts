import { error, redirect } from '@sveltejs/kit';
import { getRedisClient } from './redis';

export async function validatePlayerAuth(gameCode: string, cookies: any) {
    const playerId = cookies.get(`player_id_${gameCode}`);
    if (!playerId) {
        throw redirect(303, `/games/${gameCode}/checkin`);
    }

    const redis = await getRedisClient();
    try {
        const gameDataString = await redis.get(gameCode);
        if (!gameDataString) {
            throw error(404, { message: 'Game not found.' });
        }

        const gameData = JSON.parse(gameDataString);
        const player = gameData.playersCheckedIn?.find(p => p.id === playerId);

        if (!player) {
            // Clear invalid cookie and redirect to check-in
            cookies.delete(`player_id_${gameCode}`, { path: '/' });
            throw redirect(303, `/games/${gameCode}/checkin`);
        }

        return { gameData, player };
    } finally {
        redis.quit();
    }
}