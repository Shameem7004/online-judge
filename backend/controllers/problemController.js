const { default: mongoose } = require('mongoose');
const Problem = require('../models/Problem');
const Testcase = require('../models/Testcase'); // 1. Import the Testcase model

// Helper function to process tags
const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags; // Already an array
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag); // Split, trim, and remove empty tags
};

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

// create the problem
const createProblem = async (req, res) => {
    try {
        const {
            name,
            statement,
            difficulty,
            points,
            topics,
            constraints,
            samples,
            tags,
            inputFormat,
            outputFormat
        } = req.body;

        // Generate slug automatically
        const slug = generateSlug(name);

        // Check for duplicate slug
        const existingProblem = await Problem.findOne({ slug });
        if (existingProblem) {
            return res.status(409).json({
                success: false,
                message: 'A problem with this name already exists (conflicting slug).'
            });
        }

        const problem = await Problem.create({
            name,
            slug,
            statement,
            difficulty,
            points,
            topics,
            constraints,
            samples,
            tags: processTags(tags), // Use the helper function
            inputFormat,
            outputFormat,
            author: req.user ? req.user._id : null
        });

        return res.status(201).json({
            success: true,
            message: 'Problem created successfully!',
            problem
        });

    } catch (error) {
        console.error('Create problem error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// to get all problems

const getAllProblems = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 15; // Show 15 problems per page
        const skip = (page - 1) * limit;

        const tag = req.query.tag; // Get tag from query

        const query = {};
        if (tag) {
            query.tags = tag; // Add tag to the filter query if it exists
        }

        const totalProblems = await Problem.countDocuments(query);
        const totalPages = Math.ceil(totalProblems / limit);

        const problems = await Problem.find(query)
            .sort({ createdAt: -1 }) // Optional: sort by newest
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            count: problems.length,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalProblems: totalProblems
            },
            problems: problems,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Problem by ID or slug
const getProblemById = async (req, res) => {
  try {
    const { slug } = req.params;
    let problem;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      problem = await Problem.findById(slug);
    } else {
      problem = await Problem.findOne({ slug });
    }
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    return res.status(200).json({ success: true, problem });
  } catch (err) {
    console.error('Get problem error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// 2. Add the updateProblem function
const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If the name is being updated, regenerate the slug
        if (updates.name) {
            updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            // Check if the new slug conflicts with another problem
            const existingProblem = await Problem.findOne({ slug: updates.slug, _id: { $ne: id } });
            if (existingProblem) {
                return res.status(409).json({ success: false, message: 'A problem with the new name (and slug) already exists.' });
            }
        }

        const { tags, ...otherUpdates } = updates;
        const updateData = { ...otherUpdates };
        if (tags !== undefined) {
            updateData.tags = processTags(tags); // Use the helper function
        }

        const updatedProblem = await Problem.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the updates adhere to the schema
        });

        if (!updatedProblem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        res.status(200).json({ success: true, problem: updatedProblem });

    } catch (error) {
        console.error('Update problem error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating problem' });
    }
};

// 3. Add the deleteProblem function
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        // CRITICAL: Delete all associated test cases to prevent orphaned data
        await Testcase.deleteMany({ problem: id });

        // Now, delete the problem itself
        await Problem.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Problem and all associated test cases deleted successfully.' });

    } catch (error) {
        console.error('Delete problem error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting problem' });
    }
};


module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,  // 4. Export the new functions
  deleteProblem
};