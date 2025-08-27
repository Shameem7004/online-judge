const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');

const codeDir = path.join(__dirname, '..', 'codes');

// Ensure the directory exists when the app starts
const dirExists = async () => {
    try {
        await fs.mkdir(codeDir, { recursive: true });
    } catch (error) {
        console.error("Could not create codes directory", error);
    }
}
dirExists();

const extensions = {
  cpp: 'cpp',
  c: 'c',
  python: 'py',
  java: 'java',
  javascript: 'js',
};

const generateFile = async (language, code) => {
  const extension = extensions[language];
  if (!extension) {
      throw new Error("Unsupported language for file generation.");
  }
  
  let filename;
  
  // Special handling for Java - extract class name from code
  if (language === 'java') {
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Main';
    filename = `${className}.${extension}`;
  } else {
    // For all other languages, use UUID
    const jobId = uuid();
    filename = `${jobId}.${extension}`;
  }
  
  const filepath = path.join(codeDir, filename);
  await fs.writeFile(filepath, code);
  return filepath;
};

module.exports = { generateFile };