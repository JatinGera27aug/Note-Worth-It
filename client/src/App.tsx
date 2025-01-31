import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import NoteEditor from './components/NoteEditor';
import Summarize from './components/Summarize';
import PdfReader from './components/PdfReader';
import QuestionGen from './components/QuestionGen';

function App() {
  const [activeSection, setActiveSection] = useState('notes');
  const [theme, setTheme] = useState('theme-current');

  const themeGradients = {
    'theme-current': 'from-gray-50 to-gray-100',
    'theme-snowman': 'from-blue-50 to-cyan-100'
  };

  const themes = [
    'theme-current', 
    'theme-snowman'
  ];

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = (currentTheme: string) => {
    switch(currentTheme) {
      case 'theme-current': return '💼';
      case 'theme-snowman': return '❄️';
      default: return '🌈';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeGradients[theme]} ${theme}`}>
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        theme={theme}
        toggleTheme={toggleTheme}
        themeIcon={getThemeIcon(theme)}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === 'notes' && <NoteEditor />}
          {activeSection === 'summarize' && <Summarize />}
          {activeSection === 'pdf' && <PdfReader />}
          {activeSection === 'questions' && <QuestionGen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;