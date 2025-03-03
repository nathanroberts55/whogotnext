// src/routes/games-api/[gameCode]/checkin/+server.ts
import { json, error, redirect } from '@sveltejs/kit';
import { getRedisClient } from '$lib/server/redis';
import { v4 as uuidv4 } from 'uuid';
import type { Player, GameData } from '$lib/types/game';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, cookies }) {
    let redis;
    const gameCode = params.gameCode;

    if (!gameCode) {
        throw error(400, { message: 'Game code is required.' });
    }

    try {
        const existingPlayerId = cookies.get(`player_id_${gameCode}`);
        redis = await getRedisClient();
        const gameDataString = await redis.get(gameCode);
        
        if (!gameDataString) {
            throw error(404, { message: 'Game not found.' });
        }

        const gameData = JSON.parse(gameDataString);
        if (!gameData.playersCheckedIn) {
            gameData.playersCheckedIn = [];
        }

        // If player already has a cookie, check if they exist in the game
        if (existingPlayerId) {
            const existingPlayer = gameData.playersCheckedIn.find(
                (player: Player) => player.id === existingPlayerId
            );

            if (existingPlayer) {
                // Player already checked in, return game data
                return json({ 
                    success: true,
                    gameCode,
                    message: 'Already checked in',
                    gameData
                });
            }
        }

        const requestData = await request.json();
        const playerName = requestData.playerName;

        if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
            throw error(400, { message: 'Player name is required.' });
        }

        // Check if player name already exists in this game
        const playerNameExists = gameData.playersCheckedIn.some(
            (player: Player) => player.name.toLowerCase() === playerName.trim().toLowerCase()
        );

        if (playerNameExists) {
            throw error(400, { message: 'A player with this name has already checked in.' });
        }

        const player = {
            id: existingPlayerId || uuidv4(),
            name: playerName.trim(),
            arrivalTime: Date.now()
        };

        gameData.playersCheckedIn.push(player);
        await redis.set(gameCode, JSON.stringify(gameData), 'EX', 18000);

        // Set the cookie for player identification
        cookies.set(`player_id_${gameCode}`, player.id, {
            path: '/',
            maxAge: 60 * 60 * 5 // 5 hours in seconds
        });

        // Return success response with game data
        return json({ 
            success: true,
            gameCode,
            message: 'Successfully checked in',
            gameData
        });

    } catch (err) {
        console.error('Error during player check-in:', err);
        
        if (err instanceof Error) {
            if (err.message === 'Game not found.') {
                throw error(404, { message: 'Game not found.' });
            } else if (err.message === 'Player name is required.') {
                throw error(400, { message: 'Player name is required.' });
            }
        }
        
        throw error(500, { message: 'Failed to check player in.' });
    } finally {
        if (redis) {
            await redis.quit();
        }
    }
}