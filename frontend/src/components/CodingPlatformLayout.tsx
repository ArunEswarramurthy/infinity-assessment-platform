import React, { useState, useEffect } from 'react';
import { 
  Play, Upload, Clock, Wifi, ChevronLeft, ChevronRight, 
  Settings, RotateCcw, Maximize2, Minimize2, Sun, Moon,
  Terminal, FileText, HelpCircle, Save
} from 'lucide-react';
import CodeEditor from '@monaco-editor/react';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  testCases: Array<{ input: string; output: string; explanation?: string; }>;
  constraints: string[];
  hints: string[];
}

interface CodingPlatformLayoutProps {
  problems: Problem[];
  onSubmit?: (code: string, language: string, problemId: number) => void;
  onTestRun?: (code: string, language: string, problemId: number) => void;
  onDryRun?: (code: string, language: string, customInput: string) => void;
}

const CodingPlatformLayout: React.FC<CodingPlatformLayoutProps> = ({
  problems,
  onSubmit,
  onTestRun,
  onDryRun
}) => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases' | 'instructions' | 'hints'>('problem');
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [testRunsLeft, setTestRunsLeft] = useState(25);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isConnected, setIsConnected] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const languageTemplates = {
    java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
    python: `def twoSum(nums, target):
    # Your code here
    return []`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
    return [];
};`
  };

  useEffect(() => {
    setCode(languageTemplates[language as keyof typeof languageTemplates] || '');
  }, [language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDryRun = async () => {
    setIsRunning(true);
    setOutput('Running with custom input...\n');
    
    if (onDryRun) {
      onDryRun(code, language, customInput);
    } else {
      setTimeout(() => {
        setOutput(`Running with custom input...\n${customInput}\n\nOutput: Sample output for testing\n\nExecution time: 1.2s\nMemory used: 12.4MB`);
        setIsRunning(false);
      }, 1500);
    }
  };

  const handleTestRun = async () => {
    if (testRunsLeft > 0) {
      setIsRunning(true);
      setTestRunsLeft(prev => prev - 1);
      setOutput('Running test cases...\n');
      
      if (onTestRun) {
        onTestRun(code, language, problems[currentProblem].id);
      } else {
        setTimeout(() => {
          setOutput(`Test Run ${26 - testRunsLeft}/25\n\n✓ Test Case 1: Passed (2ms)\n✓ Test Case 2: Passed (1ms)\n✗ Test Case 3: Failed (3ms)\n\nExpected: [0,1]\nActual: [1,0]\n\nOverall: 2/3 test cases passed`);
          setIsRunning(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('Submitting solution...\n');
    
    if (onSubmit) {
      onSubmit(code, language, problems[currentProblem].id);
    } else {
      setTimeout(() => {
        setOutput('🎉 Solution submitted successfully!\n\n✓ All test cases passed: 3/3\n✓ Execution time: 2ms\n✓ Memory usage: 44.2MB\n\nScore: 100/100');
        setIsRunning(false);
      }, 2500);
    }
  };

  const handleReset = () => {
    setCode(languageTemplates[language as keyof typeof languageTemplates] || '');
    setOutput('');
    setCustomInput('');
  };

  const handleSave = () => {
    localStorage.setItem(`code_${problems[currentProblem].id}_${language}`, code);
    setOutput('Code saved locally!\n\nYour progress has been saved and will be restored when you return.');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentProblemData = problems[currentProblem];

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 md:px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <h1 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            CodeZy Platform
          </h1>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
            timeLeft < 600 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center space-x-2">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm hidden md:inline ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 md:px-6 py-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}
              disabled={currentProblem === 0}
              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 disabled:opacity-50' : 'hover:bg-gray-100 disabled:opacity-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {problems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProblem(index)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentProblem === index 
                    ? 'bg-blue-600 text-white' 
                    : theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Q{index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentProblem(Math.min(problems.length - 1, currentProblem + 1))}
              disabled={currentProblem === problems.length - 1}
              className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 disabled:opacity-50' : 'hover:bg-gray-100 disabled:opacity-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentProblem + 1} of {problems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div 
          className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col transition-all duration-200`}
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <div className="flex overflow-x-auto">
              {[
                { key: 'problem', label: 'Problem', icon: FileText },
                { key: 'testcases', label: 'Test Cases', icon: Terminal },
                { key: 'instructions', label: 'Instructions', icon: HelpCircle },
                { key: 'hints', label: 'Hints', icon: HelpCircle }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {activeTab === 'problem' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentProblemData.title}
                  </h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentProblemData.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    currentProblemData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentProblemData.difficulty}
                  </span>
                </div>
                <div className="prose max-w-none">
                  <pre className={`whitespace-pre-wrap text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {currentProblemData.statement}
                  </pre>
                </div>
                <div className="mt-6">
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Constraints:
                  </h3>
                  <ul className={`list-disc list-inside text-sm space-y-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {currentProblemData.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Test Cases
                </h3>
                {currentProblemData.testCases.map((testCase, index) => (
                  <div key={index} className={`mb-4 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Test Case {index + 1}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>Input:</span>
                        <pre className={`mt-1 p-2 rounded border text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}>{testCase.input}</pre>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>Expected Output:</span>
                        <pre className={`mt-1 p-2 rounded border text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}>{testCase.output}</pre>
                      </div>
                      {testCase.explanation && (
                        <div>
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>Explanation:</span>
                          <p className={`mt-1 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                          }`}>{testCase.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Instructions
                </h3>
                <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      How to use the platform:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Write your solution in the code editor on the right</li>
                      <li>Use "Dry Run" to test with custom input (unlimited)</li>
                      <li>Use "Test Run" to validate against test cases (25 attempts)</li>
                      <li>Click "Submit" when you're confident in your solution</li>
                      <li>Use "Save" to store your progress locally</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Supported Languages:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Java (OpenJDK 11)</li>
                      <li>Python (3.9)</li>
                      <li>C++ (GCC 9.4)</li>
                      <li>JavaScript (Node.js)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Keyboard Shortcuts:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ctrl+S: Save code</li>
                      <li>Ctrl+Enter: Run test cases</li>
                      <li>F11: Toggle fullscreen</li>
                      <li>Ctrl+/: Toggle comments</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hints' && (
              <div>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Hints
                </h3>
                {currentProblemData.hints.length > 0 ? (
                  <div className="space-y-3">
                    {currentProblemData.hints.map((hint, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 border-blue-500 ${
                        theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                      }`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>Hint {index + 1}:</strong> {hint}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
                    No hints available for this problem
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-200"
          onMouseDown={(e) => {
            setIsResizing(true);
            e.preventDefault();
          }}
        />

        {/* Right Panel */}
        <div 
          className="bg-gray-900 flex flex-col transition-all duration-200"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Code Editor Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  className="text-gray-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700"
                >A-</button>
                <span className="text-gray-300 text-xs">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                  className="text-gray-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700"
                >A+</button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                title="Save Code"
              >
                <Save className="w-4 h-4" />
                <span className="hidden md:inline">Save</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center space-x-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Reset</span>
              </button>
              
              <button
                onClick={handleDryRun}
                disabled={isRunning}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Dry Run</span>
              </button>
              
              <button
                onClick={handleTestRun}
                disabled={testRunsLeft === 0 || isRunning}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Test ({testRunsLeft})</span>
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden md:inline">Submit</span>
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              height="60%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                renderWhitespace: 'selection',
                cursorBlinking: 'blink',
                mouseWheelZoom: true,
                contextmenu: true,
                selectOnLineNumbers: true
              }}
            />
          </div>

          {/* Input/Output Section */}
          <div className="h-2/5 border-t border-gray-700">
            <div className="flex h-full">
              {/* Custom Input */}
              <div className="w-1/2 border-r border-gray-700">
                <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium flex items-center justify-between">
                  <span>Custom Input</span>
                  <button
                    onClick={() => setCustomInput('')}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-full bg-gray-900 text-white p-4 text-sm font-mono resize-none border-none outline-none"
                  placeholder="Enter your custom input here..."
                />
              </div>

              {/* Output */}
              <div className="w-1/2">
                <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium flex items-center justify-between">
                  <span>Output</span>
                  <button
                    onClick={() => setOutput('')}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                </div>
                <div className="h-full bg-gray-900 text-white p-4 text-sm font-mono overflow-auto">
                  <pre className="whitespace-pre-wrap">{output || 'Output will appear here...'}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPlatformLayout;