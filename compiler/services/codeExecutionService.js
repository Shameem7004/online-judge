// const { exec } = require('child_process');
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
    const codeDir = path.dirname(filepath);

    return new Promise((resolve, reject) => {
        let compileCommand, compileArgs, runCommand, runArgs;

        switch (language) {
            case 'cpp':
                compileCommand = 'g++';
                compileArgs = [filepath, '-o', outPath];
                runCommand = outPath;
                runArgs = [];
                break;
            case 'c':
                compileCommand = 'gcc';
                compileArgs = [filepath, '-o', outPath];
                runCommand = outPath;
                runArgs = [];
                break;
            case 'java':
                compileCommand = 'javac';
                compileArgs = [filepath];
                runCommand = 'java';
                // Assumes the file is named Main.java
                runArgs = ['-cp', codeDir, 'Main'];
                break;
            case 'python':
                // No compilation needed
                compileCommand = null;
                runCommand = 'python3';
                runArgs = [filepath];
                break;
            case 'javascript':
                // No compilation needed
                compileCommand = null;
                runCommand = 'node';
                runArgs = [filepath];
                break;
            default:
                return reject({ stderr: 'Unsupported language' });
        }

        // Compiled languages
        if (compileCommand) {
            execFile(compileCommand, compileArgs, (compileError, stdout, stderr) => {
                if (compileError || stderr) {
                    cleanupFiles([filepath]);
                    return reject({ error: compileError, stderr: stderr || compileError.message });
                }
                execFile(runCommand, runArgs, (runError, runStdout, runStderr) => {
                    console.log('JS execution callback reached:', { runError, runStdout, runStderr, filepath });
                    cleanupFiles([filepath, outPath]);
                    if (runError || runStderr) {
                        console.error('Error during JS execution:', runError, runStderr);
                        return reject({ error: runError, stderr: runStderr || runError.message });
                    }
                    resolve(runStdout);
                });
            });
        } else {
            // Interpreted languages
            execFile(runCommand, runArgs, (runError, runStdout, runStderr) => {
                cleanupFiles([filepath]);
                if (runError || runStderr) {
                    return reject({ error: runError, stderr: runStderr || runError.message });
                }
                resolve(runStdout);
            });
        }
    });
};

module.exports = { executeCode };