import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGameDataByCode } from '$lib/server/game';

export const load: PageServerLoad = async ({ params }) => {
    const gameCode = params.gameCode;
    console.log(`[host/game/[gameCode]] Loading game with code: ${gameCode}`);
    
    try {
        const gameData = await getGameDataByCode(gameCode);
        
        if (!gameData) {
            throw error(404, {
                message: `Game with code ${gameCode} not found`
            });
        }

        return {
            gameData
        };
    } catch (err) {
        console.error(`[host/game/[gameCode]] Error loading game:`, err);
        throw error(500, {
            message: 'Failed to load game data'
        });
    }
};