import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeonButton from '../ui/NeonButton';
import { ArrowLeft, Server, Shield, Users, Activity, Trophy } from 'lucide-react';
import { getLeaderboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gameSocket } from '../../services/socket';

interface LobbyBrowserProps {
  onBack: () => void;
}

interface ServerNode {
  id: string;
  host: string;
  map: string;
  players: string;
  status: 'WAITING' | 'IN_PROGRESS';
  latency: number;
}

const LobbyBrowser: React.FC<LobbyBrowserProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [servers, setServers] = useState<ServerNode[]>([]);

  useEffect(() => {
    getLeaderboard().then(setLeaderboard);

    gameSocket.emit('GET_ROOMS');
    
    const onRoomList = (rooms: any[]) => {
        setServers(rooms);
    };
    
    gameSocket.on('ROOM_LIST', onRoomList);
    
    return () => {
        gameSocket.off('ROOM_LIST', onRoomList);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050505] pt-24 px-8 pb-8 flex flex-col relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto w-full z-10 flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-cyan-500 hover:text-cyan-300 transition-colors">
              <ArrowLeft size={32} />
            </button>
            <div>
              <h2 className="text-4xl font-black text-white tracking-widest">NET_BROWSER</h2>
              <p className="text-cyan-700 font-mono text-sm">Scanning local subnet...</p>
            </div>
          </div>
          <NeonButton onClick={() => console.log('Deploy Node')}>
            DEPLOY NODE
          </NeonButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Server List */}
          <div className="lg:col-span-2 bg-black/40 border border-cyan-900/30 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-cyan-950/20 text-cyan-400 font-mono text-sm uppercase tracking-wider border-b border-cyan-900/30">
              <div className="col-span-4 flex items-center gap-2"><Server size={16} /> Host Node</div>
              <div className="col-span-3 flex items-center gap-2"><Shield size={16} /> Map Size</div>
              <div className="col-span-2 flex items-center gap-2"><Users size={16} /> Players</div>
              <div className="col-span-2 flex items-center gap-2"><Activity size={16} /> Status</div>
              <div className="col-span-1 text-right">Ping</div>
            </div>

            <div className="flex flex-col">
              {servers.length === 0 ? (
                <div className="p-8 text-center text-cyan-700 font-mono">
                  No active signals detected in local sector.
                </div>
              ) : (
                servers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-cyan-900/10 hover:bg-cyan-900/10 transition-colors cursor-pointer group font-mono text-gray-300"
                  >
                    <div className="col-span-4 font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {server.host}
                    </div>
                    <div className="col-span-3">{server.map}</div>
                    <div className="col-span-2">{server.players}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        server.status === 'WAITING' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {server.status}
                      </span>
                    </div>
                    <div className={`col-span-1 text-right ${
                      server.latency < 50 ? 'text-green-500' : server.latency < 100 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {server.latency}ms
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1 bg-black/40 border border-cyan-900/30 backdrop-blur-sm rounded-lg overflow-hidden h-fit">
            <div className="p-4 bg-cyan-950/20 border-b border-cyan-900/30">
              <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                <Trophy size={16} /> ELITE OPERATORS
              </h3>
            </div>
            <div className="flex flex-col p-4 gap-4">
              {leaderboard.map((player, index) => (
                <div key={player.id} className={`flex items-center gap-3 p-2 rounded ${user?.id === player.id ? 'bg-cyan-900/30 border border-cyan-500/50' : ''}`}>
                  <span className="text-cyan-700 font-mono w-6">#{index + 1}</span>
                  <img src={player.avatar} alt={player.username} className="w-8 h-8 rounded-full border border-cyan-900" />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{player.username}</span>
                    <span className="text-cyan-600 text-xs font-mono">{player.elo} ELO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LobbyBrowser;
