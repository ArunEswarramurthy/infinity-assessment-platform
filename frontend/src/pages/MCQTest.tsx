// // import { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import StudentLayout from "@/components/StudentLayout";
// // import { Button } from "@/components/ui/button";
// // import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// // import { Label } from "@/components/ui/label";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Clock } from "lucide-react";

// // const MCQTest = () => {
// //   const { testId } = useParams();
// //   const [testData, setTestData] = useState<any>(null);
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [answers, setAnswers] = useState<Record<number, string>>({});
// //   const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
// //   const [timeLeft, setTimeLeft] = useState(1800); // default 30 mins
// //   const [isPaused, setIsPaused] = useState(false);

// //   // Fetch test data
// //   useEffect(() => {
// //     const fetchTest = async () => {
// //       const res = await fetch(`http://localhost:5000/api/test/${testId}`);
// //       const json = await res.json();
// //       setTestData(json);
// //       const totalSeconds = json.Sections.reduce((acc: number, sec: any) => acc + sec.duration * 60, 0);
// //       setTimeLeft(totalSeconds);
// //     };
// //     fetchTest();
// //   }, [testId]);

// //   // Timer logic
// //   useEffect(() => {
// //     if (!isPaused && timeLeft > 0) {
// //       const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
// //       return () => clearInterval(timer);
// //     }
// //   }, [timeLeft, isPaused]);

// //   if (!testData) return <StudentLayout><div className="p-6">Loading...</div></StudentLayout>;

// //   const allQuestions = testData.Sections.flatMap((section: any) =>
// //     section.MCQs.map((q: any, index: number) => ({
// //       ...q,
// //       sectionName: section.name,
// //       questionNo: index + 1
// //     }))
// //   );

// //   const currentQuestion = allQuestions[currentQuestionIndex];

// //   const formatTime = (s: number) =>
// //     `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// //   const handleAnswer = (value: string) => {
// //     setAnswers({ ...answers, [currentQuestion.id]: value });
// //   };

// //   const handleMark = () => {
// //     const newSet = new Set(markedForReview);
// //     if (newSet.has(currentQuestion.id)) {
// //       newSet.delete(currentQuestion.id);
// //     } else {
// //       newSet.add(currentQuestion.id);
// //     }
// //     setMarkedForReview(newSet);
// //   };

// //   const handleNext = () => {
// //     if (currentQuestionIndex < allQuestions.length - 1) {
// //       setCurrentQuestionIndex((i) => i + 1);
// //     }
// //   };

// //   const handleClear = () => {
// //     const newAnswers = { ...answers };
// //     delete newAnswers[currentQuestion.id];
// //     setAnswers(newAnswers);
// //   };

// //   const getStatusColor = (qid: number) => {
// //     if (answers[qid]) return "bg-green-500 text-white";
// //     if (markedForReview.has(qid)) return "bg-purple-500 text-white";
// //     if (qid === currentQuestion.id) return "bg-orange-500 text-white";
// //     return "bg-gray-200 text-gray-700";
// //   };

// //   return (
// //     <StudentLayout>
// //       <div className="flex h-screen">
// //         {/* Main Area */}
// //         <div className="flex-1 flex flex-col">
// //           <div className="bg-white border-b p-4 flex justify-between items-center">
// //             <h1 className="text-lg font-semibold">{testData.name}</h1>
// //             <div className="flex items-center gap-4 text-orange-600">
// //               <Clock className="w-4 h-4" />
// //               <span>Time Left: {formatTime(timeLeft)}</span>
// //               <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
// //                 {isPaused ? "Resume" : "Pause"}
// //               </Button>
// //             </div>
// //           </div>

// //           <div className="p-4">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>
// //                   Q{currentQuestion.questionNo}: {currentQuestion.questionText}
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <RadioGroup
// //                   value={answers[currentQuestion.id] || ""}
// //                   onValueChange={handleAnswer}
// //                 >
// //                   {["A", "B", "C", "D"].map((opt) => (
// //                     <div key={opt} className="flex items-center space-x-3 p-3 border rounded mb-2">
// //                       <RadioGroupItem value={opt} id={`opt-${opt}`} />
// //                       <Label htmlFor={`opt-${opt}`}>
// //                         {opt}) {currentQuestion[`option${opt}`]}
// //                       </Label>
// //                     </div>
// //                   ))}
// //                 </RadioGroup>

// //                 <div className="flex justify-between mt-6 pt-4 border-t">
// //                   <Button variant="outline" onClick={handleMark}>
// //                     {markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"} & Next
// //                   </Button>
// //                   <Button variant="outline" onClick={handleClear}>Clear</Button>
// //                   <Button onClick={handleNext} disabled={currentQuestionIndex === allQuestions.length - 1}>
// //                     Save & Next
// //                   </Button>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </div>

