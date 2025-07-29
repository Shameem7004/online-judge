const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

const createSubmission = async (req, res) => {
    try{
        const {problemId, code, language} = req.body;

        if(!problemId || !code || !language){
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const problemExists = await Problem.findById(problemId);
        if(!problemExists){
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const newSubmission = new Submission({
            problem: problemId,
            user: req.user._id,
            code,
            language,
            verdict: 'Pending',
        });

        await newSubmission.save();

        res.status(201).json({
            success: true,
            message: "Submission Created",
            submission: newSubmission
        });

    } catch(error){
        console.error("Create Submission Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getAllSubmissions = async (req, res) => {
    try{
        const submissions = await Submission.find()
            .populate('problem', 'name slug')
            .populate('user', 'name email');

            res.json({ success: true, submissions });
        
    } catch(error){
        console.error("Get all submissions error:", error);
        res.status(500).json({ success: false, message: "server error" });
    }
};

const getSubmissionById = async (req, res) => {
    try{
        const submission = await Submission.findById(req.params.id)
            .populate('problem', 'name slug')
            .populate('user', 'name email');

        if(!submission){
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

    } catch(error){
        console.error("Gete submission by ID error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createSubmission,
    getAllSubmissions,
    getSubmissionById
};