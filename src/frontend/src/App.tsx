import React from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import BettingPanel from './components/BettingPanel';

const GameStatus = () => {
  const { roundState, isConnected } = useSocket();

  if (!isConnected) {
    return <div>Connecting to game server...</div>;
  }

  if (!roundState) {
    return <div>Waiting for round info...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h2>Current Round: {roundState.roundId}</h2>
      <h3>Status: {roundState.status}</h3>
      <p>Scheduled: {roundState.scheduledTime.toLocaleString()}</p>
      
      {roundState.numbersDrawn.length > 0 && (
        <div>
          <h3>Drawn Numbers:</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {roundState.numbersDrawn.map((num) => (
              <span key={num} style={{ 
                padding: '5px 10px', 
                background: '#007bff', 
                color: 'white', 
                borderRadius: '50%' 
              }}>
                {num}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <SocketProvider>
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <h1>Keno Game</h1>
        <GameStatus />
        <BettingPanel />
      </div>
    </SocketProvider>
  );
};

export default App;
