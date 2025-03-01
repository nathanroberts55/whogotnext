import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGameDataByCode } from '$lib/server/game';

export const load: PageServerLoad = async ({ params, cookies }) => {
    const gameCode = params.gameCode;
    const playerId = cookies.get(`player_id_${gameCode}`);
    
    console.log(`[game/[gameCode]] Loading game with code: ${gameCode}`);
    console.log(`[game/[gameCode]] Player ID from cookie: ${playerId}`);
    
    try {
        const gameData = await getGameDataByCode(gameCode);
        
        if (!gameData) {
            throw error(404, {
                message: `Game with code ${gameCode} not found`
            });
        }

        // Find the player in the game if they have a cookie
        const currentPlayer = playerId 
            ? gameData.playersCheckedIn.find(p => p.id === playerId) 
            : null;

        console.log(`[game/[gameCode]] Current player:`, currentPlayer);

        return {
            gameData,
            currentPlayer
        };
    } catch (err) {
        console.error(`[game/[gameCode]] Error loading game:`, err);
        throw error(500, {
            message: 'Failed to load game data'
        });
    }
};