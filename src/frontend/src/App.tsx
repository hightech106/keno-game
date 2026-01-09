import React from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import BettingPanel from './components/BettingPanel';

const GameStatus = () => {
  const { roundState, isConnected, refreshRound } = useSocket();
  const [countdown, setCountdown] = React.useState<number>(0);

  React.useEffect(() => {
    if (!roundState) return;

    const updateCountdown = () => {
      if (roundState.countdownSeconds !== undefined) {
        setCountdown(roundState.countdownSeconds);
      } else {
        // Calculate countdown from scheduled time
        const now = new Date();
        const scheduled = new Date(roundState.scheduledTime);
        const elapsed = now.getTime() - scheduled.getTime();
        const roundDuration = 10 * 1000; // 10 seconds
        const remaining = Math.max(0, Math.ceil((roundDuration - elapsed) / 1000));
        setCountdown(remaining);
      }
    };

    updateCountdown();
    const interval = setInterval(() => {
      updateCountdown();
      // Refresh round state every second to get accurate countdown
      if (countdown > 0 && countdown % 5 === 0) {
        refreshRound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roundState, refreshRound]);

  if (!roundState) {
    return <div>Loading round info...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#4CAF50';
      case 'CLOSING': return '#FF9800';
      case 'DRAWING': return '#2196F3';
      case 'SETTLING': return '#9C27B0';
      case 'PAYOUT': return '#00BCD4';
      case 'ARCHIVED': return '#757575';
      default: return '#666';
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Round: {roundState.roundId.substring(0, 20)}...</h2>
        <span style={{ 
          padding: '5px 15px', 
          borderRadius: '20px',
          background: getStatusColor(roundState.status),
          color: 'white',
          fontWeight: 'bold'
        }}>
          {roundState.status}
        </span>
      </div>
      
      {roundState.status === 'OPEN' && countdown > 0 && (
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4CAF50' }}>
            {countdown}s
          </div>
          <div style={{ fontSize: '0.9em', color: '#666' }}>Time remaining</div>
        </div>
      )}

      <p style={{ margin: '5px 0', color: '#666' }}>
        Scheduled: {roundState.scheduledTime.toLocaleString()}
      </p>
      
      {roundState.numbersDrawn.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h3 style={{ marginBottom: '10px' }}>Drawn Numbers:</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {roundState.numbersDrawn.map((num) => (
              <span key={num} style={{ 
                padding: '8px 12px', 
                background: '#007bff', 
                color: 'white', 
                borderRadius: '50%',
                fontWeight: 'bold',
                minWidth: '35px',
                textAlign: 'center'
              }}>
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isConnected && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
          ⚠️ WebSocket disconnected. Using REST API fallback.
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
