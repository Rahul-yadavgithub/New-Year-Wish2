import { useEffect, useState } from 'react';
import '@/App.css';
import CelebrationExperience from '@/components/CelebrationExperience';

function App() {
  const [hasVisited, setHasVisited] = useState(false);
  const [visitDate, setVisitDate] = useState(null);

  useEffect(() => {
    // Check for reset flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('_reset') === 'true') {
      localStorage.clear();
      window.location.href = '/';
      return;
    }

    // Check if already visited
    const visited = localStorage.getItem('newYear2026_celebration_viewed');
    const timestamp = localStorage.getItem('newYear2026_visit_timestamp');
    
    if (visited === 'true') {
      setHasVisited(true);
      if (timestamp) {
        setVisitDate(new Date(timestamp));
      }
    }
  }, []);

  if (hasVisited) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, hsl(280 35% 48%) 0%, hsl(340 38% 72%) 100%)'
      }}>
        <div className="text-center text-white px-8 py-12 max-w-2xl">
          <div className="mb-8">
            <div className="text-6xl mb-4 animate-pulse">✨</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{
              fontFamily: "'Playfair Display', serif"
            }}>
              This surprise has already been opened
            </h1>
          </div>
          <p className="text-xl mb-3 opacity-90">
            Thank you for the beautiful memory, Manisha.
          </p>
          {visitDate && (
            <p className="text-sm opacity-70">
              First opened: {visitDate.toLocaleString()}
            </p>
          )}
          <div className="mt-8 text-sm opacity-60">
            <p>To experience it again, add <code className="bg-white/10 px-2 py-1 rounded">?_reset=true</code> to the URL</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <CelebrationExperience />
    </div>
  );
}

export default App;