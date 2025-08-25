const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const mongoose = require('mongoose');
const Submission = require('../models/Submission'); // Ensure Submission model is imported

// Function to seed dummy contests (for development)
const seedContests = async () => {
    try {
        const contestCount = await Contest.countDocuments();
        if (contestCount > 0) {
            // This is not an error, so using console.log is better
            // console.log('Contests already exist. Skipping seed.');
            return;
        }

        const problems = await Problem.find().limit(5);
        if (problems.length < 5) {
            console.log('Not enough problems to create contests. Please add more problems.');
            return;
        }

        // 2. Find a user to be the author of the seeded contests
        const systemUser = await User.findOne();
        if (!systemUser) {
            console.log('Cannot seed contests because no users exist in the database.');
            return;
        }

        // 3. Add the `createdBy` field to each dummy contest
        const dummyContests = [
            {
                title: 'Weekly Contest #101',
                description: 'A fun contest with 3 challenging problems. Get ready!',
                problems: [problems[0]._id, problems[1]._id, problems[2]._id],
                startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // A week ago
                endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
                createdBy: systemUser._id
            },
            {
                title: 'Monthly Mayhem',
                description: 'The ultimate monthly challenge. Features 5 problems of varying difficulty.',
                problems: problems.map(p => p._id),
                startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
                createdBy: systemUser._id
            },
            {
                title: 'Data Structures Showdown',
                description: 'Test your knowledge of core data structures.',
                problems: [problems[0]._id, problems[3]._id, problems[4]._id],
                startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
                endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
                createdBy: systemUser._id
            }
        ];

        await Contest.insertMany(dummyContests);
        console.log('Dummy contests have been seeded!');
    } catch (error) {
        console.error('Error seeding contests:', error);
    }
};

// Call the seed function when the server starts (or create a dedicated route)
seedContests();

// @desc    Create a new contest
// @route   POST /api/contests
// @access  Admin
exports.createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, problemIds } = req.body;

        // For now, let's assume the user making the request is an admin
        const contest = new Contest({
            title,
            description,
            startTime,
            endTime,
            problems: problemIds,
            createdBy: req.user._id, // from auth middleware
        });

        await contest.save();
        res.status(201).json({ success: true, data: contest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
exports.getAllContests = async (req, res) => {
    try {
        // Return a single sorted array of all contests
        const contests = await Contest.find().sort({ startTime: -1 }).populate('problems', 'name');
        res.status(200).json({ success: true, data: contests });
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single contest by its ID
// @route   GET /api/contests/:id
// @access  Public
exports.getContestDetails = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems', 'name slug difficulty');
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }
        res.status(200).json({ success: true, data: contest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register the current user for a contest
// @route   POST /api/contests/:id/register
// @access  Private (Logged-in users)
exports.registerForContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        if (new Date(contest.startTime) < new Date()) {
            return res.status(400).json({ success: false, message: 'Cannot register for a contest that has already started.' });
        }

        if (contest.participants.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Already registered for this contest.' });
        }

        contest.participants.push(req.user._id);
        await contest.save();

        res.status(200).json({ success: true, message: 'Successfully registered for the contest.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a contest (Admin only)
// @route   PUT /api/contests/:id
exports.updateContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        res.status(200).json({ success: true, data: contest });
    } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ success: false, message: 'Server error while updating contest.' });
    }
};

// @desc    Delete a contest (Admin only)
// @route   DELETE /api/contests/:id
exports.deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        // Note: This doesn't delete associated submissions, which might be desired for historical data.
        res.status(200).json({ success: true, message: 'Contest deleted successfully' });
    } catch (error) {
        console.error("Error deleting contest:", error);
        res.status(500).json({ success: false, message: 'Server error while deleting contest.' });
    }
};

// @desc    Get the leaderboard for a specific contest
// @route   GET /api/contests/:id/leaderboard
// THIS IS THE CORRECTED FUNCTION - IT REPLACES THE OLD ONE
exports.getContestLeaderboard = async (req, res) => {
    try {
        const contestId = req.params.id;
        const contest = await Contest.findById(contestId);

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found.' });
        }

        const leaderboard = await Submission.aggregate([
            {
                $match: {
                    problem: { $in: contest.problems },
                    verdict: 'Accepted',
                    createdAt: { $gte: contest.startTime, $lte: contest.endTime }
                }
            },
            { $sort: { user: 1, createdAt: 1 } },
            {
                $group: {
                    _id: { user: "$user", problem: "$problem" },
                    firstAccepted: { $first: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id.problem',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            {
                $group: {
                    _id: "$_id.user",
                    totalPoints: { $sum: { $arrayElemAt: ["$problemDetails.points", 0] } },
                    problemsSolved: { $sum: 1 }
                }
            },
            { $sort: { totalPoints: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $project: {
                    _id: 0,
                    username: { $arrayElemAt: ["$userDetails.username", 0] },
                    totalPoints: 1,
                    problemsSolved: 1
                }
            }
        ]);

        res.status(200).json({ success: true, leaderboard });

    } catch (error) {
        console.error("Error fetching contest leaderboard:", error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};