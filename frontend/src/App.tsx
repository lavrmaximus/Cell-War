import React, { useState, useEffect, ChangeEvent } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import GameBoard from './components/GameBoard.tsx';
import PlayerPanel from './components/PlayerPanel.tsx';
import ActionPanel from './components/ActionPanel.tsx';
import MapEditor from './components/MapEditor.tsx';
import { GameState, Cell } from './types/game.ts';
import { playSound } from './utils/sounds.ts';

const API_URL = 'http://localhost:5000';

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Game</Link> | <Link to="/editor">Map Editor</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/editor" element={<MapEditor />} />
      </Routes>
    </div>
  );
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [mapType, setMapType] = useState('standard');
  const [customMap, setCustomMap] = useState<Cell[][] | null>(null);

  const handleMapFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const mapData = JSON.parse(event.target?.result as string);
          setCustomMap(mapData);
          setMapType('custom');
        } catch (error) {
          console.error("Error parsing map file:", error);
          alert("Invalid map file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const createNewGame = async () => {
    try {
      let body: any = { type: mapType };
      if (mapType === 'custom' && customMap) {
        body.data = customMap;
      }

      const response = await fetch(`${API_URL}/api/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
      }

      const data = await response.json();
      setGameState(data);
      setSelectedCell(null);
      playSound('start.mp3');
    } catch (error) {
      console.error('Failed to create new game:', error);
      alert(`Could not start new game: ${error.message}`);
    }
  };

  const saveGame = () => {
    if (gameState) {
      localStorage.setItem('cellWarSaveData', JSON.stringify(gameState));
      playSound('save.mp3');
      alert('Game Saved!');
    }
  };

  const loadGame = () => {
    const savedData = localStorage.getItem('cellWarSaveData');
    if (savedData) {
      setGameState(JSON.parse(savedData));
      setSelectedCell(null);
      playSound('load.mp3');
    }
  };

  const handleCellClick = (cell: Cell) => {
    setSelectedCell(cell);
    playSound('click.mp3');
  };

  const handleAction = async (actionType: string, options?: { amount?: number }) => {
    if (!gameState || (!selectedCell && actionType !== 'END_TURN')) return;

    // Prevent action if gameId is missing
    if (!gameState.gameId) {
      alert("Error: Game ID is missing. Cannot perform action.");
      return;
    }

    let url = '';
    let body: any = {};

    if (actionType === 'END_TURN') {
      url = `${API_URL}/api/game/${gameState.gameId}/end_turn`;
      playSound('end_turn.mp3');
    } else {
      url = `${API_URL}/api/game/${gameState.gameId}/action`;
      body = {
        type: actionType,
        playerId: gameState.currentPlayerId,
        cell: { x: selectedCell!.x, y: selectedCell!.y },
      };
      if (actionType === 'UPGRADE_DEFENSE' && options?.amount) {
        body.amount = options.amount;
      }
      if (actionType === 'CAPTURE') playSound('capture.mp3');
      if (actionType === 'BUILD_FARM') playSound('build.mp3');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
      }

      const updatedGame = await response.json();
      setGameState(updatedGame);
      setSelectedCell(null); // Deselect cell after action
    } catch (error) {
      console.error('Failed to perform action:', error);
      alert(`Action failed: ${error.message}`);
    }
  };

  return (
      <header className="App-header">
        <h1>Cell War</h1>
        {!gameState ? (
          <div>
            <h3>New Game Options</h3>
            <select value={mapType} onChange={(e) => setMapType(e.target.value)}>
              <option value="standard">Standard (20x20)</option>
              <option value="large">Large (30x30)</option>
              <option value="empty">Empty</option>
              <option value="custom" disabled={!customMap}>Custom Map</option>
            </select>
            <div>
              <label>Load Custom Map: </label>
              <input type="file" accept=".json" onChange={handleMapFileChange} />
            </div>
            <hr />
            <button onClick={createNewGame}>Start New Game</button>
            <button onClick={loadGame}>Load Game</button>
          </div>
        ) : (
          <main style={{ display: 'flex', gap: '20px' }}>
            <div>
              <PlayerPanel gameState={gameState} />
              <ActionPanel selectedCell={selectedCell} gameState={gameState} onAction={handleAction} />
              <hr />
              <button onClick={saveGame}>Save Game</button>
            </div>
            <GameBoard gameState={gameState} selectedCell={selectedCell} onCellClick={handleCellClick} />
          </main>
        )}
      </header>
  );
}

export default App;
