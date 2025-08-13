const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCpp = (filePath, input = '') => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const executablePath = path.join(dir, fileName);
    
    // Compile C++ file
    exec(`g++ "${filePath}" -o "${executablePath}"`, { cwd: dir }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        reject({
          error: compileStderr || compileError.message,
          stderr: compileStderr,
          type: 'compilation'
        });
        return;
      }
      
      // Execute compiled binary
      const cppProcess = exec(`"${executablePath}"`, {
        cwd: dir,
        timeout: 5000 // 5 second timeout
      }, (runError, runStdout, runStderr) => {
        // Cleanup executable
        if (fs.existsSync(executablePath)) {
          fs.unlinkSync(executablePath);
        }
        if (fs.existsSync(executablePath + '.exe')) {
          fs.unlinkSync(executablePath + '.exe');
        }
        
        if (runError) {
          if (runError.killed) {
            reject({
              error: 'Execution timeout (5 seconds)',
              stderr: 'Time limit exceeded',
              type: 'timeout'
            });
          } else {
            reject({
              error: runStderr || runError.message,
              stderr: runStderr,
              type: 'runtime'
            });
          }
          return;
        }
        
        resolve(runStdout);
      });
      
      // Send input to the process if provided
      if (input) {
        cppProcess.stdin.write(input);
        cppProcess.stdin.end();
      }
    });
  });
};

module.exports = { executeCpp };