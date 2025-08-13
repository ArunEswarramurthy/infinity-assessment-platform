import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, Save, Eye } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  questionImage?: string;
  optionA: string;
  optionAImage?: string;
  optionB: string;
  optionBImage?: string;
  optionC: string;
  optionCImage?: string;
  optionD: string;
  optionDImage?: string;
  correctAnswer: string;
  explanation: string;
}

const QuestionTemplate = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    explanation: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageUpload = (field: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentQuestion(prev => ({
        ...prev,
        [field]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (!currentQuestion.correctAnswer) {
      toast({
        title: "Error",
        description: "Please select the correct answer",
        variant: "destructive",
      });
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: editingId || Date.now().toString()
    };

    if (editingId) {
      setQuestions(prev => prev.map(q => q.id === editingId ? newQuestion : q));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } else {
      setQuestions(prev => [...prev, newQuestion]);
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    }

    // Reset form
    setCurrentQuestion({
      id: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: ''
    });
  };

  const editQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditingId(question.id);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Success",
      description: "Question deleted successfully",
    });
  };

  const exportQuestions = () => {
    const csvContent = [
      'Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation',
      ...questions.map(q => 
        `"${q.questionText}","${q.optionA}","${q.optionB}","${q.optionC}","${q.optionD}","${q.correctAnswer}","${q.explanation}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Questions_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Questions exported as CSV file",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Question Template Builder</h1>
              <p className="text-purple-100">Create and manage MCQ questions with images</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              {questions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportQuestions}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question */}
                <div>
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question here..."
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion(prev => ({...prev, questionText: e.target.value}))}
                    className="mt-1"
                    rows={3}
                  />
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload('questionImage', e.target.files[0])}
                      className="hidden"
                      id="question-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('question-image')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                    {currentQuestion.questionImage && (
                      <img src={currentQuestion.questionImage} alt="Question" className="mt-2 max-w-32 h-auto rounded" />
                    )}
                  </div>
                </div>

                {/* Options */}
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option}>
                    <Label htmlFor={`option${option}`}>Option {option} *</Label>
                    <Input
                      id={`option${option}`}
                      placeholder={`Enter option ${option}...`}
                      value={currentQuestion[`option${option}` as keyof Question] as string}
                      onChange={(e) => setCurrentQuestion(prev => ({...prev, [`option${option}`]: e.target.value}))}
                      className="mt-1"
                    />
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(`option${option}Image`, e.target.files[0])}
                        className="hidden"
                        id={`option${option}-image`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`option${option}-image`)?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Image
                      </Button>
                      {currentQuestion[`option${option}Image` as keyof Question] && (
                        <img 
                          src={currentQuestion[`option${option}Image` as keyof Question] as string} 
                          alt={`Option ${option}`} 
                          className="mt-2 max-w-24 h-auto rounded" 
                        />
                      )}
                    </div>
                  </div>
                ))}

                {/* Correct Answer */}
                <div>
                  <Label htmlFor="answer">Correct Answer *</Label>
                  <Select
                    value={currentQuestion.correctAnswer}
                    onValueChange={(value) => setCurrentQuestion(prev => ({...prev, correctAnswer: value}))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      <SelectItem value="C">Option C</SelectItem>
                      <SelectItem value="D">Option D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Explanation */}
                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Provide explanation for the correct answer..."
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion(prev => ({...prev, explanation: e.target.value}))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button onClick={addQuestion} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update Question' : 'Add Question'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No questions added yet</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm">
                            {index + 1}. {question.questionText.substring(0, 50)}...
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editQuestion(question)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Correct Answer: {question.correctAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">
                        {index + 1}. {question.questionText}
                      </h3>
                      {question.questionImage && (
                        <img src={question.questionImage} alt="Question" className="max-w-64 h-auto rounded mb-2" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="font-medium">{option})</span>
                          <span>{question[`option${option}` as keyof Question] as string}</span>
                          {question[`option${option}Image` as keyof Question] && (
                            <img 
                              src={question[`option${option}Image` as keyof Question] as string} 
                              alt={`Option ${option}`} 
                              className="max-w-16 h-auto rounded ml-2" 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-start gap-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Correct: {question.correctAnswer}
                      </span>
                      {question.explanation && (
                        <span className="text-gray-600">
                          <strong>Explanation:</strong> {question.explanation}
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

export default QuestionTemplate;