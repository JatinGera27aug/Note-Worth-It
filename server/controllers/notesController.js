const Notes = require('../models/notesModel.js')
const authModel = require("../models/authModel");
const { processText, summarizeText, rewrite, improveGrammar } = require('../utils/textProcessor.js')
const { geminiService } = require('../utils/geminiServices.js')
const Questions = require('../models/questionModel.js')
const Summary = require('../models/summaryModel.js')
const redisClient = require('../config/redis');

class NotesController {
    static getAllNotes = async (req, res) => {
        const user = req.user._id;
        try {
            const notes = await Notes.find({ user })
            if (!notes) {
                return res.status(404).json("No notes found");
            }
            return res.status(200).json(notes);
        }
        catch (err) {
            return res.status(500).json(err);
        }
    };

    static createNotes = async (req, res) => {
        const { title, category, description, imagePath } = req.body;
        const user = req.user._id;
        console.log('User ID:', req.user._id); // Check user ID
        // console.log('User:', req.user); // Check user object

        const file = req.file;
        console.log('File:', file);

        try {
            if (!title || !category || !user) {
                return res.status(400).json("Please fill all the fields");
            }

            const notUser = await authModel.findById(user);
            if (!notUser) {
                return res.status(404).json("User not found");
            }

            let finalDescription = description;

            // If image file is provided, extract text from the image
            if (file) {
                try {
                    const filePath = file.path;
                    const uniqueKey = `${Date.now()}-${user}-${file.filename}`; // Create a unique cache key
                    const cacheKey = `text:${uniqueKey}`; // Prefix with 'text' for clarity
                    console.log(uniqueKey, cacheKey);

                    // Check if text is already cached
                    const cachedText = await redisClient.get(cacheKey);
                    if (cachedText) {
                        console.log('Cache hit:', cacheKey);
                        finalDescription = cachedText;
                    } else {
                        // Extract text from the image if not cached
                        const extractedText = await geminiService.readTextFromImage(
                            filePath,
                            "Extract all text and format it as a clean list"
                        );
                        console.log('Extracted Text:', extractedText);

                        // Cache the extracted text for future use
                        await redisClient.set(cacheKey, extractedText, 'EX', 3600); // Cache for 1 hour
                        finalDescription = extractedText;
                    }
                } catch (error) {
                    console.error('Text extraction error:', error);
                    return res.status(500).json({ error: 'Failed to extract text from image' });
                }
            }

            // Check if finalDescription is valid
            if (!finalDescription) {
                return res.status(400).json("Description is required");
            }

            const escapeJSONString = (text) => {
                return JSON.stringify(text); // Escapes special characters automatically
            };
            const escapedDescription = escapeJSONString(finalDescription);

            const isNoteExist = await Notes.findOne({ title, category, description: escapedDescription, user })
            if (isNoteExist) {
                return res.status(409).json("Note already exist");
            }

            const notes = await Notes.create({ title, category, description: escapedDescription, user, image: file ? file.path : null })
            // const notes = await Notes.create(req.body)
            return res.status(200).json(notes);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    };

    // question gen. using gemini
    static NotesToQuestion = async (req, res) => {
        const notesId = req.params.notesId;
        try {
            const notes = await Notes.findById(notesId)
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            // Check cache
            const cachedQuestions = await redisClient.get(`questions:${notesId}`);
            if (cachedQuestions) {
                console.log("Cached Questions:")
                return res.status(200).json(JSON.parse(cachedQuestions));
            }

            // Check database
            const existingQuestions = await Questions.findOne({ note: notesId });
            if (existingQuestions) {
                console.log("Questions from Database:")
                // Cache the result and return
                await redisClient.set(`questions:${notesId}`, JSON.stringify(existingQuestions.questions), 'EX', 3600);
                return res.status(200).json(existingQuestions.questions);
            }

            // extracting description from it
            const description = notes.description;
            // console.log(description);

            const questionsResponse = await processText(description);
            console.log("UPSC-Style Questions:", questionsResponse);


            // Store in database
            const newQuestions = new Questions({
                note: notesId,
                questions: questionsResponse
            });
            await newQuestions.save();

            // Cache the result
            await redisClient.set(`questions:${notesId}`, JSON.stringify(questionsResponse), 'EX', 3600);

            return res.status(200).json(newQuestions.questions);  // ya TO DIRECT DB SE FRONTEND
            // return res.status(200).json({ message: "Gemini API is working" });
        }
        catch (err) {
            return res.status(500).json(err);
        }
    };


    // notes summary
    static notesSummary = async (req, res) => {
        const notesId = req.params.notesId;
        try {
            const notes = await Notes.findById(notesId)
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            // Check cache
            const cachedSummary = await redisClient.get(`Summary:${notesId}`);
            if (cachedSummary) {
                console.log("Cached Summary:")
                return res.status(200).json(JSON.parse(cachedSummary));
            }

            // Check database
            const existingSummary = await Summary.findOne({ note: notesId });
            if (existingSummary) {
                console.log("Summary from Database:")
                // Cache the result and return
                await redisClient.set(`Summary:${notesId}`, JSON.stringify(existingSummary.summary), 'EX', 3600);
                return res.status(200).json(existingSummary.summary);
            }

            // extracting description from it
            const description = notes.paraphrased_text && notes.paraphrased_text.trim() !== ""
            ? notes.paraphrased_text // Use paraphrased_text if available
            : notes.description;      // Fall back to description

            console.log(description);
            const summary = await summarizeText(description);
            console.log("Text Summary:", summary);

            // Store in database
            const newSummary = new Summary({
                note: notesId,
                summary: summary
            });
            await newSummary.save();

            // Cache the result
            await redisClient.set(`Summary:${notesId}`, JSON.stringify(summary), 'EX', 3600);

            return res.status(200).json({ message: "Gemini API is working" });
        } catch (err) {
            return res.status(500).json(err);
        }
    };

    // notes translation to another language
    static translateNote = async (req, res) => {
        const { notesId } = req.params;
        const { targetLanguage } = req.body;
        const user = req.user._id;

        try {
            const isUser = await authModel.findById(user);
            if (!isUser) {
                return res.status(404).json("User not found");
            }

            const notes = await Notes.findOne({ _id: notesId, user });
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            const translatedDescription = await geminiService.translateText(
                notes.description,
                targetLanguage,
            );
            console.log(translatedDescription);

            // Update the notes
            notes.translatedLanguage = targetLanguage;
            notes.translatedDescription = translatedDescription;
            await notes.save();

            return res.status(200).json({
                originalNote: notes,
                translatedDescription: translatedDescription,
                targetLanguage: targetLanguage
            });

        }
        catch (error) {
            console.error('Note Translation Error:', error);
            return res.status(500).json({ message: "Translation failed", error: error.message });
        }
    };

    // simplify text with change in manner as well
    static rewriteNote = async (req, res) => {
        const { notesId } = req.params;
        const { manner } = req.body;
        const user = req.user._id;

        try {
            const isUser = await authModel.findById(user);
            if (!isUser) {
                return res.status(404).json("User not found");
            }

            const notes = await Notes.findOne({ _id: notesId, user });
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            // extracting description from it
            const description = notes.paraphrased_text && notes.paraphrased_text.trim() !== ""
            ? notes.paraphrased_text // Use paraphrased_text if available
            : notes.description; 

            // console.log(description);
            const rewriteDescription = await rewrite(description, manner);
            console.log("Rewritten text:", rewriteDescription);

            // Update the notes
            notes.paraphrased_text = rewriteDescription;
            await notes.save();

            return res.status(200).json({ message: "Note Rewritten", rewriteDescription, originalNote: notes });

        }
        catch (error) {
            console.error('Note rewriting Error:', error);
            return res.status(500).json({ message: "Simplifying Note Failed", error: error.message });
        }
    };


    // undo the rewrite
    static undoRewrite = async (req, res) => {
        const { notesId } = req.params;
        const user = req.user._id;

        try {
            const isUser = await authModel.findById(user);
            if (!isUser) {
                return res.status(404).json("User not found");
            }

            const notes = await Notes.findOne({ _id: notesId, user });
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            // Update the notes
            notes.paraphrased_text = "";
            await notes.save();

            return res.status(200).json({ message: "Undo rewriting", originalNote: notes });
    }
    catch(err){
        res.status(500).json({ message: "Undo rewriting failed", error: err.message });
    }
};

    static ImproveGrammar = async (req, res) => {   // frontend mein if no edit, tbtk wo button hi hta dunga improve grammar wala, still can use redis

        const { notesId } = req.params;
        const user = req.user._id;

        try {
            const isUser = await authModel.findById(user);
            if (!isUser) {
                return res.status(404).json("User not found");
            }

            const notes = await Notes.findOne({ _id: notesId, user });
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            // can apply grammar to both description and paraphrased text, priority to paraphrased
            const description = notes.paraphrased_text && notes.paraphrased_text.trim() !== ""
            ? notes.paraphrased_text // Use paraphrased_text if available
            : notes.description; 

            const correctedText = await improveGrammar(description);
            console.log("Corrected text:", correctedText);

            // Update the notes
            notes.paraphrased_text = correctedText;
            await notes.save();

            return res.status(200).json({ message: "Grammar Improved", correctedText, originalNote: notes });

    }catch(error){
        res.status(500).json({ message: "Grammar Improvement failed", error: error.message });
    }
};

    static ViewSingleNote = async (req, res) => {
        const { notesId } = req.params;
        const user = req.user._id;

        try {
            const isUser = await authModel.findById(user);
            if (!isUser) {
                return res.status(404).json("User not found");
            }

            const cachedNote = await redisClient.get(`Note:${notesId}`);
            if (cachedNote) {
                console.log("Cached Note Retrieved:");
                const parsedNote = JSON.parse(cachedNote);
                return res.status(200).json({ 
                    message: "Note Found", 
                    notes: parsedNote 
                });
            }

            const notes = await Notes.findOne({ _id: notesId, user });
            if (!notes) {
                return res.status(404).json("No notes found");
            }

            const responseNote = {
                ...notes._doc,
                paraphrased_text: notes.paraphrased_text && notes.paraphrased_text.trim() !== "" 
                    ? notes.paraphrased_text 
                    : notes.description, // Fallback to description
            };

            // Cache the note
            await redisClient.set(`Note:${notesId}`, JSON.stringify(responseNote), 
                'EX', 3600
            );

            return res.status(200).json({ message: "Note Found", notes: responseNote });  // frontend par sirf notes.paraphrased_text dikhana hoga ab

        }
        catch (error) {
            console.error('Note fetching Error:', error);
            return res.status(500).json({ message: "Fetching Note Failed", error: error.message });
        }
    };

    // image reading (integrated with parent function)
    // static TextfromImage = async (req, res) => {
    //     try {
    //         const extractedText = await geminiService.readTextFromImage(
    //             'C:/Users/Jatin/Pictures/Screenshots/tata.png',
    //             "Extract all text and format it as a clean list"
    //         );
    //         console.log(extractedText);
    //         res.json({ text: extractedText });
    //     } catch (error) {
    //         console.error('Text extraction error:', error);
    //         res.status(500).json({ error: 'Failed to extract text from image' });
    //     }
    // }


}

module.exports = NotesController;

// rate limit will not be hindered as i will use cron job to scrape at a particular time only for the latest date event only , and will cache then so no more web scraping request  