// //         {/* Sidebar */}
// //         <div className="w-80 border-l p-4 bg-white">
// //           <h3 className="text-md font-semibold mb-2">Question Palette</h3>
// //           <div className="grid grid-cols-4 gap-2">
// //             {allQuestions.map((q: any, idx: number) => (
// //               <button
// //                 key={q.id}
// //                 className={`w-8 h-8 rounded ${getStatusColor(q.id)}`}
// //                 onClick={() => setCurrentQuestionIndex(idx)}
// //               >
// //                 {q.questionNo}
// //               </button>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </StudentLayout>
// //   );
// // };

// // export default MCQTest;


// import { useEffect, useState } from "react";
// import StudentLayout from "@/components/StudentLayout";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";

// const MCQTest = () => {
//   const { testId } = useParams();
//   const navigate = useNavigate();
//   const [testData, setTestData] = useState<any>(null);
//   const [isTestEnded, setIsTestEnded] = useState(false);

//   // Fetch test data
//   useEffect(() => {
//     const fetchTest = async () => {
//       const res = await fetch(`http://localhost:5000/api/test/${testId}`);
//       const data = await res.json();
//       setTestData(data);
//     };
//     fetchTest();
//   }, [testId]);

//   // Fullscreen + event listeners on mount
//   useEffect(() => {
//     const enterFullscreen = async () => {
//       const elem = document.documentElement;
//       if (elem.requestFullscreen) {
//         await elem.requestFullscreen();
//       }
//     };

//     const handleVisibilityChange = () => {
//       if (document.hidden && !isTestEnded) {
//         endTest("You left the tab. Test ended.");
//       }
//     };

//     const handleFullscreenChange = () => {
//       if (!document.fullscreenElement && !isTestEnded) {
//         endTest("You exited fullscreen. Test ended.");
//       }
//     };

//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       e.preventDefault();
//       e.returnValue = "";
//     };

//     enterFullscreen();

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isTestEnded]);

//   const endTest = (reason: string) => {
//     setIsTestEnded(true);
//     if (document.fullscreenElement) {
//       document.exitFullscreen();
//     }

//     toast({
//       title: "Test Ended",
//       description: reason,
//       variant: "destructive",
//     });

//     // Navigate to result/summary or home
//     navigate("/student");
//   };

//   const handleManualSubmit = () => {
//     endTest("You submitted the test.");
//   };

//   if (!testData) return <p className="p-10 text-center">Loading test...</p>;

//   return (
//     <StudentLayout>
//       <div className="p-6 space-y-4">
//         <h1 className="text-xl font-bold">{testData.name}</h1>
//         <p className="text-gray-600">{testData.description}</p>

//         <div className="mt-4 border p-4 rounded-lg bg-gray-50">
//           {/* Dummy question view */}
//           {testData.Sections.map((section: any, i: number) => (
//             <div key={i} className="mb-6">
//               <h2 className="font-semibold">{section.name}</h2>
//               {section.MCQs.map((q: any) => (
//                 <div key={q.id} className="my-4">
//                   <p className="font-medium">{q.questionText}</p>
//                   <ul className="ml-4 list-disc text-sm">
//                     <li>A. {q.optionA}</li>
//                     <li>B. {q.optionB}</li>
//                     <li>C. {q.optionC}</li>
//                     <li>D. {q.optionD}</li>
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>

//         <Button
//           onClick={handleManualSubmit}
//           className="bg-green-600 hover:bg-green-700"
//         >
//           Submit Test
//         </Button>
//       </div>
//     </StudentLayout>
//   );
// };

// export default MCQTest;


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, Play, Send, Code } from "lucide-react";
import TestLayout from "@/components/TestLayout";
import { API_BASE_URL } from "@/config/api";

const MCQTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<number, { code: string; language: string }>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<Record<number, string>>({});
  const [dryRunResults, setDryRunResults] = useState<Record<number, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<Record<number, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800); // default 30 mins
  const [isPaused, setIsPaused] = useState(false);
  const [isTestEnded, setIsTestEnded] = useState(false);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [supervisorPasscode, setSupervisorPasscode] = useState("");
  const [isValidatingPasscode, setIsValidatingPasscode] = useState(false);
  const [totalTestDuration, setTotalTestDuration] = useState(1800);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:5000/api/test/${testId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch test data');
        }
        const json = await res.json();
        console.log('Fetched test data:', json);
        setTestData(json);
        const totalSeconds = json.Sections?.reduce((acc: number, sec: any) => acc + (sec.duration || 0) * 60, 0) || 1800;
        setTimeLeft(totalSeconds);
        setTotalTestDuration(totalSeconds);
      } catch (error) {
        console.error('Error fetching test:', error);
        setError('Failed to load test. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load test. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  // Timer logic
  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !isTestEnded) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isTestEnded) {
      handleTimeUp();
    }
  }, [timeLeft, isPaused, isTestEnded]);

  // Fullscreen + event listeners on mount
  useEffect(() => {
    if (isTestEnded) return;

    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isTestEnded) {
        endTest("You left the tab. Test ended.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isTestEnded) {
        endTest("You exited fullscreen. Test ended.");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isTestEnded) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your test will be submitted.";
      }
    };

    enterFullscreen();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTestEnded]);

  const endTest = (reason: string) => {
    setIsTestEnded(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
    }

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
    const testResult = {
      testId,
      testName: testData.name,
      totalQuestions: allQuestions.length,
      correctAnswers,
      score: Math.round((correctAnswers / allQuestions.length) * 100),
      questions: results
    };

    // Save result to localStorage
    localStorage.setItem(`test_result_${testId}`, JSON.stringify(testResult));
    
    // Set refresh flag for reports
    localStorage.setItem('refreshReports', 'true');
    localStorage.setItem('refreshStudentReports', 'true');

    toast({
      title: "Test Completed",
      description: `You scored ${correctAnswers}/${allQuestions.length}`,
    });

    // Navigate to results page
    navigate(`/student/test/${testId}/result`);
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "Test time has ended. Please enter supervisor passcode to submit.",
      variant: "destructive",
    });
    setShowPasscodeDialog(true);
  };

  const handleManualSubmit = () => {
    const timeElapsed = (totalTestDuration - timeLeft) / totalTestDuration; // Calculate percentage of time elapsed
    if (timeElapsed >= 0.9) { // 90% of time completed
      setShowPasscodeDialog(true);
    } else {
      toast({
        title: "Cannot Submit Yet",
        description: `You can only submit after 90% of the test duration is completed. Currently ${Math.round(timeElapsed * 100)}% completed.`,
        variant: "destructive",
      });
    }
  };

  const validateSupervisorPasscode = async () => {
    if (!supervisorPasscode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the supervisor passcode.",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingPasscode(true);
    try {
      const response = await fetch('http://localhost:5000/api/passcode/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: supervisorPasscode,
          type: 'supervisor'
        }),
      });

      const data = await response.json();
      if (data.valid) {
        setShowPasscodeDialog(false);
        setSupervisorPasscode("");
        endTest("Test submitted successfully with supervisor approval.");
      } else {
        toast({
          title: "Invalid Passcode",
          description: data.message || "The supervisor passcode is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Passcode validation error:', error);
      toast({
        title: "Error",
        description: "Failed to validate passcode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingPasscode(false);
    }
  };

  const handlePasscodeDialogClose = () => {
    if (timeLeft > 0) {
      setShowPasscodeDialog(false);
      setSupervisorPasscode("");
    }
  };

  if (loading) {
    return (
      <TestLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test...</p>
          </div>
        </div>
      </TestLayout>
    );
  }

  if (error || !testData) {
    return (
      <TestLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Test Loading Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Failed to load test data'}</p>
            <Button onClick={() => navigate('/student/assessment')}>Back to Tests</Button>
          </div>
        </div>
      </TestLayout>
    );
  }

  const allQuestions = (testData?.Sections || []).flatMap((section: any) => {
    const mcqQuestions = (section?.MCQs || []).map((q: any, index: number) => ({
      ...q,
      type: 'MCQ',
      sectionName: section?.name || 'Unknown Section',
      questionNo: index + 1
    }));
    
    const codingQuestions = (section?.codingQuestions || []).map((q: any, index: number) => ({
      ...q,
      type: 'Coding',
      sectionName: section?.name || 'Unknown Section',
      questionNo: mcqQuestions.length + index + 1
    }));
    
    return [...mcqQuestions, ...codingQuestions];
  });

  console.log('Test Data:', testData);
  console.log('All Questions:', allQuestions);

  if (!testData || allQuestions.length === 0) {
    return (
      <TestLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-4">
            {!testData ? 'Test data could not be loaded.' : 'This test does not contain any questions.'}
          </p>
          <Button onClick={() => navigate('/student/assessment')}>Back to Tests</Button>
        </div>
      </TestLayout>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  
  // Safety check for current question
  if (!currentQuestion) {
    return (
      <TestLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Question Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load the current question.</p>
          <Button onClick={() => navigate('/student/assessment')}>Back to Tests</Button>
        </div>
      </TestLayout>
    );
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleCodeAnswer = (code: string) => {
    const language = selectedLanguages[currentQuestion.id] || currentQuestion.allowedLanguages[0];
    setCodeAnswers({ ...codeAnswers, [currentQuestion.id]: { code, language } });
  };

  const handleLanguageChange = (questionId: number, language: string) => {
    setSelectedLanguages({ ...selectedLanguages, [questionId]: language });
    const currentCode = codeAnswers[questionId]?.code || '';
    setCodeAnswers({ ...codeAnswers, [questionId]: { code: currentCode, language } });
  };

  const handleDryRun = async () => {
    if (currentQuestion.type !== 'Coding') return;
    
    const code = codeAnswers[currentQuestion.id]?.code;
    const language = selectedLanguages[currentQuestion.id] || currentQuestion.allowedLanguages[0];
    
    if (!code || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/dry-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code,
          language
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDryRunResults({ ...dryRunResults, [currentQuestion.id]: result });
        toast({
          title: "Dry Run Complete",
          description: `Passed ${result.summary.passed}/${result.summary.total} test cases`,
        });
      } else {
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

  const handleSubmitCode = async () => {
    if (currentQuestion.type !== 'Coding') return;
    
    const code = codeAnswers[currentQuestion.id]?.code;
    const language = selectedLanguages[currentQuestion.id] || currentQuestion.allowedLanguages[0];
    
    if (!code || !code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code,
          language,
          studentId: 'student123', // Replace with actual student ID
          testId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmissionResults({ ...submissionResults, [currentQuestion.id]: result });
        toast({
          title: "Code Submitted",
          description: `Score: ${result.score}/${result.maxScore} (${result.testResults.percentage}%)`,
        });
        handleNext();
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Code submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
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
    if (currentQuestion.type === 'MCQ') {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    } else {
      const newCodeAnswers = { ...codeAnswers };
      delete newCodeAnswers[currentQuestion.id];
      setCodeAnswers(newCodeAnswers);
    }
  };

  const getStatusColor = (qid: number, questionType: string) => {
    const hasAnswer = questionType === 'MCQ' ? answers[qid] : codeAnswers[qid]?.code;
    const isSubmitted = questionType === 'Coding' && submissionResults[qid];
    
    if (isSubmitted) return "bg-blue-500 text-white";
    if (hasAnswer) return "bg-green-500 text-white";
    if (markedForReview.has(qid)) return "bg-purple-500 text-white";
    if (qid === currentQuestion.id) return "bg-orange-500 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <TestLayout>
      <div className="flex h-screen">
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-lg font-semibold">{testData.name}</h1>
            <div className="flex items-center gap-4 text-orange-600">
              <Clock className="w-4 h-4" />
              <span>Time Left: {formatTime(timeLeft)}</span>
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPaused(!isPaused)}
                disabled={isTestEnded}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button> */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleManualSubmit}
                disabled={isTestEnded || (totalTestDuration - timeLeft) / totalTestDuration < 0.9}
              >
                {(totalTestDuration - timeLeft) / totalTestDuration >= 0.9 ? 'Submit Test' : `Submit (${Math.round(((totalTestDuration - timeLeft) / totalTestDuration) * 100)}% completed)`}
              </Button>
            </div>
          </div>

          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Q{currentQuestion.questionNo}: {currentQuestion.questionText}
                </CardTitle>
                {currentQuestion.questionImage && (
                  <div className="mt-2">
                    <img 
                      src={currentQuestion.questionImage} 
                      alt="Question" 
                      className="max-w-full h-auto rounded border"
                      onError={(e) => {
                        console.error('Question image failed to load:', currentQuestion.questionImage);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {currentQuestion.type === 'MCQ' ? (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={handleAnswer}
                    disabled={isTestEnded}
                  >
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="flex items-start space-x-3 p-3 border rounded mb-2">
                        <RadioGroupItem value={opt} id={`opt-${opt}`} className="mt-1" />
                        <Label htmlFor={`opt-${opt}`} className="flex-1 cursor-pointer">
                          <div className="flex items-start gap-2">
                            <span className="font-medium">{opt})</span>
                            <div className="flex-1">
                              <div>{currentQuestion[`option${opt}`]}</div>
                              {currentQuestion[`option${opt}Image`] && (
                                <img 
                                  src={currentQuestion[`option${opt}Image`]} 
                                  alt={`Option ${opt}`} 
                                  className="mt-2 max-w-xs h-auto rounded border"
                                  onError={(e) => {
                                    console.error(`Option ${opt} image failed to load:`, currentQuestion[`option${opt}Image`]);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Problem Statement:</h4>
                      <div className="whitespace-pre-wrap">{currentQuestion.problemStatement}</div>
                      
                      {currentQuestion.constraints && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-1">Constraints:</h5>
                          <div className="text-sm text-gray-600 whitespace-pre-wrap">{currentQuestion.constraints}</div>
                        </div>
                      )}
                      
                      {currentQuestion.sampleTestCases && currentQuestion.sampleTestCases.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Sample Test Cases:</h5>
                          <div className="space-y-2">
                            {currentQuestion.sampleTestCases.map((testCase: any, index: number) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Input:</strong>
                                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs">{testCase.input}</pre>
                                  </div>
                                  <div>
                                    <strong>Output:</strong>
                                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs">{testCase.output}</pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label>Programming Language:</Label>
                        <Select
                          value={selectedLanguages[currentQuestion.id] || currentQuestion.allowedLanguages[0]}
                          onValueChange={(value) => handleLanguageChange(currentQuestion.id, value)}
                          disabled={isTestEnded}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentQuestion.allowedLanguages.map((lang: string) => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDryRun}
                          disabled={isTestEnded || isRunning}
                          className="gap-2"
                        >
                          <Play className="w-4 h-4" />
                          {isRunning ? 'Running...' : 'Dry Run'}
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={handleSubmitCode}
                          disabled={isTestEnded || isRunning}
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                          Submit Code
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Your Solution:</Label>
                      <Textarea
                        placeholder={`Write your ${selectedLanguages[currentQuestion.id] || currentQuestion.allowedLanguages[0]} code here...`}
                        value={codeAnswers[currentQuestion.id]?.code || ''}
                        onChange={(e) => handleCodeAnswer(e.target.value)}
                        className="mt-2 font-mono text-sm"
                        rows={15}
                        disabled={isTestEnded}
                      />
                    </div>
                    
                    {/* Dry Run Results */}
                    {dryRunResults[currentQuestion.id] && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-medium mb-2 text-blue-800">Dry Run Results:</h5>
                        <div className="text-sm">
                          <p className="mb-2">Passed: {dryRunResults[currentQuestion.id].summary.passed}/{dryRunResults[currentQuestion.id].summary.total} test cases</p>
                          <div className="space-y-2">
                            {dryRunResults[currentQuestion.id].results.map((result: any, index: number) => (
                              <div key={index} className={`p-2 rounded ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                <div className="font-medium">{result.passed ? '✅' : '❌'} Test Case {index + 1}</div>
                                {!result.passed && (
                                  <div className="text-xs mt-1">
                                    <div>Expected: {result.expectedOutput}</div>
                                    <div>Got: {result.actualOutput}</div>
                                    {result.error && <div className="text-red-600">Error: {result.error}</div>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Submission Results */}
                    {submissionResults[currentQuestion.id] && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-medium mb-2 text-green-800">Submission Results:</h5>
                        <div className="text-sm">
                          <p>Status: <span className={`font-medium ${submissionResults[currentQuestion.id].status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                            {submissionResults[currentQuestion.id].status.toUpperCase()}
                          </span></p>
                          <p>Score: {submissionResults[currentQuestion.id].score}/{submissionResults[currentQuestion.id].maxScore}</p>
                          <p>Test Cases: {submissionResults[currentQuestion.id].testResults.passed}/{submissionResults[currentQuestion.id].testResults.total} passed</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                className={`w-8 h-8 rounded ${getStatusColor(q.id, q.type)}`}
                onClick={() => setCurrentQuestionIndex(idx)}
                disabled={isTestEnded}
              >
                {q.questionNo}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
              <span>Submitted</span>
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

      {/* Supervisor Passcode Dialog */}
      <Dialog open={showPasscodeDialog} onOpenChange={handlePasscodeDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supervisor Passcode Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {timeLeft === 0 
                ? "Test time has ended. Please enter the supervisor passcode to submit your test."
                : "To submit the test, please enter the supervisor passcode."}
            </p>
            <div>
              <Label htmlFor="passcode">Supervisor Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter 6-digit passcode"
                value={supervisorPasscode}
                onChange={(e) => setSupervisorPasscode(e.target.value)}
                maxLength={6}
                className="mt-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    validateSupervisorPasscode();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            {timeLeft > 0 && (
              <Button variant="outline" onClick={handlePasscodeDialogClose}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={validateSupervisorPasscode}
              disabled={isValidatingPasscode || !supervisorPasscode.trim()}
            >
              {isValidatingPasscode ? 'Validating...' : 'Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TestLayout>
  );
};

export default MCQTest;