import axios from 'axios';

// In prod: VITE_API_URL points to external auth (api.lvrnvm.fun).
// In dev: empty = Vite proxy → localhost:3000.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
});

export const getLeaderboard = async () => {
    try {
        const res = await api.get('/api/users/leaderboard');
        return res.data;
    } catch {
        return [
            { id: '1', username: 'Neo', elo: 2500, avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Neo' },
            { id: '2', username: 'Trinity', elo: 2450, avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Trinity' },
            { id: '3', username: 'Morpheus', elo: 2400, avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Morpheus' },
            { id: '4', username: 'Agent Smith', elo: 2350, avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Smith' },
            { id: '5', username: 'Cypher', elo: 2300, avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Cypher' },
        ];
    }
};

export default api;
