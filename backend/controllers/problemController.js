const { default: mongoose } = require('mongoose');
const Problem = require('../models/Problem');

// create the problem
const createProblem = async (req, res) => {
    try {
        const {
            name,
            slug,
            statement,
            difficulty,
            points,
            topics,
            hints,
            constraints,
            samples,
            tags
        } = req.body

        if(!name || !slug || !statement || !difficulty){
            return res.status(400).json({
                success: false,
                message: 'Name, slug, statement and difficulty are required.'
            });
        }

        if (!samples || !Array.isArray(samples) || samples.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one sample test case is required.'
            });   
        }

        for (let i = 0; i < samples.length; i++) {
            const s = samples[i];
            if (!s.input || !s.output || !s.explanation) {
                return res.status(400).json({
                success: false,
                message: `Sample ${i + 1} must have input, output, and explanation.`
                });
            }
        }


        const existingProblem = await Problem.findOne({ slug });
        if(existingProblem){
            return res.status(409).json({
                success: false,
                message: 'Problem with this slug already exists.'
            });
        }

        const problem = await Problem.create({
            name,
            slug,
            statement,
            difficulty,
            points,
            topics,
            hints,
            constraints,
            samples,
            tags,
            // It checks if user object is attached to the request by a login middleware
            // If it is attached save the user id as author else null.
            author: req.user ? req.user._id : null
        });

        return res.status(201).json({
            success: true,
            message: 'Problem created successfully!',
            problem
        });

    } catch(error) {
        console.error('Create problem error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// to get all problems

const getAllProblems = async (req, res) => {
    try{
        const problems = await Problem.find({}, 'name slug difficulty points tags'); 
        return res.status(200).json({ success: true, problems });

    } catch(error){
        console.error('Get problems error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Problem by ID or slug
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = {slug: id};

    if(mongoose.Types.ObjectId.isValid(id)){
        query.$or = [{_id: id}, {slug: id}];
        delete query.slug;
    }
    // find by ID or slug
    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    return res.status(200).json({ success: true, problem });
  } catch (err) {
    console.error('Get problem error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById
};