import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const CodeTester = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [compilerStatus, setCompilerStatus] = useState({});
  const [executionTime, setExecutionTime] = useState(0);

  const sampleCode = {
    python: 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
    java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = sc.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}',
    'c++': '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    getline(cin, name);\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
    c: '#include <stdio.h>\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    fgets(name, sizeof(name), stdin);\n    printf("Hello, %s", name);\n    return 0;\n}'
  };

  useEffect(() => {
    fetchCompilerStatus();
    setCode(sampleCode[language]);
  }, [language]);

  const fetchCompilerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/code-test/compilers');
      if (response.data.success) {
        setCompilerStatus(response.data.compilers);
      }
    } catch (error) {
      console.error('Failed to fetch compiler status:', error);
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setOutput('');
    setError('');
    setExecutionTime(0);

    try {
      const response = await axios.post('http://localhost:5000/api/code-test/test', {
        code,
        language,
        input
      });

      const result = response.data;
      setOutput(result.output || '');
      setError(result.error || '');
      setExecutionTime(result.executionTime || 0);

    } catch (error) {
      setError('Network error: Failed to execute code');
    } finally {
      setLoading(false);
    }
  };

  const getCompilerStatusIcon = (lang) => {
    const status = compilerStatus[lang];
    if (!status) return <Clock className="w-4 h-4 text-gray-400" />;
    return status.available ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Code Compiler Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="flex gap-2">
            {Object.keys(sampleCode).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage(lang)}
                className="flex items-center gap-2"
              >
                {getCompilerStatusIcon(lang)}
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Compiler Status */}
          {compilerStatus[language] && !compilerStatus[language].available && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Compiler Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                {compilerStatus[language].error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Code:</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                placeholder="Enter your code here..."
              />
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Input (optional):</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
                placeholder="Enter input for your program..."
              />

              {/* Run Button */}
              <Button 
                onClick={runCode} 
                disabled={loading || !compilerStatus[language]?.available}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Section */}
          {(output || error || executionTime > 0) && (
            <div className="space-y-4">
              {/* Execution Time */}
              {executionTime > 0 && (
                <div className="text-sm text-gray-600">
                  Execution time: {executionTime}ms
                </div>
              )}

              {/* Output */}
              {output && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700">Output:</label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-700">Error:</label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap text-red-800">{error}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeTester;