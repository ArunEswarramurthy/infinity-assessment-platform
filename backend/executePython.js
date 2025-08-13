const { exec } = require('child_process');
const fs = require('fs');

const executePython = (filePath, input = '') => {
  return new Promise((resolve, reject) => {
    const pythonProcess = exec(`python3 "${filePath}"`, {
      timeout: 5000 // 5 second timeout
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          reject({
            error: 'Execution timeout (5 seconds)',
            stderr: 'Time limit exceeded',
            type: 'timeout'
          });
        } else {
          reject({
            error: stderr || error.message,
            stderr: stderr,
            type: 'runtime'
          });
        }
        return;
      }
      
      resolve(stdout);
    });
    
    // Send input to the process if provided
    if (input) {
      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();
    }
  });
};

module.exports = { executePython };