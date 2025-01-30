import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, FileText, PenTool, BrainCircuit } from 'lucide-react';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'notes', icon: PenTool, label: 'Notes' },
    { id: 'summarize', icon: FileText, label: 'Summarize' },
    { id: 'pdf', icon: Book, label: 'PDF Reader' },
    { id: 'questions', icon: BrainCircuit, label: 'Questions' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 transition-all duration-200 z-50 ${
        scrolled 
          ? 'bg-gradient-to-r from-purple-200 to-indigo-200 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-r from-purple-800 to-indigo-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              NoteVault
            </h1>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeSection === item.id 
                      ? scrolled 
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-white/20 text-white'
                      : scrolled
                        ? 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;