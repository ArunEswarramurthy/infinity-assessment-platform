import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Coffee, CheckCircle } from 'lucide-react';
import StudentLayout from '@/components/StudentLayout';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import MCQSection from '@/components/MCQSection';
import CodingSection from '@/components/CodingSection';

const SectionTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<number, { code: string; language: string }>>({});
  const [sectionStartTime, setSectionStartTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentId = user?.id;

  // Debug logging
  useEffect(() => {
    console.log('SectionTest - User:', user);
    console.log('SectionTest - Student ID:', studentId);
  }, [user, studentId]);

  useEffect(() => {
    if (studentId) {
      checkTestEligibility();
    }
  }, [testId, studentId]);

  const checkTestEligibility = async () => {
    try {
      console.log('Checking test eligibility for:', { testId, studentId });
      const response = await fetch(`${API_BASE_URL}/api/test-session/${testId}/${studentId}/eligibility`);
      const result = await response.json();
      
      if (result.success) {
        if (!result.canTakeTest) {
          // Student has already completed this test
          toast({
            title: "Test Already Completed",
            description: `You completed this test on ${new Date(result.completedAt).toLocaleDateString()} with a score of ${result.score}/${result.maxScore} (${result.percentage}%). Each test can only be taken once.`,
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/student/reports');
          }, 3000);
          return;
        }
        
        if (result.hasInProgressSession) {
          toast({
            title: "Resuming Test",
            description: `You have an in-progress session. Resuming from section ${result.currentSection + 1}.`,
          });
        }
        
        // Proceed to start the test session
        startTestSession();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Check eligibility error:', error);
      toast({
        title: "Error",
        description: "Failed to check test eligibility",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (onBreak && breakTimeLeft > 0) {
      const timer = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            setOnBreak(false);
            getCurrentSection();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [onBreak, breakTimeLeft]);

  const startTestSession = async () => {
    try {
      console.log('Starting test session with:', { testId, studentId });
      const response = await fetch(`${API_BASE_URL}/api/test-session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, studentId })
      });

      const result = await response.json();
      if (result.success) {
        setSession(result.session);
        if (result.session.breakEndTime) {
          const breakEnd = new Date(result.session.breakEndTime);
          const now = new Date();
          if (breakEnd > now) {
            setOnBreak(true);
            setBreakTimeLeft(Math.ceil((breakEnd.getTime() - now.getTime()) / 1000));
            return;
          }
        }
        getCurrentSection();
      } else {
        if (result.alreadyCompleted) {
          toast({
            title: "Test Already Completed",
            description: "You have already completed this test. Redirecting to reports...",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/student/reports');
          }, 2000);
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Start session error:', error);
      toast({
        title: "Error",
        description: "Failed to start test session",
        variant: "destructive",
      });
    }
  };

  const getCurrentSection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-session/${testId}/${studentId}/current`);
      const result = await response.json();

      if (result.success) {
        if (result.onBreak) {
          setOnBreak(true);
          setBreakTimeLeft(result.remainingBreakTime);
          return;
        }

        setSession(result.session);
        setCurrentSection(result.section);
        setTestData(result.test);
        setSectionStartTime(new Date());
        setAnswers({});
        setCodeAnswers({});
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Get section error:', error);
      toast({
        title: "Error",
        description: "Failed to load section",
        variant: "destructive",
      });
    }
  };

  const submitSection = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeSpent = Math.floor((new Date().getTime() - sectionStartTime.getTime()) / 1000);
      
      // Prepare coding submissions
      const codingSubmissions = Object.entries(codeAnswers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        code: answer.code,
        language: answer.language,
        score: 0 // Will be calculated by backend
      }));

      console.log('Submitting section with studentId:', studentId);
      const response = await fetch(`${API_BASE_URL}/api/test-session/${testId}/${studentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcqAnswers: answers,
          codingSubmissions,
          timeSpent
        })
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.testCompleted) {
          console.log('Test completed for student:', studentId);
          toast({
            title: "Test Completed!",
            description: `Your score: ${result.totalScore}/${result.maxScore}`,
          });
          
          // Set completion data for reports refresh
          localStorage.setItem('refreshReports', 'true');
          localStorage.setItem('completedTestStudentId', studentId);
          localStorage.setItem('lastCompletedTest', JSON.stringify({
            testId,
            studentId,
            completedAt: new Date().toISOString(),
            score: result.totalScore,
            maxScore: result.maxScore
          }));
          
          // Trigger storage event for same-tab refresh
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'refreshReports',
            newValue: 'true'
          }));
          
          // Redirect to student reports page after 2 seconds
          setTimeout(() => {
            navigate('/student/reports');
          }, 2000);
        } else if (result.sectionCompleted) {
          toast({
            title: "Section Completed!",
            description: "Take a 1-minute break before the next section",
          });
          setOnBreak(true);
          setBreakTimeLeft(result.breakDuration);
        }
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submit section error:', error);
      toast({
        title: "Error",
        description: "Failed to submit section",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (onBreak) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Coffee className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl">Break Time</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Take a moment to relax before the next section
              </p>
              <div className="text-4xl font-bold text-blue-600">
                {formatTime(breakTimeLeft)}
              </div>
              <Progress value={((60 - breakTimeLeft) / 60) * 100} className="w-full" />
              <p className="text-sm text-gray-500">
                The next section will start automatically
              </p>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  if (!session || !currentSection || !testData) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test...</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student/assessment')}
                className="text-sm"
              >
                Back to Tests
              </Button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{testData.name}</h1>
                <p className="text-sm text-gray-600">
                  Section {session.currentSectionIndex + 1} of {session.totalSections}: {currentSection.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{currentSection.duration} minutes</span>
                </div>
                <Button
                  onClick={submitSection}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Section'}
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{session.currentSectionIndex + 1} / {session.totalSections} sections</span>
              </div>
              <Progress 
                value={((session.currentSectionIndex + 1) / session.totalSections) * 100} 
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {currentSection.instructions && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Section Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{currentSection.instructions}</p>
              </CardContent>
            </Card>
          )}

          {currentSection.type === 'MCQ' ? (
            <MCQSection
              questions={currentSection.MCQs}
              answers={answers}
              onAnswerChange={setAnswers}
            />
          ) : (
            <CodingSection
              questions={currentSection.codingQuestions}
              codeAnswers={codeAnswers}
              onCodeAnswerChange={setCodeAnswers}
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default SectionTest;