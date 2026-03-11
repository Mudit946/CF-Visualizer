import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import ContestRooms from './pages/ContestRooms';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cf-darker text-gray-100 flex flex-col font-sans selection:bg-cf-primary/30">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:handle" element={<Dashboard />} />
            <Route path="/rooms" element={<ContestRooms />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
