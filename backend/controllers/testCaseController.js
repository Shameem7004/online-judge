const Testcase = require('../models/Testcase');
const Problem = require('../models/Problem');
// create testcases
const createTestcase = async (req, res) => {
    const { input, output, isSample } = req.body;
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
            isSample: isSample || false
        });

        res.status(201).json({ success:true, testcase});

    } catch(error){
        console.error('Error creating test case:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// get the testcases for each problem
const getTestcasesByProblem = async (req, res) => {

    const { problemId } = req.params;

    try{
        const testcases = await Testcase.find({ problem: problemId});
        
        if(!testcases){
            return res.status(404).json({ success: false, message: 'Test cases not found' });
        }
        
        res.json({ success: true, testcases});
    } catch(error){
        console.error('Error while fetching test cases:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
    const {input, output, isSample} = req.body;

    try{
        const testcase = await Testcase.findById(testcaseId);
        if(!testcase){
            return res.status(404).json({ success: false, message: 'Test case not found' });
        }

        if(input !== undefined) testcase.input = input;
        if(output !== undefined) testcase.output = output;
        if(isSample !== undefined) testcase.isSample = isSample;

        await testcase.save();
        res.json({ success: true, testcase });

    } catch (error) {
        console.error('Error updating test case:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createTestcase,
    getTestcasesByProblem,
    deleteTestcase,
    updateTestcase
};