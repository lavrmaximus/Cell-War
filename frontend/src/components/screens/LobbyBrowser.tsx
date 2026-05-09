import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Server, Users, Activity, Trophy, RefreshCw } from 'lucide-react';
import { getLeaderboard } from '../../services/api';
import { gameSocket } from '../../services/socket';
import { useGameState } from '../../hooks/useGameState';
import type { RoomInfo } from '../../types';

interface Props {
    onBack: () => void;
}

const LobbyBrowser: React.FC<Props> = ({ onBack }) => {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { joinGame } = useGameState();

    const fetchRooms = () => {
        setRefreshing(true);
        gameSocket.emit('GET_ROOMS');
        setTimeout(() => setRefreshing(false), 800);
    };

    useEffect(() => {
        getLeaderboard().then(setLeaderboard);
        fetchRooms();

        const socket = gameSocket.socket;
        if (!socket) return;

        const onRoomList = (list: RoomInfo[]) => setRooms(list);
        socket.on('ROOM_LIST', onRoomList);
        return () => { socket.off('ROOM_LIST', onRoomList); };
    }, []);

    return (
        <div className="min-h-full w-full bg-[#030303] pt-16 px-6 pb-8 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto w-full z-10 flex flex-col gap-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-cyan-900/30 pb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="text-cyan-600 hover:text-cyan-400 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-widest font-mono">NET_BROWSER</h2>
                            <p className="text-cyan-800 font-mono text-xs">Scanning for active nodes...</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchRooms}
                            className="flex items-center gap-2 px-4 py-2 border border-cyan-900/50 text-cyan-600 hover:text-cyan-400 hover:border-cyan-600 font-mono text-xs rounded-sm transition-colors"
                        >
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                            REFRESH
                        </button>
                        <button
                            onClick={joinGame}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-cyan-600/70 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-400 font-mono font-bold text-xs rounded-sm tracking-widest transition-colors"
                        >
                            QUICK MATCH
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Room list */}
                    <div className="lg:col-span-2 bg-black/40 border border-cyan-900/20 rounded overflow-hidden">
                        <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-cyan-950/20 text-cyan-600 font-mono text-xs uppercase tracking-wider border-b border-cyan-900/20">
                            <div className="col-span-4 flex items-center gap-1.5"><Server size={12} /> Host</div>
                            <div className="col-span-2 flex items-center gap-1.5"><Users size={12} /> Players</div>
                            <div className="col-span-3 flex items-center gap-1.5"><Activity size={12} /> Status</div>
                            <div className="col-span-3 text-right">Ping</div>
                        </div>

                        {rooms.length === 0 ? (
                            <div className="py-12 text-center text-cyan-900 font-mono text-sm">
                                No active nodes in local sector.
                            </div>
                        ) : (
                            rooms.map((room, i) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={joinGame}
                                    className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-cyan-900/10 hover:bg-cyan-900/10 transition-colors cursor-pointer font-mono text-xs"
                                >
                                    <div className="col-span-4 text-white font-bold truncate">{room.host.slice(0, 12)}</div>
                                    <div className="col-span-2 text-zinc-400">{room.players}</div>
                                    <div className="col-span-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                            room.status === 'WAITING'
                                                ? 'bg-green-900/40 text-green-400'
                                                : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </div>
                                    <div className={`col-span-3 text-right ${
                                        room.latency < 50 ? 'text-green-500' : room.latency < 100 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                        {room.latency}ms
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-black/40 border border-cyan-900/20 rounded overflow-hidden h-fit">
                        <div className="px-4 py-2 bg-cyan-950/20 border-b border-cyan-900/20">
                            <h3 className="text-cyan-600 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Trophy size={13} /> Elite Operators
                            </h3>
                        </div>
                        <div className="p-3 flex flex-col gap-2">
                            {leaderboard.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3 p-2 rounded">
                                    <span className="text-zinc-700 font-mono text-xs w-4">#{i + 1}</span>
                                    <img
                                        src={p.avatar}
                                        alt={p.username}
                                        className="w-7 h-7 rounded-full border border-cyan-900/50"
                                    />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-white font-bold text-xs font-mono">{p.username}</span>
                                        <span className="text-zinc-600 text-[10px] font-mono">{p.elo} ELO</span>
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
