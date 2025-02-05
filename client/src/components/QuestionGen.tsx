import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronRight, Eye, EyeOff, Clock, History } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const QuestionModal = ({ isOpen, onClose, note }) => {
  const [questionType, setQuestionType] = useState('multiple');
  const [questionCount, setQuestionCount] = useState(5);

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
            <h3 className="text-xl font-semibold mb-4">Generate Questions</h3>
            <p className="text-gray-600 mb-4">
              Generate questions from "{note?.title || 'Unknown Note'}"
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setQuestionType('multiple')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      questionType === 'multiple'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    Multiple Choice
                  </button>
                  <button
                    onClick={() => setQuestionType('descriptive')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      questionType === 'descriptive'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    Descriptive
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1</span>
                  <span>{questionCount}</span>
                  <span>10</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Generating questions:', { questionType, questionCount });
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Question = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Q{index + 1}. {question.text}
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAnswer(!showAnswer)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {showAnswer ? (
            <EyeOff className="w-5 h-5 text-gray-500" />
          ) : (
            <Eye className="w-5 h-5 text-gray-500" />
          )}
        </motion.button>
      </div>
      {question.type === 'multiple' && !showAnswer && (
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Answer:</h4>
              <p className="text-gray-600">{question.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const dummyQuestions = [
  {
    id: 1,
    text: "What is the primary purpose of React hooks?",
    type: "multiple",
    options: [
      "To add state to functional components",
      "To create class components",
      "To style components",
      "To handle routing"
    ],
    answer: "To add state to functional components - Hooks allow you to use state and other React features in functional components."
  },
  {
    id: 2,
    text: "Explain the concept of state management in React applications.",
    type: "descriptive",
    answer: "State management in React refers to how data is handled and flows through an application. It involves maintaining and updating data that can change over time, affecting the UI and application behavior."
  }
];

const QuestionGen = () => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('notes'); // 'notes' or 'questions'
  const [questions, setQuestions] = useState(dummyQuestions);
  const { theme } = useTheme();

  const getQuestionGenClasses = () => {
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
          noteDate: 'text-gray-500',
          icon: 'text-blue-500'
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
          noteDate: 'text-gray-500',
          icon: 'text-blue-600'
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
          noteDate: 'text-gray-400',
          icon: 'text-purple-600'
        };
    }
  };

  const questionGenClasses = getQuestionGenClasses();

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowModal(true);
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

  return (
    <div className={`flex mt-20 ${questionGenClasses.container}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6"
      >
        <div className={`rounded-xl shadow-xl overflow-hidden ${questionGenClasses.card}`}>
          <div className="text-center p-6">
            <BrainCircuit className={`w-16 h-16 mx-auto mb-4 ${questionGenClasses.icon}`} />
            <h2 className={`text-2xl font-bold mb-4 ${questionGenClasses.noteTitle}`}>Question Generator</h2>
            <p className={`${questionGenClasses.notePreview} mb-8`}>
              Select a note from the right to generate practice questions.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 p-6"
      >
        <div className={`rounded-xl shadow-xl overflow-hidden ${questionGenClasses.card}`}>
          <div className={`bg-gradient-to-r ${questionGenClasses.gradient} p-4`}>
            <h3 className={`font-semibold ${questionGenClasses.headerText}`}>Recent Notes</h3>
          </div>
          <div className={`divide-y ${questionGenClasses.noteListBorder} max-h-[600px] overflow-y-auto scroll-smooth`}>
            {dummyNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ 
                  backgroundColor: questionGenClasses.noteHover.replace('hover:', '')
                }}
                onClick={() => handleNoteClick(note)}
                className={`p-4 cursor-pointer group ${questionGenClasses.noteHover}`}
              >
                <div>
                  <h4 className={`font-medium ${questionGenClasses.noteTitle}`}>{note.title}</h4>
                  <p className={`text-sm ${questionGenClasses.notePreview} mt-1`}>{note.preview}</p>
                  <p className={`text-xs ${questionGenClasses.noteDate} mt-2`}>{note.date}</p>
                </div>
                <ChevronRight className={`w-5 h-5 ${questionGenClasses.notePreview} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <QuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        note={selectedNote}
      />
    </div>
  );
};

export default QuestionGen;