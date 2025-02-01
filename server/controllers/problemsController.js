const Problem = require('../models/problemsModel.js');
const { geminiService } = require('../utils/geminiServices.js')
const redisClient = require('../config/redis');
const { deepseekService } = require('../utils/deepseekServices.js');
const crypto = require('crypto');


class ProblemsController {
    static solveProblem = async (req, res) => {
        try {
            const user = req.user._id;
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Extract problem text from different possible sources
            const problemText =
                req.body.problemText ||
                req.query.problemText ||
                (req.body && req.body.problem) ||
                '';

            // Extensive logging for debugging
            console.log('Problem Solving Request:', {
                problemText: problemText,
                bodyKeys: Object.keys(req.body),
                queryKeys: Object.keys(req.query),
                hasFile: !!req.file
            });

            // Validate input
            if (!problemText || problemText.trim() === '') {
                return res.status(400).json({
                    message: "Please provide a problem statement",
                    hint: "Ensure problem text is sent in the request body or query"
                });
            }

            // Check Redis cache first
            // const cacheKey = `ProblemSolution:${problemText.substring(0, 50)}`;
            // const cachedSolution = await redisClient.get(cacheKey);

            // upar older approach but not reliable and more memory consumption

            const cacheKey = `ProblemSolution:${crypto.createHash('sha256').update(problemText).digest('hex')}`;
            const countKey = `ProblemSolutionCount:${cacheKey}`;
            // taki regular access walo ka ttl lamba rkh ske

            // Check Redis Cache
            const cachedSolution = await redisClient.get(cacheKey);
            if (cachedSolution) {
                console.log("Cached Problem Solution Retrieved");
                await redisClient.incr(countKey);
                return res.status(200).json(JSON.parse(cachedSolution));
            }

            // checking from database
            const existingProblem = await Problem.findOne({ problem: problemText });
            if (existingProblem) {
                console.log("Existing Problem Solution Retrieved from db");
                return res.status(200).json(existingProblem);
            }

            // Solve the problem using Gemini
            const solution = await geminiService.SolveProblem(problemText, {
                context: {
                    source: 'text',
                    userId: req.user._id,
                    timestamp: new Date().toISOString()
                }
            });

            // Log solution for debugging
            console.log('Generated Solution:', {
                solutionLength: solution.solution ? solution.solution.length : 0,
                stepCount: solution.steps ? solution.steps.length : 0
            });

            // use DeepSeek either

            // *Immediate response to the user
            res.status(200).json(solution);

            // Save to DB in the background (does not block response)
            (async () => {
                try {
                    const newProblem = new Problem({
                        problem: problemText,
                        solution: solution.solution,
                        user: req.user._id
                    });
                    await newProblem.save();
                    console.log("Problem saved to database");
                } catch (dbError) {
                    console.error("Failed to save problem to DB:", dbError);
                    return res.status(500).json({ message: "failed saving to db", error: dbError.message });
                }
            })();


            // // Handle no solution scenario
            // if (!solution.solution) {
            //     return res.status(404).json({ 
            //         message: "Failed to solve problem",
            //         hint: "Try rephrasing the problem or provide more context"
            //     });
            // }


            // Track Access Count in Redis
            await redisClient.incr(countKey);
            const accessCount = await redisClient.get(countKey);


            // Set Dynamic TTL
            let ttl = 3600; // Default 1 hour
            if (accessCount > 10) ttl = 86400; // 1 day
            if (accessCount > 50) ttl = 604800; // 1 week


            //caching in bg
            (async () => {
                try {
                    await redisClient.set(cacheKey, JSON.stringify(solution), 'EX', ttl);
                    console.log("Solution cached in Redis");
                } catch (cacheError) {
                    console.error("Failed to cache solution:", cacheError);
                }
            })();

        } catch (error) {
            // Comprehensive error logging
            console.error('Problem Solving Controller Error:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                requestBody: req.body
            });

            return res.status(500).json({
                message: "Failed to solve problem",
                error: error.message,
                fallbackSources: [
                    {
                        name: "Chegg Study",
                        url: "https://www.chegg.com/study/",
                        description: "Detailed step-by-step solutions for complex problems"
                    },
                    {
                        name: "Symbolab",
                        url: "https://www.symbolab.com/",
                        description: "Advanced mathematical problem solver and calculator"
                    }
                ]
            });
        }
    };

    static retrySolving = async (req, res) => {
        const user = req.user._id;
        const { preferences } = req.body;
        try {
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const problemId = req.params.problemId;
            if (!problemId) {
                return res.status(400).json({ message: "Problem ID is required" });
            }

            const problem = await Problem.findById(problemId);
            if (!problem) {
                return res.status(404).json({ message: "Problem not found" });
            }

            const problemText = problem.problem;
            // console.log('Problem Retry Request:', problemText);


        }
        catch (error) {
            console.error('Problem Retry Controller Error:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                requestBody: req.body
            });
            return res.status(500).json({
                message: "Failed to retry solving problem",
                error: error.message,
                fallbackSources: [
                    {
                        name: "Chegg Study",
                        url: "https://www.chegg.com/study/",
                        description: "Detailed step-by-step solutions for complex problems"
                    },
                    {
                        name: "Symbolab",
                        url: "https://www.symbolab.com/",
                        description: "Advanced mathematical problem solver and calculator"
                    }
                ]
            });
        }

    }

}


module.exports = ProblemsController;
