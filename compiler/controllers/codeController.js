const { generateFile } = require('../utils/generateFile');
const { executeCode } = require('../services/codeExecutionService');

const runCode = async (req, res) => {
  const { language, code } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, error: 'Code or language missing' });
  }

  try {
    const filePath = await generateFile(language, code);
    if (!filePath) {
      return res.status(500).json({ success: false, error: 'Failed to generate file' });
    };
    
    const output = await executeCode(filePath, language);
    return res.json({ success: true, output });
  } catch (err) {
    const errorMessage = err.stderr || err.message || 'Error executing code';
    return res.status(500).json({ success: false, error: errorMessage });
  }
};

module.exports = { runCode };