export const BALL_TYPES = [
    { level: 1, radius: 20, color: '#ff69b4', texture: '/1.jpeg', name: 'Level 1', score: 2 },
    { level: 2, radius: 30, color: '#ff4500', texture: '/2.jpeg', name: 'Level 2', score: 4 },
    { level: 3, radius: 45, color: '#9370db', texture: '/3.jpeg', name: 'Level 3', score: 8 },
    { level: 4, radius: 60, color: '#ffd700', texture: '/4.jpeg', name: 'Level 4', score: 16 },
    { level: 5, radius: 75, color: '#ffa500', texture: '/5.jpeg', name: 'Level 5', score: 32 },
    { level: 6, radius: 95, color: '#ff6347', texture: '/6.jpeg', name: 'Level 6', score: 64 },
    { level: 7, radius: 115, color: '#32cd32', texture: '/7.jpeg', name: 'Level 7', score: 128 },
    { level: 8, radius: 140, color: '#20b2aa', texture: '/8.jpeg', name: 'Level 8', score: 256 },
    { level: 9, radius: 170, color: '#ff1493', texture: '/9.jpeg', name: 'Level 9', score: 512 },
];

export const GAME_CONSTANTS = {
    WIDTH: 600,
    HEIGHT: 700,
    WALL_THICKNESS: 60,
    DROP_COOLDOWN_MS: 1000,
};

// You can eventually map public PNGs here if you prefer using image textures instead of colors.
// example mapping: sprite: { texture: '/1.png', xScale: ..., yScale: ... }
