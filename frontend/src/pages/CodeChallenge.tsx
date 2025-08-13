
import { useState } from "react";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Send, Clock, CheckCircle, X, Trophy, Star } from "lucide-react";
import { useParams } from "react-router-dom";

const CodeChallenge = () => {
  const { challengeId } = useParams();
  const [code, setCode] = useState(`def solution(nums, target):
    # Write your solution here
    pass`);
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showSubmitResult, setShowSubmitResult] = useState(false);

  const challengeData = {
    title: "Two Sum Problem",
    difficulty: "Medium",
    points: 100,
    timeLimit: "2 hours",
    acceptance: "78.2%",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: `nums: List[int] - An array of integers
target: int - The target sum`,
    outputFormat: `List[int] - Indices of the two numbers that add up to target`,
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹", 
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6", 
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]", passed: null },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]", passed: null },
      { input: "[3,3], 6", expectedOutput: "[0,1]", passed: null }
    ]
  };

  const handleRunCode = () => {
    setOutput("Running code...\n\n✅ Test Case 1: PASSED\n✅ Test Case 2: PASSED\n❌ Test Case 3: FAILED\n\nExpected: [0,1]\nActual: [1,0]\n\nRuntime: 152ms\nMemory: 14.2MB");
    setTestResults([
      { ...challengeData.testCases[0], passed: true },
      { ...challengeData.testCases[1], passed: true },
      { ...challengeData.testCases[2], passed: false }
    ]);
  };

  const handleResetCode = () => {
    setCode(`def solution(nums, target):
    # Write your solution here
    pass`);
    setOutput("");
    setTestResults([]);
    setShowSubmitResult(false);
  };

  const handleSubmit = () => {
    setOutput("🎯 Submitting solution...\n\n✅ All test cases passed!\n\n🏆 Verdict: ACCEPTED\n⭐ Score: 85/100\n⏱️ Runtime: 150ms (Beats 78% of submissions)\n💾 Memory: 14.2MB (Beats 82% of submissions)\n\n+100 XP earned!");
    setShowSubmitResult(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const languages = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "javascript", label: "JavaScript" }
  ];

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Problem Panel - Left Side */}
        <div className="w-1/2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{challengeData.title}</CardTitle>
                  <Badge className={getDifficultyColor(challengeData.difficulty)}>
                    {challengeData.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{challengeData.acceptance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{challengeData.timeLimit}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="description" className="h-full flex flex-col">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                  <TabsTrigger value="editorial" className="flex-1">Editorial</TabsTrigger>
                  <TabsTrigger value="testcases" className="flex-1">Test Cases</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="description" className="space-y-6 mt-0">
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Problem Description</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {challengeData.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Input Format</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm text-gray-800 whitespace-pre-wrap">
                          {challengeData.inputFormat}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Output Format</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm text-gray-800 whitespace-pre-wrap">
                          {challengeData.outputFormat}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Examples</h3>
                      {challengeData.examples.map((example, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium mb-2 text-gray-900">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <strong className="text-gray-700">Input:</strong>
                              <code className="text-gray-800">{example.input}</code>
                            </div>
                            <div className="flex gap-2">
                              <strong className="text-gray-700">Output:</strong>
                              <code className="text-gray-800">{example.output}</code>
                            </div>
                            <div className="flex gap-2">
                              <strong className="text-gray-700">Explanation:</strong>
                              <span className="text-gray-700">{example.explanation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Constraints</h3>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                        {challengeData.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="editorial" className="mt-0">
                    <div className="text-center py-12 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Editorial will be available after you solve this problem</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="testcases" className="mt-0">
                    <div className="space-y-3">
                      {testResults.length > 0 ? testResults.map((test, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          test.passed === true ? 'bg-green-50 border-green-200' :
                          test.passed === false ? 'bg-red-50 border-red-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Test Case {index + 1}</span>
                            <div className="flex items-center gap-2">
                              {test.passed === true ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : test.passed === false ? (
                                <X className="w-4 h-4 text-red-600" />
                              ) : null}
                              <Badge variant={
                                test.passed === true ? "secondary" :
                                test.passed === false ? "destructive" :
                                "outline"
                              }>
                                {test.passed === true ? "PASSED" :
                                 test.passed === false ? "FAILED" :
                                 "PENDING"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Input:</strong> {test.input}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Expected:</strong> {test.expectedOutput}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 text-gray-500">
                          <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Run your code to see test results</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor Panel - Right Side */}
        <div className="w-1/2 flex flex-col space-y-4">
          {/* Code Editor */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Code Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={handleResetCode}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 bg-gray-900 text-green-400 font-mono text-sm">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-green-400 font-mono text-sm border-0 resize-none focus:outline-none"
                  placeholder="Write your code here..."
                />
              </div>
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button size="sm" variant="outline" onClick={handleRunCode}>
                  <Play className="w-4 h-4 mr-1" />
                  Run Code
                </Button>
                <Button size="sm" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Console Output */}
          <Card className="h-64">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Console</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="output" className="h-full">
                <TabsList className="mx-4 mb-4">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="input">Input</TabsTrigger>
                  <TabsTrigger value="expected">Expected</TabsTrigger>
                </TabsList>
                
                <div className="px-4 pb-4">
                  <TabsContent value="output" className="mt-0">
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-32 overflow-y-auto">
                      {output || "Click 'Run Code' to execute your solution..."}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="input" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded font-mono text-sm h-32 overflow-y-auto">
                      nums = [2,7,11,15]<br />
                      target = 9
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="expected" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded font-mono text-sm h-32 overflow-y-auto">
                      [0,1]
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Submit Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 rounded-full p-4 shadow-lg"
          size="lg"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Success Toast Simulation */}
      {showSubmitResult && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Solution accepted! +100 XP earned</span>
        </div>
      )}
    </StudentLayout>
  );
};

export default CodeChallenge;
