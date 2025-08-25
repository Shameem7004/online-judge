const Testcase = require('../models/Testcase');
const Problem = require('../models/Problem');
// create testcases
const createTestcase = async (req, res) => {
    // 1. Destructure the new displayInput field from the body
    const { input, output, explanation, isSample, displayInput } = req.body;
    const { problemId } = req.params;

    try{
        const problem = await Problem.findById(problemId);
        if(!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        const testcase = await Testcase.create({
            problem: problemId,
            input, 
            output,
            explanation,
            // 2. Add displayInput to the creation object
            displayInput,
            isSample: isSample || false
        });

        res.status(201).json({ success:true, testcase});

    } catch(error){
        console.error('Error creating test case:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all testcases for a problem
const getTestcases = async (req, res) => {
  try {
    const { problemId } = req.params;
    const testcases = await Testcase.find({ problem: problemId });
    res.json({ success: true, testcases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch testcases' });
  }
};

// to delete the testcase
const deleteTestcase = async (req, res) => {
    const { testcaseId } = req.params;

    try{
        const testcase = await Testcase.findById(testcaseId);
        if(!testcase){
            return res.status(404).json({ success: false, message: 'Test case not found' });
        }

        await testcase.deleteOne();
        res.json({ success: true, message: 'Test case deleted' });

    } catch (error) {
        console.error('Error deleting test case:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// to update the testcase
const updateTestcase = async (req, res) => {
    const { testcaseId } = req.params;
    // 3. Destructure the new displayInput field here as well
    const {input, output, explanation, isSample, displayInput} = req.body;

    try{
        const testcase = await Testcase.findById(testcaseId);
        if(!testcase){
            return res.status(404).json({ success: false, message: 'Test case not found' });
        }

        if(input !== undefined) testcase.input = input;
        if(output !== undefined) testcase.output = output;
        if(isSample !== undefined) testcase.isSample = isSample;
        if(explanation !== undefined) testcase.explanation = explanation;
        // 4. Add the update logic for the new field
        if(displayInput !== undefined) testcase.displayInput = displayInput;

        await testcase.save();
        res.json({ success: true, testcase });

    } catch (error) {
        console.error('Error updating test case:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createTestcase,
    getTestcases,
    deleteTestcase,
    updateTestcase
};