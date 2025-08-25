const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// A helper function to clean up the generated code file after execution
const cleanupFile = (filepath) => {
    // Check if the file exists before trying to delete it
    if (filepath && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        // Also clean up the compiled output for C/C++/Java if it exists
        const compiledPath = path.join(path.dirname(filepath), 'a.out');
        if (fs.existsSync(compiledPath)) {
            fs.unlinkSync(compiledPath);
        }
    }
};

const executeCode = (filepath, language, input = "") => {
    const filename = path.basename(filepath);
    const containerCodeDir = path.dirname(filepath);
    const hostCodeDir = process.env.HOST_CODE_DIR || containerCodeDir;

    // CHANGE: Update the map to use a single, unified image name for all languages.
    // The 'command' for each language remains the same because all compilers
    // are now available inside this one image.
    const imageMap = {
        cpp: { image: 'online-judge-compiler', command: `g++ ${filename} -o a.out && ./a.out` },
        c: { image: 'online-judge-compiler', command: `gcc ${filename} -o a.out && ./a.out` },
        python: { image: 'online-judge-compiler', command: `python3 ${filename}` },
        java: { image: 'online-judge-compiler', command: `javac ${filename} && java ${path.basename(filename, '.java')}` },
        javascript: { image: 'online-judge-compiler', command: `node ${filename}` }
    };

    const langConfig = imageMap[language];

    return new Promise((resolve, reject) => {
        if (!langConfig) {
            cleanupFile(filepath);
            return reject({ errorType: 'validation', error: 'Unsupported language' });
        }

        const dockerCommand = [
            'docker run',
            '--rm',
            '-i', // <-- ADD THIS FLAG to enable interactive mode and pass stdin
            '--network none',
            '--cpus="0.5"',
            '--memory="200m"',
            `-v "${hostCodeDir}:/app"`,
            `-w /app`,
            langConfig.image,
            `sh -c "${langConfig.command}"`
        ].join(' ');

        const startTime = process.hrtime();
        
        const child = exec(dockerCommand, { timeout: 10000 }, (error, stdout, stderr) => {
            const endTime = process.hrtime(startTime);
            const executionTimeMs = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2);
            
            cleanupFile(filepath);

            if (error) {
                if (error.killed) {
                    return reject({ errorType: 'timeout', error: 'Time Limit Exceeded' });
                }
                if (stderr.includes('error:')) {
                    return reject({ errorType: 'compilation', error: stderr, executionTime: executionTimeMs });
                }
                return reject({ errorType: 'runtime', error: stderr || error.message, executionTime: executionTimeMs });
            }
            
            if (stderr) {
                console.warn(`Execution for ${filename} produced stderr warnings: ${stderr}`);
            }

            resolve({ output: stdout, executionTime: executionTimeMs });
        });

        if (input) {
            const inputWithNewline = input.endsWith('\n') ? input : input + '\n';
            child.stdin.write(inputWithNewline);
            child.stdin.end();
        }
    });
};

module.exports = { executeCode };