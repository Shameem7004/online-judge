const { generateFile } = require('../utils/generateFile');
const { executeCode } = require('../services/codeExecutionService');

const runCode = async (req, res) => {
  const { language, code, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, error: 'Code or language missing' });
  }

  try {
    const filePath = await generateFile(language, code);
    const { output, executionTime, memoryUsed } = await executeCode(filePath, language, input);
    return res.json({ success: true, output, executionTime, memoryUsed });
  } catch (err) {
    console.error("Execution/Compilation Error:", err);
    return res.status(400).json({ 
        success: false, 
        error: err.error, 
        errorType: err.errorType || 'unknown' 
    });
  }
};

module.exports = { runCode };