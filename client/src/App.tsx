import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import NoteEditor from './components/NoteEditor'
import Summarize from './components/Summarize'
import PdfReader from './components/PdfReader'
import QuestionGen from './components/QuestionGen'
import { ThemeProvider } from './contexts/ThemeContext'

// Snowflake component for snowfall effect
const Snowflake = ({ style }) => (
  <div 
    className="snowflake absolute text-white select-none pointer-events-none" 
    style={{
      ...style,
      fontSize: `${10 + Math.random() * 20}px`,
      opacity: 0.7
    }}
  >
    ❄️
  </div>
);

function App() {
  const [activeSection, setActiveSection] = useState('notes');
  const [theme, setTheme] = useState(() => {
    // Retrieve theme from localStorage, default to 'theme-current'
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'theme-current';
  });
  const [snowflakes, setSnowflakes] = useState<React.ReactElement[]>([]);

  const themeGradients = {
    'theme-current': 'from-gray-50 to-gray-100',
    'theme-snowman': 'from-blue-50 to-cyan-100',
    'theme-dark': 'from-dark-400 via-dark-500 to-dark-700'  // More nuanced gradient
  };

  const themes = [
    'theme-current', 
    'theme-snowman',
    'theme-dark'
  ];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const getThemeIcon = (currentTheme: string) => {
    switch(currentTheme) {
      case 'theme-current': return '💼';
      case 'theme-snowman': return '❄️';
      case 'theme-dark': return '🌑';
      default: return '🌈';
    }
  };

  // Snowfall effect
  useEffect(() => {
    if (theme !== 'theme-snowman' || activeSection !== 'notes') {
      setSnowflakes([]);
      return;
    }

    const generateSnowflake = () => {
      const snowflake = (
        <Snowflake 
          key={Math.random()}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${7 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 3}s`,
            animationName: 'fall',
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards'
          }} 
        />
      );
      return snowflake;
    };

    const snowflakeInterval = setInterval(() => {
      if (theme === 'theme-snowman' && activeSection === 'notes') {
        setSnowflakes(prev => {
          // Limit snowflakes to prevent performance issues
          if (prev.length > 100) {
            prev.shift();
          }
          return [...prev, generateSnowflake()];
        });
      }
    }, 300);

    return () => clearInterval(snowflakeInterval);
  }, [theme, activeSection]);

  return (
    <ThemeProvider initialTheme={theme}>
      <div className={`min-h-screen bg-gradient-to-br ${themeGradients[theme]} ${theme} relative overflow-hidden`}>
        {/* Snowman Image */}
        {theme === 'theme-snowman' && (
          <motion.img 
            src="/snowman.png" 
            alt="Snowman" 
            className="absolute bottom-15 left-5 w-48 z-10"
            animate={{ 
              rotate: [0, 15, -16, 0],
              transition: { 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              } 
            }}
          />
        )}

        {/* Snowflakes */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {snowflakes}
        </div>

        <Navbar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          theme={theme}
          toggleTheme={toggleTheme}
          themeIcon={getThemeIcon(theme)}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeSection}-${theme}`}  
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative z-20"
          >
            {activeSection === 'notes' && <NoteEditor />}
            {activeSection === 'summarize' && <Summarize />}
            {activeSection === 'pdf' && <PdfReader />}
            {activeSection === 'questions' && <QuestionGen />}
          </motion.div>
        </AnimatePresence>

        {/* Global styles for snowfall */}
        <style jsx global>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}

export default App