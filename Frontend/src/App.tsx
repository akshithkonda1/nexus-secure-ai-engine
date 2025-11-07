import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [darkMode, setDarkMode] = useState(true); // Default dark like Image 3

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-surface text-white' : 'bg-lightBg text-gray-900'}`}>
      <Header />
      <Sidebar />
      <main className="ml-0 md:ml-64 p-6">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
