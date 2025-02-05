import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SummarizeModal = ({ isOpen, onClose, note }) => {
  const { theme } = useTheme();

  const getModalClasses = () => {
    switch(theme) {
      case 'theme-dark':
        return {
          overlay: 'bg-black/60',
          container: 'bg-dark-700 text-gray-100 shadow-dark-luxe',
          cancelButton: 'border-dark-600 hover:bg-dark-600 text-gray-300',
          summarizeButton: 'bg-blue-700 text-white hover:bg-blue-800'
        };
      case 'theme-snowman':
        return {
          overlay: 'bg-black/40',
          container: 'bg-snowman-100 text-gray-800 shadow-lg',
          cancelButton: 'border-gray-200 hover:bg-gray-200 text-gray-700',
          summarizeButton: 'bg-blue-600 text-white hover:bg-blue-700'
        };
      default:
        return {
          overlay: 'bg-black/50',
          container: 'bg-white',
          cancelButton: 'border hover:bg-gray-50',
          summarizeButton: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
        };
    }
  };

  const modalClasses = getModalClasses();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 ${modalClasses.overlay} flex items-center justify-center z-2`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`rounded-xl p-6 w-[400px] shadow-xl ${modalClasses.container}`}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Summarize Note</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Would you like to generate a summary for "{note.title}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${modalClasses.cancelButton}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Summarizing note:', note);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${modalClasses.summarizeButton}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Summarize</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const dummyNotes = [
  {
    id: 1,
    title: "Meeting Notes - Project Kickoff",
    preview: "Discussion about new features and timeline...",
    date: "2024-03-10"
  },
  {
    id: 2,
    title: "Research on AI Implementation",
    preview: "Key findings about machine learning models...",
    date: "2024-03-09"
  },
  {
    id: 3,
    title: "Client Feedback Summary",
    preview: "Main points from the client review session...",
    date: "2024-03-08"
  },
  {
    id: 4,
    title: "Weekly Team Updates",
    preview: "Progress updates from different departments...",
    date: "2024-03-07"
  },
  {
    id: 5,
    title: "Product Strategy Notes",
    preview: "Long-term vision and upcoming features...",
    date: "2024-03-06"
  }
];

const Summarize = () => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();

  const getSummarizeClasses = () => {
    switch(theme) {
      case 'theme-dark':
        return {
          container: 'bg-dark-900 text-gray-100',
          card: 'bg-dark-700 text-gray-200',
          gradient: 'from-dark-700 to-dark-800',
          headerText: 'text-gray-100',
          noteListBorder: 'divide-dark-600',
          noteHover: 'hover:bg-dark-700/50',
          noteTitle: 'text-gray-100',
          notePreview: 'text-gray-400',
          noteDate: 'text-gray-500'
        };
      case 'theme-snowman':
        return {
          container: 'bg-snowman-100 text-gray-800',
          card: 'bg-white text-gray-900',
          gradient: 'from-blue-100 to-blue-200',
          headerText: 'text-gray-800',
          noteListBorder: 'divide-gray-200',
          noteHover: 'hover:bg-blue-50',
          noteTitle: 'text-gray-900',
          notePreview: 'text-gray-600',
          noteDate: 'text-gray-500'
        };
      default:
        return {
          container: 'bg-gray-50',
          card: 'bg-white',
          gradient: 'from-purple-800 to-indigo-900',
          headerText: 'text-white',
          noteListBorder: 'divide-gray-100',
          noteHover: 'hover:bg-gray-50',
          noteTitle: 'text-gray-900',
          notePreview: 'text-gray-500',
          noteDate: 'text-gray-400'
        };
    }
  };

  const summarizeClasses = getSummarizeClasses();

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  return (
    <div className={`flex mt-20 ${summarizeClasses.container}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        <div className={`rounded-xl shadow-xl overflow-hidden ${summarizeClasses.card}`}>
          <div className="text-center p-8">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'theme-dark' ? 'text-blue-500' : 'text-purple-600'}`} />
            <h2 className={`text-2xl font-bold mb-4 ${summarizeClasses.noteTitle}`}>Text Summarization</h2>
            <p className={`${summarizeClasses.notePreview} mb-8`}>
              Select a note from the right to generate a concise summary using AI.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 p-6"
      >
        <div className={`rounded-xl shadow-xl overflow-hidden ${summarizeClasses.card}`}>
          <div className={`bg-gradient-to-r ${summarizeClasses.gradient} p-4`}>
            <h3 className={`font-semibold ${summarizeClasses.headerText}`}>Recent Notes</h3>
          </div>
          <div className={`divide-y ${summarizeClasses.noteListBorder} max-h-[600px] overflow-y-auto scroll-smooth`}>
            {dummyNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ 
                  backgroundColor: theme === 'theme-dark' 
                    ? "rgba(31, 41, 55, 0.7)" 
                    : theme === 'theme-snowman'
                    ? "rgba(191, 219, 254, 0.5)"
                    : "rgba(249, 250, 251, 0.9)" 
                }}
                className={`p-4 cursor-pointer group ${summarizeClasses.noteHover}`}
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${summarizeClasses.noteTitle}`}>{note.title}</h4>
                    <p className={`text-sm ${summarizeClasses.notePreview} mt-1`}>{note.preview}</p>
                    <p className={`text-xs ${summarizeClasses.noteDate} mt-2`}>{note.date}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${summarizeClasses.notePreview}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <SummarizeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        note={selectedNote}
      />
    </div>
  );
};

export default Summarize;