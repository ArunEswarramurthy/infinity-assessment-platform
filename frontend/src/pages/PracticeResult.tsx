import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Home } from "lucide-react";

interface PracticeResult {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  questions: QuestionResult[];
}

interface QuestionResult {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  userAnswer?: string;
  isCorrect: boolean;
  explanation?: string;
}

const PracticeResult = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get result from localStorage
    const savedResult = localStorage.getItem(`practice_result_${topicId}`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
    setLoading(false);
  }, [topicId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-6 text-center">Loading results...</div>
      </StudentLayout>
    );
  }

  if (!result) {
    return (
      <StudentLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">No Results Found</h2>
          <Button onClick={() => navigate('/student/practice')}>Back to Practice</Button>
        </div>
      </StudentLayout>
    );
  }

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Practice Test Results</CardTitle>
            <p className="text-gray-600">{result.topicName}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{result.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</div>
                <div className="text-sm text-gray-600">Wrong Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Question Review</h3>
          {result.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    Q{index + 1}: {question.questionText}
                  </CardTitle>
                  <Badge variant={question.isCorrect ? "default" : "destructive"}>
                    {question.isCorrect ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {question.isCorrect ? "Correct" : "Wrong"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((option) => {
                      const optionText = question[`option${option}` as keyof QuestionResult] as string;
                      const isCorrect = question.correctOption === option;
                      const isUserAnswer = question.userAnswer === option;
                      
                      let className = "p-2 border rounded";
                      if (isCorrect) className += " bg-green-100 border-green-500";
                      else if (isUserAnswer && !isCorrect) className += " bg-red-100 border-red-500";
                      
                      return (
                        <div key={option} className={className}>
                          {option}) {optionText}
                          {isCorrect && <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>}
                          {isUserAnswer && !isCorrect && <span className="ml-2 text-red-600 font-semibold">✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <strong>Explanation:</strong> {question.explanation || `The correct answer is ${question.correctOption}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="text-center">
          <Button onClick={() => navigate('/student/practice')} className="mr-4">
            <Home className="w-4 h-4 mr-2" />
            Back to Practice
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default PracticeResult;