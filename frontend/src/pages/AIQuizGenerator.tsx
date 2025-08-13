import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Sparkles, FileText, Loader2, Database, ArrowLeft } from "lucide-react";
// import XLSX from 'xlsx';

interface Question {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string;
}

const AIQuizGenerator = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const generateQuiz = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or prompt for quiz generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          numQuestions
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedQuestions(result.questions);
        toast({
          title: "Success! 🎉",
          description: `Generated ${result.questions.length} questions successfully`,
        });
      } else {
        throw new Error(result.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQuiz = () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to download",
        variant: "destructive",
      });
      return;
    }

    // Simple CSV download for now
    const csvContent = [
      'Question,Option A,Option B,Option C,Option D,Correct Option,Explanation',
      ...generatedQuestions.map(q => 
        `"${q.questionText}","${q.optionA}","${q.optionB}","${q.optionC}","${q.optionD}","${q.correctOption}","${q.explanation || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Quiz_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded! 📥",
      description: "Quiz has been downloaded as CSV file",
    });
  };

  const useAsSample = async () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to save",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/ai/save-as-sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: generatedQuestions,
          topic: prompt
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success! 💾",
          description: "Questions saved to sample database",
        });
      } else {
        throw new Error(result.message || 'Failed to save questions');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
                <p className="text-purple-100">Generate MCQ questions using AI</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.close()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quiz Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Topic/Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Enter a specific topic for quiz generation. Examples:
• Percentage calculations and applications
• JavaScript ES6 features and syntax
• Database normalization concepts
• Machine learning algorithms

Be specific for better quality questions!"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Input
                id="numQuestions"
                type="number"
                min="1"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={generateQuiz}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Quiz"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Questions ({generatedQuestions.length})</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={useAsSample} variant="outline" className="gap-2">
                    <Database className="w-4 h-4" />
                    Use as Sample
                  </Button>
                  <Button onClick={downloadQuiz} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Quiz
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-medium mb-3">
                      {index + 1}. {question.questionText}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">A)</span>
                        <span>{question.optionA}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">B)</span>
                        <span>{question.optionB}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">C)</span>
                        <span>{question.optionC}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">D)</span>
                        <span>{question.optionD}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Correct: {question.correctOption}
                      </span>
                      {question.explanation && (
                        <span className="text-gray-600">
                          Explanation: {question.explanation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIQuizGenerator;