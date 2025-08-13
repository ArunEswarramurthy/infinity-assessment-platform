import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Send, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/api';

interface CodingSectionProps {
  questions: any[];
  codeAnswers: Record<number, { code: string; language: string }>;
  onCodeAnswerChange: (answers: Record<number, { code: string; language: string }>) => void;
}

const CodingSection: React.FC<CodingSectionProps> = ({ questions, codeAnswers, onCodeAnswerChange }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<Record<number, string>>({});
  const [dryRunResults, setDryRunResults] = useState<Record<number, any>>({});
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});
  const [customResults, setCustomResults] = useState<Record<number, any>>({});
  const [compilerStatus, setCompilerStatus] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isCustomRunning, setIsCustomRunning] = useState(false);

  // Check compiler availability on component mount
  useEffect(() => {
    checkCompilerAvailability();
  }, []);

  const checkCompilerAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/check-compilers`);
      const result = await response.json();
      if (result.success) {
        setCompilerStatus(result.compilers);
      }
    } catch (error) {
      console.error('Failed to check compilers:', error);
    }
  };

  const handleCodeChange = (questionId: number, code: string) => {
    const language = selectedLanguages[questionId] || questions.find(q => q.id === questionId)?.allowedLanguages[0];
    onCodeAnswerChange({ ...codeAnswers, [questionId]: { code, language } });
  };

  const handleLanguageChange = (questionId: number, language: string) => {
    setSelectedLanguages({ ...selectedLanguages, [questionId]: language });
    const currentCode = codeAnswers[questionId]?.code || '';
    onCodeAnswerChange({ ...codeAnswers, [questionId]: { code: currentCode, language } });
  };

  const handleDryRun = async (questionId: number) => {
    const code = codeAnswers[questionId]?.code;
    const language = selectedLanguages[questionId] || questions.find(q => q.id === questionId)?.allowedLanguages[0];
    
    if (!code || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }
    
    // Check if compiler is available
    if (compilerStatus[language] && !compilerStatus[language].available) {
      toast({
        title: "Compiler Error",
        description: compilerStatus[language].error,
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/dry-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, code, language })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDryRunResults({ ...dryRunResults, [questionId]: result });
        toast({
          title: "Dry Run Complete",
          description: `Passed ${result.summary.passed}/${result.summary.total} test cases`,
        });
      } else {
        setDryRunResults({ ...dryRunResults, [questionId]: { error: result.error, success: false } });
        toast({
          title: "Dry Run Failed",
          description: result.error || "Failed to execute code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Dry run error:', error);
      toast({
        title: "Error",
        description: "Failed to run code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCustomRun = async (questionId: number) => {
    const code = codeAnswers[questionId]?.code;
    const language = selectedLanguages[questionId] || questions.find(q => q.id === questionId)?.allowedLanguages[0];
    const customInput = customInputs[questionId] || '';
    
    if (!code || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }
    
    // Check if compiler is available
    if (compilerStatus[language] && !compilerStatus[language].available) {
      toast({
        title: "Compiler Error",
        description: compilerStatus[language].error,
        variant: "destructive",
      });
      return;
    }
    
    setIsCustomRunning(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/execute-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, customInput })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomResults({ ...customResults, [questionId]: result.result });
        toast({
          title: "Execution Complete",
          description: result.result.success ? "Code executed successfully" : "Execution failed",
          variant: result.result.success ? "default" : "destructive",
        });
      } else {
        setCustomResults({ ...customResults, [questionId]: { error: result.error, success: false } });
        toast({
          title: "Execution Failed",
          description: result.error || "Failed to execute code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Custom execution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCustomRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <Card key={question.id} className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                Coding Question {index + 1}
              </span>
              <span className="text-gray-600">({question.marks} marks)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Problem Statement */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Problem Statement:</h4>
              <div className="whitespace-pre-wrap text-gray-700">{question.problemStatement}</div>
              
              {question.constraints && (
                <div className="mt-4">
                  <h5 className="font-medium mb-1">Constraints:</h5>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{question.constraints}</div>
                </div>
              )}
              
              {question.sampleTestCases && question.sampleTestCases.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Sample Test Cases:</h5>
                  <div className="space-y-2">
                    {question.sampleTestCases.map((testCase: any, tcIndex: number) => (
                      <div key={tcIndex} className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Input:</strong>
                            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs font-mono">{testCase.input}</pre>
                          </div>
                          <div>
                            <strong>Output:</strong>
                            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs font-mono">{testCase.output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selection and Actions */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Programming Language:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    value={selectedLanguages[question.id] || question.allowedLanguages[0]}
                    onValueChange={(value) => handleLanguageChange(question.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {question.allowedLanguages.map((lang: string) => {
                        const status = compilerStatus[lang];
                        return (
                          <SelectItem key={lang} value={lang} disabled={status && !status.available}>
                            <div className="flex items-center gap-2">
                              {status?.available ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              {lang}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {compilerStatus[selectedLanguages[question.id] || question.allowedLanguages[0]] && 
                   !compilerStatus[selectedLanguages[question.id] || question.allowedLanguages[0]].available && (
                    <div className="text-sm text-red-500">
                      Compiler not available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDryRun(question.id)}
                  disabled={isRunning}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? 'Running...' : 'Test Cases'}
                </Button>
              </div>
            </div>

            {/* Code Editor and Testing */}
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">Code Editor</TabsTrigger>
                <TabsTrigger value="test">Test Cases</TabsTrigger>
                <TabsTrigger value="custom">Custom Input</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="space-y-4">
                <div>
                  <Label>Your Solution:</Label>
                  <Textarea
                    placeholder={`Write your ${selectedLanguages[question.id] || question.allowedLanguages[0]} code here...`}
                    value={codeAnswers[question.id]?.code || ''}
                    onChange={(e) => handleCodeChange(question.id, e.target.value)}
                    className="mt-2 font-mono text-sm"
                    rows={15}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4">
                {/* Test Case Results */}
                {dryRunResults[question.id] && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium mb-2 text-blue-800">Test Case Results:</h5>
                    <div className="text-sm">
                      {dryRunResults[question.id].success ? (
                        <>
                          <p className="mb-2">Passed: {dryRunResults[question.id].summary.passed}/{dryRunResults[question.id].summary.total} test cases</p>
                          <div className="space-y-2">
                            {dryRunResults[question.id].results.map((result: any, index: number) => (
                              <div key={index} className={`p-2 rounded ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className="font-medium">{result.passed ? '✅' : '❌'} Test Case {index + 1}</div>
                                {!result.passed && (
                                  <div className="text-xs mt-1">
                                    <div><strong>Input:</strong> {result.input}</div>
                                    <div><strong>Expected:</strong> {result.expectedOutput}</div>
                                    <div><strong>Got:</strong> {result.actualOutput}</div>
                                    {result.error && <div className="text-red-600"><strong>Error:</strong> {result.error}</div>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-red-100 rounded border border-red-200">
                          <div className="font-medium text-red-800 mb-2">❌ Execution Failed</div>
                          <div className="text-sm text-red-700 whitespace-pre-wrap">{dryRunResults[question.id].error}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!dryRunResults[question.id] && (
                  <div className="text-center py-8 text-gray-500">
                    Click "Test Cases" button to run your code against sample test cases
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Custom Input:</Label>
                    <Textarea
                      placeholder="Enter your custom input here..."
                      value={customInputs[question.id] || ''}
                      onChange={(e) => setCustomInputs({ ...customInputs, [question.id]: e.target.value })}
                      className="mt-2 font-mono text-sm"
                      rows={8}
                    />
                    <Button
                      onClick={() => handleCustomRun(question.id)}
                      disabled={isCustomRunning}
                      className="mt-2 gap-2"
                      size="sm"
                    >
                      <Play className="w-4 h-4" />
                      {isCustomRunning ? 'Running...' : 'Run with Custom Input'}
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Output:</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded border min-h-[200px]">
                      {customResults[question.id] ? (
                        <div className="space-y-2">
                          {customResults[question.id].success ? (
                            <div>
                              <div className="text-sm text-green-600 font-medium mb-2">✅ Execution Successful</div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-white p-2 rounded border">
                                {customResults[question.id].output || '(No output)'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Execution time: {customResults[question.id].executionTime}ms
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm text-red-600 font-medium mb-2">❌ Execution Failed</div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-red-50 p-2 rounded border border-red-200 text-red-700">
                                {customResults[question.id].error}
                              </div>
                              {customResults[question.id].compilerError && (
                                <div className="text-xs text-red-600 mt-1">Compiler Error</div>
                              )}
                              {customResults[question.id].runtimeError && (
                                <div className="text-xs text-red-600 mt-1">Runtime Error</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">Output will appear here after running your code</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CodingSection;