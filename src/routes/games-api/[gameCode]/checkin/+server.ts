// src/routes/games-api/[gameCode]/checkin/+server.ts
import { json, error } from '@sveltejs/kit';
import { getRedisClient } from '$lib/server/redis';
import { v4 as uuidv4 } from 'uuid'; // For generating unique player IDs

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, cookies }) {  // Add cookies to destructuring
    let redis;
    const gameCode = params.gameCode;

    if (!gameCode) {
        throw error(400, { message: 'Game code is required.' });
    }

    try {
        redis = await getRedisClient();
    } catch (redisConnectionError) {
        console.error("Redis connection failed in check-in API:", redisConnectionError);
        throw error(500, { message: 'Failed to connect to Redis.' });
    }

    try {
        const gameDataString = await redis.get(gameCode);
        if (!gameDataString) {
            throw error(404, { message: 'Game not found.' });
        }
        const gameData = JSON.parse(gameDataString);

        if (!gameData.playersCheckedIn) {
            gameData.playersCheckedIn = []; // Initialize if it's missing (for robustness)
        }

        const requestData = await request.json();
        const playerName = requestData.playerName; // Assuming client sends playerName in request body

        if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
            throw error(400, { message: 'Player name is required.' });
        }

        const player = {
            id: uuidv4(), // Generate unique player ID using UUID
            name: playerName.trim(),
            arrivalTime: Date.now()
        };

        gameData.playersCheckedIn.push(player);
        await redis.set(gameCode, JSON.stringify(gameData), 'EX', 18000); // Re-set TTL (5 hours)

        // Set the cookie for player identification
        cookies.set(`player_id_${gameCode}`, player.id, {
            path: '/',
            maxAge: 60 * 60 * 5 // 5 hours in seconds
        });

        // Updated response to include both game and player data
        return json({ 
            message: 'Check-in successful!',
            player,
            gameData // Include the full game data in response
        }, { 
            status: 201 
        });

    } catch (err) {
        console.error('Error during player check-in:', err);
        if (err instanceof Error && err.message === 'Game not found.') {
            throw error(404, { message: 'Game not found.' });
        } else if (err instanceof Error && err.message === 'Player name is required.') {
            throw error(400, { message: 'Player name is required.' });
        }
        throw error(500, { message: 'Failed to check player in.' }); // Generic server error
    } finally {
        if (redis) {
            redis.quit();
        }
    }
}