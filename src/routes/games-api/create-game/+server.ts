// src/routes/games-api/create-game/+server.ts
import { Redis } from 'ioredis';
import { json, error } from '@sveltejs/kit';
import { getRedisClient } from '$lib/server/redis'; // Import the function, not the client instance

/**
 * Generates a unique alphanumeric game code.
 * Attempts to ensure uniqueness by checking against existing keys in Redis.
 *
 * @returns {string} A unique game code.
 */
async function generateUniqueGameCode(redis: Redis): Promise<string> { // Pass Redis client as argument
    console.log('Starting generateUniqueGameCode function');
    const codeLength = 6 + Math.floor(Math.random() * 3); // Length between 6 and 8
    console.log(`Generating code with length: ${codeLength}`);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const maxAttempts = 10; // Limit attempts to avoid infinite loop in unlikely collision scenario

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let gameCode = '';
        for (let i = 0; i < codeLength; i++) {
            gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        console.log(`Generated code attempt ${attempt + 1}: ${gameCode}`);

        // Check if the generated code already exists as a key in Redis
        const exists = await redis.exists(gameCode); // Use the passed redis client
        console.log(`Code ${gameCode} exists in Redis: ${exists}`);
        if (!exists) {
            console.log(`Unique code found: ${gameCode}`);
            return gameCode; // Unique code found
        }
        console.warn(`Game code collision detected: ${gameCode}. Attempt ${attempt + 1}/${maxAttempts}`);
    }

    // If after maxAttempts, still no unique code, throw error (unlikely but handle it)
    throw new Error("Failed to generate a unique game code after multiple attempts.");
}


/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    console.log('POST request received to create-game endpoint');
    let redis: Redis | null = null;
    
    try {
        const requestData = await request.json();
        const location = requestData.location;
        console.log('Received location:', location);

        console.log('Attempting to connect to Redis...');
        redis = await getRedisClient();
        console.log('Redis connection successful');

        // Check connection is still alive
        const ping = await redis.ping();
        if (ping !== 'PONG') {
            throw new Error('Redis connection check failed');
        }

        console.log('Generating game code...');
        const gameCode = await generateUniqueGameCode(redis);
        console.log('Game code generated:', gameCode);
        
        const gameData = {
            gameCode: gameCode,
            createdAt: Date.now(),
            location: location || undefined,  // Only include if provided
            playersCheckedIn: []
        };
        console.log('Game data prepared:', gameData);

        const ttlSeconds = 18000;
        console.log(`Storing game data in Redis with TTL: ${ttlSeconds}s`);
        await redis.set(gameCode, JSON.stringify(gameData), 'EX', ttlSeconds);
        console.log('Game data successfully stored in Redis');

        return json({ gameCode });

    } catch (err) {
        console.error("Error in game creation process:", err);
        throw error(500, { 
            message: err instanceof Error ? err.message : 'Failed to create game.'
        });
    }
    // Remove the finally block - don't quit the connection
}