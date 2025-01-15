const Notes = require('../models/notesModel.js')
const authModel = require("../models/authModel");
const { processText, summarizeText } = require('../utils/textProcessor.js')
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

            // return res.status(200).json(questionsResponse);
            return res.status(200).json({ message: "Gemini API is working" });
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
            const description = notes.description;
            // console.log(description);
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