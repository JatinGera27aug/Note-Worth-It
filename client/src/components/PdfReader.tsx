import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Upload, Sparkles, Bold, Italic, Underline, Highlighter, Save, Copy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TextHelper = ({ text, position, onCopy, onClose }) => {
  const { theme } = useTheme();

  const getHelperClasses = () => {
    switch(theme) {
      case 'theme-dark':
        return {
          container: 'bg-dark-700 text-gray-100 shadow-dark-luxe',
          button: 'hover:bg-dark-600 text-gray-300'
        };
      case 'theme-snowman':
        return {
          container: 'bg-snowman-100 text-gray-800 shadow-lg',
          button: 'hover:bg-snowman-200 text-gray-700'
        };
      default:
        return {
          container: 'bg-white',
          button: 'hover:bg-gray-100'
        };
    }
  };

  const helperClasses = getHelperClasses();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed rounded-lg shadow-lg p-2 z-50 flex items-center space-x-2 ${helperClasses.container}`}
        style={{
          top: position.y + window.scrollY + 20,
          left: position.x,
        }}
      >
        <button
          onClick={onCopy}
          className={`p-1.5 rounded flex items-center space-x-1 text-sm ${helperClasses.button}`}
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

const PdfReader = () => {
  const [selectedText, setSelectedText] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [helperPosition, setHelperPosition] = useState(null);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const { theme } = useTheme();

  const getPdfReaderClasses = () => {
    switch(theme) {
      case 'theme-dark':
        return {
          container: 'bg-dark-900 text-gray-100',
          card: 'rounded-t-lg  bg-dark-700 text-gray-200 mt-5',
          gradient: 'from-dark-700 to-dark-800',
          headerText: 'text-gray-100',
          uploadButton: 'bg-dark-600 hover:bg-dark-700 text-white-300',
          answerButton: 'from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-blue-900',
          textArea: 'bg-dark-600 text-gray-100',
          border: 'border-dark-600',
          icon: 'text-blue-500',
          buttonText: 'text-gray-100'
        };
      case 'theme-snowman':
        return {
          container: 'bg-snowman-100 text-gray-800',
          card: 'bg-white text-gray-900 mt-5 rounded-t-lg',
          gradient: 'from-blue-100 to-blue-200',
          headerText: 'text-gray-800',
          uploadButton: 'bg-blue-400 hover:bg-blue-200 text-blue-700',
          answerButton: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          textArea: 'bg-white text-gray-800',
          border: 'border-gray-200',
          icon: 'text-blue-600',
          buttonText: 'text-gray-800'
        };
      default:
        return {
          container: 'bg-gray-50',
          card: 'bg-white mt-2 rounded-lg',
          gradient: 'from-purple-100 to-indigo-100',
          headerText: 'text-gray-800',
          uploadButton: 'bg-white/50 hover:bg-white/70 ',
          answerButton: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
          textArea: 'bg-white text-black',
          border: 'border-gray-200',
          icon: 'text-purple-600',
          buttonText: 'text-gray-800 hover:text-white-300',
          buttonTextColor: 'text-white-300'
        };
    }
  };

  const pdfReaderClasses = getPdfReaderClasses();

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  const handleTextSelection = (event) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setHelperPosition({
        x: event.clientX,
        y: event.clientY
      });
    } else {
      setHelperPosition(null);
    }
  };

  const handleCopyText = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString();
      navigator.clipboard.writeText(text);
      setSelectedText(prev => prev + (prev ? '\n\n' : '') + text);
      setHelperPosition(null);
    }
  };

  const handleFormat = (type) => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedText.substring(start, end);
    
    let formattedText = '';
    switch(type) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'underline':
        formattedText = `<u>${text}</u>`;
        break;
      case 'highlight':
        formattedText = `<mark>${text}</mark>`;
        break;
      default:
        return;
    }
    
    setSelectedText(
      selectedText.substring(0, start) + formattedText + selectedText.substring(end)
    );
  };

  return (
    <div className={`flex mt-20 px-6 gap-6 ${pdfReaderClasses.container}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className={`card ${pdfReaderClasses.card}`}>
          <div className={`rounded-t-lg bg-gradient-to-r ${pdfReaderClasses.gradient} p-4 flex justify-between items-center`}>
            <h2 className={`text-lg font-semibold ${pdfReaderClasses.headerText}`}>PDF Viewer</h2>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 ${pdfReaderClasses.uploadButton} rounded-lg hover:bg-white/70 transition-colors flex items-center space-x-2`}
              >
                <Upload className={`w-4 h-4 ${pdfReaderClasses.icon} `} />
                <span className={pdfReaderClasses.buttonText}>Upload PDF</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 bg-gradient-to-r text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 ${pdfReaderClasses.answerButton} transition-colors flex items-center space-x-2 relative`}
              >
                <Sparkles className="w-4 h-4" />
                <span className={pdfReaderClasses.buttonTextColor}>Get Answers</span>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  New
                </span>
              </motion.button>
            </div>
          </div>
          <div 
            className={`p-6 h-[600px] ${pdfReaderClasses.border} relative`}
            onMouseUp={handleTextSelection}
          >
            {pdfUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Book className={`w-16 h-16 mx-auto ${pdfReaderClasses.icon} mb-4`} />
                  <h3 className={`text-lg font-medium ${pdfReaderClasses.headerText} mb-2`}>No PDF Selected</h3>
                  <p className={`${pdfReaderClasses.buttonText} mb-4`}>Upload a PDF file to get started</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 text-white rounded-lg ${pdfReaderClasses.uploadButton} hover:bg-purple-700 dark:hover:bg-blue-800 transition-colors inline-flex items-center space-x-2`}
                    // ${pdfReaderClasses.uploadButton} 
                  >
                    <Upload className={`w-4 h-4 ${pdfReaderClasses.icon}`} />
                    <span className={`${pdfReaderClasses.buttonText}` } >Choose File</span>
                  </button>
                </div>
              </div>
            )}
            {helperPosition && (
              <TextHelper
                position={helperPosition}
                onCopy={handleCopyText}
                onClose={() => setHelperPosition(null)}
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-96"
      >
        <div className={`card ${pdfReaderClasses.card}`}>
          <div className={`rounded-t-lg  bg-gradient-to-r ${pdfReaderClasses.gradient} p-4`}>
            <h3 className={`font-semibold mb-2 ${pdfReaderClasses.headerText}`}>Notes & Highlights</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFormat('bold')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-black"
              >
                <Bold className={`w-4 h-4 ${pdfReaderClasses.buttonText}`} />
              </button>
              <button
                onClick={() => handleFormat('italic')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-black"
              >
                <Italic className={`w-4 h-4 ${pdfReaderClasses.buttonText}`} />
              </button>
              <button
                onClick={() => handleFormat('underline')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-black"
              >
                <Underline className={`w-4 h-4 ${pdfReaderClasses.buttonText}`} />
              </button>
              <button
                onClick={() => handleFormat('highlight')}
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-black"
              >
                <Highlighter className={`w-4 h-4 ${pdfReaderClasses.buttonText}`} />
              </button>
              <div className="flex-1" />
              <button
                className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-black"
              >
                <Save className={`w-4 h-4 ${pdfReaderClasses.buttonText}`} />
              </button>
            </div>
          </div>
          <textarea 
            className={`w-full p-4 ${pdfReaderClasses.textArea} outline-none min-h-[300px]`}
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            placeholder="Your PDF notes will appear here..."
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PdfReader;