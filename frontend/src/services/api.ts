import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

export const getLeaderboard = async () => {
  try {
    const response = await api.get('/api/users/leaderboard');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch leaderboard, using mock data');
    return [
      { id: '1', username: 'Neo', elo: 2500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo' },
      { id: '2', username: 'Trinity', elo: 2450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity' },
      { id: '3', username: 'Morpheus', elo: 2400, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus' },
      { id: '4', username: 'Smith', elo: 2350, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Smith' },
      { id: '5', username: 'Cypher', elo: 2300, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cypher' },
    ];
  }
};

export default api;
