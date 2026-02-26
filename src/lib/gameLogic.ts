export const BALL_TYPES = [
    { level: 1, radius: 20, color: '#ff69b4', name: 'Cherry', score: 2 },
    { level: 2, radius: 30, color: '#ff4500', name: 'Strawberry', score: 4 },
    { level: 3, radius: 45, color: '#9370db', name: 'Grape', score: 8 },
    { level: 4, radius: 60, color: '#ffd700', name: 'Lemon', score: 16 },
    { level: 5, radius: 75, color: '#ffa500', name: 'Orange', score: 32 },
    { level: 6, radius: 95, color: '#ff6347', name: 'Apple', score: 64 },
    { level: 7, radius: 115, color: '#32cd32', name: 'Melon', score: 128 },
    { level: 8, radius: 140, color: '#20b2aa', name: 'Watermelon', score: 256 },
];

export const GAME_CONSTANTS = {
    WIDTH: 600,
    HEIGHT: 700,
    WALL_THICKNESS: 60,
    DROP_COOLDOWN_MS: 1000,
};

// You can eventually map public PNGs here if you prefer using image textures instead of colors.
// example mapping: sprite: { texture: '/1.png', xScale: ..., yScale: ... }
