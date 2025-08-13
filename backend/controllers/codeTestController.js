const { executeCode, checkCompilerAvailability } = require('../utils/codeExecutor');

// Test code execution with custom input
exports.testCode = async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    // Check compiler availability first
    const compilerCheck = await checkCompilerAvailability(language);
    if (!compilerCheck.available) {
      return res.json({
        success: false,
        output: '',
        error: compilerCheck.error,
        compilerError: true,
        executionTime: 0
      });
    }

    // Execute code
    const result = await executeCode(code, language, input);
    
    res.json({
      success: result.success,
      output: result.output || '',
      error: result.error || '',
      executionTime: result.executionTime || 0,
      compilerError: result.compilerError || false,
      runtimeError: result.runtimeError || false
    });

  } catch (error) {
    console.error('Code test error:', error);
    res.status(500).json({
      success: false,
      error: 'Code execution failed',
      output: '',
      executionTime: 0
    });
  }
};

// Get compiler status
exports.getCompilerStatus = async (req, res) => {
  try {
    const languages = ['java', 'python', 'c++', 'c'];
    const status = {};

    for (const lang of languages) {
      const check = await checkCompilerAvailability(lang);
      status[lang] = {
        available: check.available,
        error: check.error || null
      };
    }

    res.json({
      success: true,
      compilers: status
    });

  } catch (error) {
    console.error('Compiler status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check compiler status'
    });
  }
};