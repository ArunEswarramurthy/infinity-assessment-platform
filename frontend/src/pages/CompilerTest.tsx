import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/api';

const CompilerTest = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [customInput, setCustomInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [compilerStatus, setCompilerStatus] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  const sampleCodes = {
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        if (scanner.hasNextLine()) {
            String input = scanner.nextLine();
            System.out.println("You entered: " + input);
        }
    }
}`,
    python3: `print("Hello, World!")
import sys
if not sys.stdin.isatty():
    user_input = input()
    print(f"You entered: {user_input}")`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    string input;
    if (getline(cin, input)) {
        cout << "You entered: " << input << endl;
    }
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>

int main() {
    printf("Hello, World!\\n");
    char input[100];
    if (fgets(input, sizeof(input), stdin)) {
        input[strcspn(input, "\\n")] = 0; // Remove newline
        printf("You entered: %s\\n", input);
    }
    return 0;
}`
  };

  useEffect(() => {
    checkCompilerAvailability();
    setCode(sampleCodes[language as keyof typeof sampleCodes]);
  }, []);

  useEffect(() => {
    setCode(sampleCodes[language as keyof typeof sampleCodes]);
  }, [language]);

  const checkCompilerAvailability = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/check-compilers`);
      const result = await response.json();
      if (result.success) {
        setCompilerStatus(result.compilers);
      }
    } catch (error) {
      console.error('Failed to check compilers:', error);
      toast({
        title: "Error",
        description: "Failed to check compiler availability",
        variant: "destructive",
      });
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }

    if (compilerStatus[language] && !compilerStatus[language].available) {
      toast({
        title: "Compiler Error",
        description: compilerStatus[language].error,
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/execute-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, customInput })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        toast({
          title: "Execution Complete",
          description: data.result.success ? "Code executed successfully" : "Execution failed",
          variant: data.result.success ? "default" : "destructive",
        });
      } else {
        setResult({ error: data.error, success: false });
        toast({
          title: "Execution Failed",
          description: data.error || "Failed to execute code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Execution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Compiler Test Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compiler Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(compilerStatus).map(([lang, status]) => (
              <div key={lang} className={`p-3 rounded-lg border ${status.available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {status.available ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium capitalize">{lang}</span>
                </div>
                <div className={`text-xs mt-1 ${status.available ? 'text-green-600' : 'text-red-600'}`}>
                  {status.available ? 'Available' : 'Not Available'}
                </div>
              </div>
            ))}
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Programming Language:</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(sampleCodes).map((lang) => {
                    const status = compilerStatus[lang];
                    return (
                      <SelectItem key={lang} value={lang} disabled={status && !status.available}>
                        <div className="flex items-center gap-2">
                          {status?.available ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          {lang.toUpperCase()}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleRun}
              disabled={isRunning || (compilerStatus[language] && !compilerStatus[language].available)}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
          </div>

          {/* Code Editor and Results */}
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="input">Custom Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="space-y-4">
              <div>
                <Label>Code:</Label>
                <Textarea
                  placeholder={`Write your ${language} code here...`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-2 font-mono text-sm"
                  rows={20}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="input" className="space-y-4">
              <div>
                <Label>Custom Input (optional):</Label>
                <Textarea
                  placeholder="Enter input for your program here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="mt-2 font-mono text-sm"
                  rows={10}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="space-y-4">
              <div>
                <Label>Output:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded border min-h-[300px]">
                  {result ? (
                    <div className="space-y-3">
                      {result.success ? (
                        <div>
                          <div className="text-sm text-green-600 font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Execution Successful
                          </div>
                          <div className="font-mono text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                            {result.output || '(No output)'}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Execution time: {result.executionTime}ms
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-red-600 font-medium mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Execution Failed
                          </div>
                          <div className="font-mono text-sm whitespace-pre-wrap bg-red-50 p-3 rounded border border-red-200 text-red-700">
                            {result.error}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs">
                            {result.compilerError && (
                              <span className="text-red-600 bg-red-100 px-2 py-1 rounded">Compiler Error</span>
                            )}
                            {result.runtimeError && (
                              <span className="text-red-600 bg-red-100 px-2 py-1 rounded">Runtime Error</span>
                            )}
                            {result.syntaxError && (
                              <span className="text-red-600 bg-red-100 px-2 py-1 rounded">Syntax Error</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Output will appear here after running your code</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompilerTest;