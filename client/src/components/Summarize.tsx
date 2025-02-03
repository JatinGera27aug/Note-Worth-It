import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronRight, Sparkles } from 'lucide-react';

const SummarizeModal = ({ isOpen, onClose, note }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-[400px] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Summarize Note</h3>
            <p className="text-gray-600 mb-4">
              Would you like to generate a summary for "{note.title}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Summarizing note:', note);
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-2"
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

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  return (
    <div className="flex mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Text Summarization</h2>
          <p className="text-gray-600 mb-8">
            Select a note from the right to generate a concise summary using AI.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 p-6"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-4">
            <h3 className="text-white font-semibold">Recent Notes</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scroll-smooth">
            {dummyNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.9)" }}
                className="p-4 cursor-pointer group"
                onClick={() => handleNoteClick(note)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{note.preview}</p>
                    <p className="text-xs text-gray-400 mt-2">{note.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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