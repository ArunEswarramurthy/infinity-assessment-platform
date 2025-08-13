import React, { useState, useEffect, useRef } from 'react';
import { Play, Upload, Clock, Wifi, ChevronLeft, ChevronRight, Settings, Maximize2, RotateCcw } from 'lucide-react';
import CodeEditor from '@monaco-editor/react';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  testCases: Array<{ input: string; output: string; }>;
  constraints: string[];
}

const CodingPlatform: React.FC = () => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases' | 'instructions'>('problem');
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [testRunsLeft, setTestRunsLeft] = useState(25);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [isConnected, setIsConnected] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const problems: Problem[] = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
      testCases: [
        { input: "[2,7,11,15]\n9", output: "[0,1]" },
        { input: "[3,2,4]\n6", output: "[1,2]" },
        { input: "[3,3]\n6", output: "[0,1]" }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹",
        "Only one valid answer exists."
      ]
    },
    {
      id: 2,
      title: "Reverse Integer",
      difficulty: "Medium",
      statement: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

Example 1:
Input: x = 123
Output: 321

Example 2:
Input: x = -123
Output: -321`,
      testCases: [
        { input: "123", output: "321" },
        { input: "-123", output: "-321" },
        { input: "120", output: "21" }
      ],
      constraints: [
        "-2³¹ ≤ x ≤ 2³¹ - 1"
      ]
    }
  ];

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
};`
  };

  useEffect(() => {
    setCode(languageTemplates[language as keyof typeof languageTemplates]);
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
    
    // Simulate API call
    setTimeout(() => {
      setOutput(`Running with custom input...\n${customInput}\n\nOutput: Sample output for testing\n\nExecution time: 1.2s\nMemory used: 12.4MB`);
      setIsRunning(false);
    }, 1500);
  };

  const handleTestRun = async () => {
    if (testRunsLeft > 0) {
      setIsRunning(true);
      setTestRunsLeft(prev => prev - 1);
      setOutput(`Running test cases...\n`);
      
      setTimeout(() => {
        setOutput(`Test Run ${26 - testRunsLeft}/25\n\n✓ Test Case 1: Passed (2ms)\n✓ Test Case 2: Passed (1ms)\n✗ Test Case 3: Failed (3ms)\n\nExpected: [0,1]\nActual: [1,0]\n\nOverall: 2/3 test cases passed`);
        setIsRunning(false);
      }, 2000);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('Submitting solution...\n');
    
    setTimeout(() => {
      setOutput('🎉 Solution submitted successfully!\n\n✓ All test cases passed: 3/3\n✓ Execution time: 2ms\n✓ Memory usage: 44.2MB\n\nScore: 100/100');
      setIsRunning(false);
    }, 2500);
  };

  const handleReset = () => {
    setCode(languageTemplates[language as keyof typeof languageTemplates]);
    setOutput('');
    setCustomInput('');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const containerWidth = window.innerWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    setLeftPanelWidth(Math.min(Math.max(newWidth, 30), 70));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-600">CodeZy Platform</h1>
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-lg">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-red-600 font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}
            disabled={currentProblem === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
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
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Q{index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentProblem(Math.min(problems.length - 1, currentProblem + 1))}
            disabled={currentProblem === problems.length - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Panel */}
        <div 
          className="bg-white border-r border-gray-200 flex flex-col transition-all duration-200"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: 'problem', label: 'Problem' },
                { key: 'testcases', label: 'Test Cases' },
                { key: 'instructions', label: 'Instructions' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'problem' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-xl font-semibold">{problems[currentProblem].title}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    problems[currentProblem].difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problems[currentProblem].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problems[currentProblem].difficulty}
                  </span>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {problems[currentProblem].statement}
                  </pre>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Constraints:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {problems[currentProblem].constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div>
                <h3 className="font-semibold mb-4">Test Cases</h3>
                {problems[currentProblem].testCases.map((testCase, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Input:</span>
                        <pre className="mt-1 p-2 bg-white rounded border text-sm">{testCase.input}</pre>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Expected Output:</span>
                        <pre className="mt-1 p-2 bg-white rounded border text-sm">{testCase.output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div>
                <h3 className="font-semibold mb-4">Instructions</h3>
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-medium mb-2">How to use the platform:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Write your solution in the code editor on the right</li>
                      <li>Use "Dry Run" to test with custom input (unlimited)</li>
                      <li>Use "Test Run" to validate against test cases (25 attempts)</li>
                      <li>Click "Submit" when you're confident in your solution</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Supported Languages:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Java (OpenJDK 11)</li>
                      <li>Python (3.9)</li>
                      <li>C++ (GCC 9.4)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          ref={resizeRef}
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors duration-200"
          onMouseDown={handleMouseDown}
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
                onClick={handleReset}
                className="flex items-center space-x-1 px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm"
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDryRun}
                disabled={isRunning}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Dry Run</span>
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
                <span>Submit</span>
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
                mouseWheelZoom: true
              }}
            />
          </div>

          {/* Input/Output Section */}
          <div className="h-2/5 border-t border-gray-700">
            <div className="flex h-full">
              {/* Custom Input */}
              <div className="w-1/2 border-r border-gray-700">
                <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                  Custom Input
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
                <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                  Output
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

export default CodingPlatform;