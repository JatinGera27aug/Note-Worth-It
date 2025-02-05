import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, FileText, PenTool, BrainCircuit } from 'lucide-react';

const Navbar = ({ 
  activeSection, 
  setActiveSection, 
  theme, 
  toggleTheme, 
  themeIcon 
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavbarStyles = () => {
    switch(theme) {
      case 'theme-current':
        return {
          unscrolled: 'bg-gradient-to-r from-purple-800 to-indigo-900',
          scrolled: 'bg-gradient-to-r from-purple-200 to-indigo-200 backdrop-blur-lg shadow-lg',
          activeItemUnscrolled: 'bg-white/20 text-white',
          activeItemScrolled: 'bg-purple-100 text-purple-900',
          inactiveItemUnscrolled: 'text-gray-300 hover:bg-white/10 hover:text-white',
          inactiveItemScrolled: 'text-gray-600 hover:bg-purple-50 hover:text-purple-900',
          themeButtonUnscrolled: 'bg-white/20 text-white hover:bg-white/30',
          themeButtonScrolled: 'bg-purple-100 text-purple-900 hover:bg-purple-200'
        };
      case 'theme-snowman':
        return {
          unscrolled: 'bg-gradient-to-r from-blue-800 to-cyan-900',
          scrolled: 'bg-gradient-to-r from-blue-200 to-cyan-200 backdrop-blur-lg shadow-lg',
          activeItemUnscrolled: 'bg-white/20 text-white',
          activeItemScrolled: 'bg-blue-100 text-blue-900',
          inactiveItemUnscrolled: 'text-gray-300 hover:bg-white/10 hover:text-white',
          inactiveItemScrolled: 'text-gray-600 hover:bg-blue-50 hover:text-blue-900',
          themeButtonUnscrolled: 'bg-white/20 text-white hover:bg-white/30',
          themeButtonScrolled: 'bg-blue-100 text-blue-900 hover:bg-blue-200'
        };
        case 'theme-dark':
        return {
          unscrolled: 'bg-gradient-to-r from-dark-700 to-dark-900',
          scrolled: 'bg-gradient-to-r from-dark-800 to-dark-900 backdrop-blur-lg shadow-dark-luxe',
          activeItemUnscrolled: 'bg-gray-700/30 text-gray-100',
          activeItemScrolled: 'bg-dark-700 text-gray-100',
          inactiveItemUnscrolled: 'text-gray-400 hover:bg-gray-700/20 hover:text-white',
          inactiveItemScrolled: 'text-gray-300 hover:bg-dark-600 hover:text-white',
          themeButtonUnscrolled: 'bg-gray-700/20 text-gray-100 hover:bg-gray-700/30',
          themeButtonScrolled: 'bg-dark-700 text-gray-100 hover:bg-dark-600'
        };
      default:
        return {};
    }
  };

  const navbarStyles = getNavbarStyles();

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
          ? navbarStyles.scrolled
          : navbarStyles.unscrolled
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              NoteVault
            </h1>
          </div>
          <div className="flex items-center space-x-8">
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
                        ? navbarStyles.activeItemScrolled
                        : navbarStyles.activeItemUnscrolled
                      : scrolled
                        ? navbarStyles.inactiveItemScrolled
                        : navbarStyles.inactiveItemUnscrolled
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}

            {/* Theme Switch Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-200 ${
                scrolled 
                  ? navbarStyles.themeButtonScrolled
                  : navbarStyles.themeButtonUnscrolled
              }`}
              aria-label="Switch Theme"
            >
              <span className="text-xl">{themeIcon}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;