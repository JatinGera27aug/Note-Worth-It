import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, Italic, Image, Mic, Save, Underline, 
  List, ListOrdered, Quote, Code, Highlighter,
  AlignLeft, AlignCenter, AlignRight, Link, Heading,
  Sparkles, Wand2, BookOpen, Lightbulb, FileQuestion
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

const SaveNoteModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  


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
            <h3 className="text-xl font-semibold mb-4">Save Note</h3>
            <input
              type="text"
              placeholder="Note Title"
              className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="ideas">Ideas</option>
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave({ title, category })}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NoteEditor = () => {
  const [description, setdescription] = useState('');
  const [preview, setPreview] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAiFeatures, setShowAiFeatures] = useState(false);

  const colors = [
    '#000000', '#DC2626', '#2563EB', '#059669', '#7C3AED', '#DB2777'
  ];

  const aiFeatures = [
    { icon: Wand2, label: 'Simplify description', description: 'Make your description clearer and more concise' },
    { icon: FileQuestion, label: 'Continue Story', description: 'Let AI help continue your writing' },
    { icon: BookOpen, label: 'Learning Recommendations', description: 'Get personalized learning suggestions' },
    { icon: Lightbulb, label: 'Smart Insights', description: 'Extract key insights from your notes' }
  ];

  const handleFormat = (type) => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    
    let formattedText = '';
    switch(type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'highlight':
        formattedText = `<mark>${selectedText}</mark>`;
        break;
      case 'heading':
        formattedText = `\n# ${selectedText}\n`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText}\n`;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'ordered-list':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case 'color':
        formattedText = `<span style="color: ${selectedColor}">${selectedText}</span>`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        return;
    }
    
    const newdescription = description.substring(0, start) + formattedText + description.substring(end);
    setdescription(newdescription);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = description + `\n![${file.name}](${e.target.result})\n`;
        // setdescription(text);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = description + `\n<audio controls src="${e.target.result}"></audio>\n`;
        setdescription(text);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (noteDetails) => {

    // Here you would typically save the note with the title and category
    console.log('Saving note:', { ...noteDetails, description });
    try {
      await axios.post("http://localhost:8000/api/notes/create-note", { ...noteDetails, description });
    } catch (error) {
      console.error("Error creating notes:", error);
            alert(error.response?.data?.message || "An error occurred while saving notes.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-20 p-6"
    >
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4">
          <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-purple-200">
            <button
              onClick={() => handleFormat('heading')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Heading className="w-5 h-5 text-purple-700" />
            </button>
            <div className="h-6 w-px bg-purple-200" />
            <button
              onClick={() => handleFormat('bold')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Bold className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('italic')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Italic className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('underline')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Underline className="w-5 h-5 text-purple-700" />
            </button>
            <div className="h-6 w-px bg-purple-200" />
            <button
              onClick={() => handleFormat('list')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <List className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('ordered-list')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ListOrdered className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('quote')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Quote className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('code')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Code className="w-5 h-5 text-purple-700" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    handleFormat('color');
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {color === selectedColor && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-purple-200" />
            <button
              onClick={() => handleFormat('highlight')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Highlighter className="w-5 h-5 text-purple-700" />
            </button>
            <button
              onClick={() => handleFormat('link')}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Link className="w-5 h-5 text-purple-700" />
            </button>
            <label className="p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
              <Image className="w-5 h-5 text-purple-700" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                name='image'
                onChange={handleFileUpload}
              />
            </label>
            <label className="p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
              <Mic className="w-5 h-5 text-purple-700" />
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />
            </label>
            <div className="flex-1" />
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAiFeatures(!showAiFeatures)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center space-x-2 relative"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Features</span>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                  New
                </span>
              </motion.button>
              <AnimatePresence>
                {showAiFeatures && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scaleY: 0.8 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: 10, scaleY: 0.8 }}
                    style={{ transformOrigin: 'top' }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    {aiFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.button
                          key={feature.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="w-full p-3 flex items-start space-x-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors"
                        >
                          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{feature.label}</div>
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setPreview(!preview)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </motion.button>
          </div>
        </div>
        
        <div className="p-6">
          {preview ? (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={description}
              onChange={(e) => setdescription(e.target.value)}
              className="w-full h-[500px] p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Start writing your note here..."
            />
          )}
        </div>
      </div>

      <SaveNoteModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
      />
    </motion.div>
  );
};

export default NoteEditor;