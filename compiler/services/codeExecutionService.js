const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const cleanupFile = (filepath) => {
    if (filepath && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
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

    const imageMap = {
        cpp: { image: 'codeverse-compiler', command: `g++ ${filename} -o a.out && ./a.out` },
        c: { image: 'codeverse-compiler', command: `gcc ${filename} -o a.out && ./a.out` },
        python: { image: 'codeverse-compiler', command: `python3 ${filename}` },
        java: { image: 'codeverse-compiler', command: `javac ${filename} && java ${path.basename(filename, '.java')}` },
        javascript: { image: 'codeverse-compiler', command: `node ${filename}` }
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
            '-i', 
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