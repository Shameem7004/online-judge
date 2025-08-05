// compiler/services/codeExecutionService.js

// PREVIOUSLY: const { exec } = require('child_process');
// CHANGE: Switched to the more secure 'execFile' to prevent command injection vulnerabilities.
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// A helper function to manage file cleanup
const cleanupFiles = (files) => {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
};

const executeCode = (filepath, language) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outPath = path.join(outputDir, `${jobId}.out`);

    return new Promise((resolve, reject) => {
        let compileCommand, compileArgs, runCommand, runArgs;

        // CHANGE: Added a switch statement to handle different languages.
        // This makes the service extensible.
        switch (language) {
            case 'cpp':
                compileCommand = 'g++';
                compileArgs = [filepath, '-o', outPath];
                runCommand = outPath;
                runArgs = [];
                break;
            // You can add other compiled languages like C or Java here in the future
            default:
                // For interpreted languages like Python, we can skip compilation.
                // For now, we reject unsupported languages.
                return reject({ stderr: 'Unsupported language' });
        }

        // 1. COMPILE THE CODE
        execFile(compileCommand, compileArgs, (compileError, stdout, stderr) => {
            if (compileError || stderr) {
                cleanupFiles([filepath]); // Clean up the source file on error
                return reject({ error: compileError, stderr: stderr || compileError.message });
            }

            // 2. EXECUTE THE COMPILED CODE
            execFile(runCommand, runArgs, (runError, runStdout, runStderr) => {
                // CHANGE: Implemented robust cleanup for all generated files.
                cleanupFiles([filepath, outPath]); // Clean up both source and output files

                if (runError || runStderr) {
                    return reject({ error: runError, stderr: runStderr || runError.message });
                }
                resolve(runStdout);
            });
        });
    });
};

module.exports = { executeCode };