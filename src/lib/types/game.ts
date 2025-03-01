export interface Player {
    id: string;
    name: string;
    arrivalTime: string;
}

export interface GameData {
    gameCode: string;
    createdAt: number;
    location?: string;
    playersCheckedIn: Player[];
}

export interface PageData {
    gameData: GameData;
    currentPlayer: Player | null;
}