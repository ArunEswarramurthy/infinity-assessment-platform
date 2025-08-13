import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import StudentLayout from "@/components/StudentLayout";

const PracticeTest = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [practiceData, setPracticeData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [isPaused, setIsPaused] = useState(false);
  const [isTestEnded, setIsTestEnded] = useState(false);

  // Fetch practice data
  useEffect(() => {
    const fetchPracticeData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/practice/topic/${topicId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPracticeData(data);
        // Set timer based on number of questions (2 minutes per question)
        const timeInSeconds = (data.questions?.length || 10) * 120;
        setTimeLeft(timeInSeconds);
      } catch (error) {
        console.error("Error fetching practice data:", error);
        toast({
          title: "Error",
          description: "Failed to load practice questions",
          variant: "destructive",
        });
      }
    };
    fetchPracticeData();
  }, [topicId]);

  // Timer logic
  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !isTestEnded) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isTestEnded) {
      endTest("Time's up! Practice session completed.");
    }
  }, [timeLeft, isPaused, isTestEnded]);

  const endTest = (reason: string) => {
    setIsTestEnded(true);

    // Calculate results
    const results = allQuestions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctOptionLetter;
      return {
        ...question,
        userAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const correctAnswers = results.filter(r => r.isCorrect).length;
    const practiceResult = {
      topicId,
      topicName: practiceData.name,
      totalQuestions: allQuestions.length,
      correctAnswers,
      score: Math.round((correctAnswers / allQuestions.length) * 100),
      questions: results
    };

    // Save result to localStorage
    localStorage.setItem(`practice_result_${topicId}`, JSON.stringify(practiceResult));

    toast({
      title: "Practice Completed",
      description: `You scored ${correctAnswers}/${allQuestions.length}`,
    });

    // Navigate to results page
    navigate(`/student/practice/${topicId}/result`);
  };

  const handleManualSubmit = () => {
    if (window.confirm("Are you sure you want to submit the practice session?")) {
      endTest("Practice session submitted successfully.");
    }
  };

  if (!practiceData) {
    return (
      <StudentLayout>
        <div className="p-6">Loading practice questions...</div>
      </StudentLayout>
    );
  }

  const allQuestions = practiceData.questions || [];

  if (allQuestions.length === 0) {
    return (
      <StudentLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-4">This practice topic does not contain any questions yet.</p>
          <Button onClick={() => navigate('/student/practice')}>Back to Practice</Button>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleMark = () => {
    const newSet = new Set(markedForReview);
    if (newSet.has(currentQuestion.id)) {
      newSet.delete(currentQuestion.id);
    } else {
      newSet.add(currentQuestion.id);
    }
    setMarkedForReview(newSet);
    handleNext();
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleClear = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
  };

  const getStatusColor = (qid: number) => {
    if (answers[qid]) return "bg-green-500 text-white";
    if (markedForReview.has(qid)) return "bg-purple-500 text-white";
    if (qid === currentQuestion.id) return "bg-orange-500 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <StudentLayout>
      <div className="flex h-screen">
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/practice')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">{practiceData.name} - Practice</h1>
            </div>
            <div className="flex items-center gap-4 text-orange-600">
              <Clock className="w-4 h-4" />
              <span>Time Left: {formatTime(timeLeft)}</span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleManualSubmit}
                disabled={isTestEnded}
              >
                Submit Practice
              </Button>
            </div>
          </div>

          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Q{currentQuestionIndex + 1}: {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleAnswer}
                  disabled={isTestEnded}
                >
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="flex items-center space-x-3 p-3 border rounded mb-2">
                      <RadioGroupItem value={opt} id={`opt-${opt}`} />
                      <Label htmlFor={`opt-${opt}`}>
                        {opt}) {currentQuestion[`option${opt}`]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-6 pt-4 border-t">
                  <div className="space-x-2">
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0 || isTestEnded}>
                      Previous
                    </Button>
                    <Button variant="outline" onClick={handleMark} disabled={isTestEnded}>
                      {markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"} & Next
                    </Button>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={handleClear} disabled={isTestEnded}>
                      Clear
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={currentQuestionIndex === allQuestions.length - 1 || isTestEnded}
                    >
                      Save & Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l p-4 bg-white">
          <h3 className="text-md font-semibold mb-2">Question Palette</h3>
          <div className="grid grid-cols-4 gap-2">
            {allQuestions.map((q: any, idx: number) => (
              <button
                key={q.id}
                className={`w-8 h-8 rounded ${getStatusColor(q.id)}`}
                onClick={() => setCurrentQuestionIndex(idx)}
                disabled={isTestEnded}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-purple-500 mr-2"></div>
              <span>Marked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-gray-200 mr-2"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default PracticeTest;