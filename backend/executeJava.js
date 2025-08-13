const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeJava = (filePath, input = '') => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.java');
    
    // Compile Java file
    exec(`javac "${filePath}"`, { cwd: dir }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        reject({
          error: compileStderr || compileError.message,
          stderr: compileStderr,
          type: 'compilation'
        });
        return;
      }
      
      // Execute compiled Java class
      const javaProcess = exec(`java ${fileName}`, { 
        cwd: dir,
        timeout: 5000 // 5 second timeout
      }, (runError, runStdout, runStderr) => {
        // Cleanup class file
        const classFile = path.join(dir, `${fileName}.class`);
        if (fs.existsSync(classFile)) {
          fs.unlinkSync(classFile);
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
        javaProcess.stdin.write(input);
        javaProcess.stdin.end();
      }
    });
  });
};

module.exports = { executeJava };