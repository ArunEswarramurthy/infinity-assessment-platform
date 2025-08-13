import { useState, useEffect } from "react";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Play,
  Lock,
  FileText,
  Timer,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Test {
  testId: string;
  name: string;
  description: string;
  instructions: string;
  testDuration?: number;
  status?: string;
  createdAt: string;
  testDate?: string;
  startTime?: string;
  windowTime?: number;
  Sections: Section[];
}

interface Section {
  id: number;
  name: string;
  duration: number;
  type: string;
  instructions: string | null;
}

const StudentAssessment = () => {
  const [passcode, setPasscode] = useState("");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [showPreTestScreen, setShowPreTestScreen] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTestTiming = (test: Test) => {
    if (!test.testDate || !test.startTime) {
      return { canStart: false, canBegin: false, message: 'Test not scheduled', timeUntilStart: 0 };
    }

    const testStartDateTime = new Date(`${test.testDate}T${test.startTime}`);
    const testDuration = test.Sections.reduce((total, s) => total + s.duration, 0);
    const testEndDateTime = new Date(testStartDateTime.getTime() + (testDuration * 60000));
    
    const timeUntilStart = Math.floor((testStartDateTime.getTime() - currentTime.getTime()) / 60000);
    const timeUntilEnd = Math.floor((testEndDateTime.getTime() - currentTime.getTime()) / 60000);
    
    let canStart = false;
    let canBegin = false;
    let message = '';
    let countdown = '';

    if (currentTime < testStartDateTime) {
      // Before test start time
      if (timeUntilStart <= 15) {
        canStart = true;
        canBegin = false;
        const minutes = Math.floor(timeUntilStart);
        const seconds = Math.floor(((testStartDateTime.getTime() - currentTime.getTime()) % 60000) / 1000);
        countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        message = `Test available in ${countdown}`;
      } else {
        canStart = false;
        canBegin = false;
        message = `Available ${timeUntilStart - 15} minutes before start time`;
      }
    } else if (currentTime >= testStartDateTime && timeUntilEnd > 0) {
      // Test has started and within duration
      canStart = false;
      canBegin = true;
      message = `Test in progress - ${timeUntilEnd} minutes remaining`;
    } else {
      // After test end
      canStart = false;
      canBegin = false;
      message = 'Test time expired';
    }

    return { canStart, canBegin, message, timeUntilStart, countdown, remainingTime: timeUntilEnd };
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        // Always fetch all scheduled tests for now
        const response = await fetch('http://localhost:5000/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch tests');
        
        const allTests = await response.json();
        const scheduledTests = allTests.filter((test: any) => 
          test.status === 'scheduled'
        );
        
        // Fetch detailed test data for each test
        const transformedTests: Test[] = await Promise.all(
          scheduledTests.map(async (test: any) => {
            try {
              const detailResponse = await fetch(`http://localhost:5000/api/test/${test.testId}`);
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return {
                  testId: detailData.testId,
                  name: detailData.name,
                  description: detailData.description || "No description provided",
                  instructions: detailData.instructions || "No specific instructions provided",
                  testDuration: detailData.testDuration,
                  status: detailData.status || 'scheduled',
                  createdAt: detailData.createdAt,
                  testDate: detailData.testDate,
                  startTime: detailData.startTime,
                  windowTime: detailData.windowTime,
                  Sections: detailData.Sections?.map((section: any) => ({
                    id: section.id,
                    name: section.name,
                    duration: section.duration,
                    type: section.type,
                    instructions: section.instructions,
                  })) || []
                };
              }
            } catch (error) {
              console.error(`Error fetching details for test ${test.testId}:`, error);
            }
            
            // Fallback to basic data if detailed fetch fails
            return {
              testId: test.testId,
              name: test.name,
              description: test.description || "No description provided",
              instructions: test.instructions || "No specific instructions provided",
              testDuration: test.testDuration,
              status: test.status || 'scheduled',
              createdAt: test.createdAt,
              testDate: test.testDate,
              startTime: test.startTime,
              windowTime: test.windowTime,
              Sections: []
            };
          })
        );
        
        setUpcomingTests(transformedTests);
        return;

      } catch (error) {
        console.error("Error fetching tests:", error);
        const errorMessage = error.message.includes('fetch') 
          ? "Cannot connect to server. Please check if the backend is running."
          : "Failed to load tests. Please try again later.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setUpcomingTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [toast]);

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setShowPasscodeDialog(true);
    setPasscode("");
    setPasscodeError("");
  };

  const handlePasscodeSubmit = async () => {
    if (passcode.length !== 6) {
      setPasscodeError("Please enter a 6-digit passcode");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/passcode/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: passcode }),
      });

      const data = await response.json();

      if (data.valid) {
        setShowPasscodeDialog(false);
        setShowPreTestScreen(true);
        toast({
          title: "Access Granted",
          description: "Welcome to the assessment. Please review the instructions carefully.",
        });
      } else {
        setPasscodeError(data.message || "Invalid passcode. Please try again.");
      }
    } catch (error) {
      console.error("Passcode validation failed", error);
      setPasscodeError("Failed to validate passcode. Please try again.");
    }
  };

  const handleBeginTest = () => {
    if (!selectedTest) {
      console.error('No selected test found');
      return;
    }
    
    console.log('Beginning test:', selectedTest);
    
    setShowPreTestScreen(false);
    toast({
      title: "Test Started",
      description: "Good luck! The timer has begun.",
    });
    
    // Navigate to test page
    try {
      navigate(`/student/test/${selectedTest.testId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to test. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading tests...</p>
        </div>
      </StudentLayout>
    );
  }

  const allTests = upcomingTests;

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">📋 Assessment Center</h1>
              <p className="text-purple-100">Your upcoming tests and assessments</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{allTests.length}</div>
              <div className="text-sm text-purple-200">Upcoming Tests</div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Tests
          </h2>

          {allTests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No upcoming tests available</p>
              </CardContent>
            </Card>
          ) : (
            allTests.map((test) => (
              <Card
                key={test.testId}
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {test.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {test.testId}
                        </Badge>
                        <Badge 
                          variant={
                            test.status === 'scheduled' ? 'default' : 
                            test.status === 'saved' ? 'secondary' : 'outline'
                          } 
                          className="text-xs"
                        >
                          {test.status === 'scheduled' ? 'Scheduled' : 
                           test.status === 'saved' ? 'Saved' : 'Draft'}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4">{test.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Timer className="w-4 h-4" />
                          {test.testDuration || test.Sections.reduce((total, s) => total + s.duration, 0)} minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {test.testDate ? new Date(test.testDate).toLocaleDateString() : 'Not scheduled'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {test.startTime || 'No time set'}
                        </div>

                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {test.Sections.map((section, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {section.type === "MCQ" ? "📝" : "💻"} {section.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col items-end gap-2">
                      {test.status === 'scheduled' ? (() => {
                        const timing = getTestTiming(test);
                        return (
                          <>
                            {timing.countdown && (
                              <div className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {timing.countdown}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 text-center">
                              {timing.message}
                            </div>
                            {timing.canStart && !timing.canBegin ? (
                              <Button
                                onClick={() => handleStartTest(test)}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Enter Test
                              </Button>
                            ) : timing.canBegin ? (
                              <Button
                                onClick={() => handleStartTest(test)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Begin Test
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="bg-gray-400 cursor-not-allowed"
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Not Available
                              </Button>
                            )}
                          </>
                        );
                      })() : (
                        <Button
                          disabled
                          className="bg-gray-400 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {test.status === 'draft' ? 'Draft' : 'Not Scheduled'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Passcode Dialog */}
        <Dialog open={showPasscodeDialog} onOpenChange={setShowPasscodeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Enter Test Passcode
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please enter the 6-digit passcode to access the test
                </p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={passcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPasscode(value);
                    setPasscodeError("");
                  }}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                {passcodeError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {passcodeError}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPasscodeDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handlePasscodeSubmit} className="flex-1">
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pre-Test Screen Dialog */}
        <Dialog open={showPreTestScreen} onOpenChange={setShowPreTestScreen}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Test Instructions - {selectedTest?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Test Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Duration:</span>
                    <span className="ml-2 font-medium">
                      {selectedTest ? (() => {
                        const timing = getTestTiming(selectedTest);
                        const originalDuration = selectedTest.Sections.reduce((sum, section) => sum + section.duration, 0);
                        const availableDuration = timing.remainingTime > 0 ? Math.min(originalDuration, timing.remainingTime) : originalDuration;
                        return `${availableDuration} minutes`;
                      })() : '0 minutes'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Sections:</span>
                    <span className="ml-2 font-medium">{selectedTest?.Sections.length}</span>
                  </div>
                </div>
                {selectedTest && (() => {
                  const timing = getTestTiming(selectedTest);
                  return timing.countdown && !timing.canBegin ? (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">Test starts in: </span>
                        <span className="text-xl font-mono text-yellow-900">{timing.countdown}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">General Instructions</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>{selectedTest?.instructions}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Test Sections</h3>
                <div className="space-y-2">
                  {selectedTest?.Sections.map((section, index) => (
                    <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{index + 1}. {section.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({section.type})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {section.duration} minutes
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Notes
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• The test will run in fullscreen mode</li>
                  <li>• Do not refresh the page or navigate away</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You can review and change answers within each section</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPreTestScreen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {selectedTest && (() => {
                  const timing = getTestTiming(selectedTest);
                  return timing.canBegin ? (
                    <Button
                      onClick={handleBeginTest}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Test
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="flex-1 bg-gray-400 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {timing.countdown ? `Wait ${timing.countdown}` : 'Not Available'}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default StudentAssessment;