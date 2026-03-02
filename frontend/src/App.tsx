import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Fitness Dashboard</h1>
      </header>
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
};

export default App;
