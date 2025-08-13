
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Play, Eye, CheckCircle, Timer, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const StudentTests = () => {
  const navigate = useNavigate();
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    department: '',
    totalTests: 0,
    availableTests: 0,
    completedTests: 0,
    upcomingTests: 0
  });

  // Fetch assigned tests
  const fetchAssignedTests = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('userId') || 'student1';
      
      const response = await axios.get(`${API_BASE_URL}/api/test-assignments/student/${studentId}`);
      
      if (response.data.success) {
        setAssignedTests(response.data.assignedTests);
        setStudentInfo({
          name: response.data.studentName,
          department: response.data.department,
          totalTests: response.data.totalTests,
          availableTests: response.data.availableTests,
          completedTests: response.data.completedTests,
          upcomingTests: response.data.upcomingTests
        });
      }
    } catch (error) {
      console.error('Error fetching assigned tests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assigned tests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  // Filter tests by status
  const upcomingTests = assignedTests.filter(test => 
    ['upcoming', 'available', 'in_progress'].includes(test.status)
  );
  
  const completedTests = assignedTests.filter(test => 
    test.status === 'completed'
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-gray-100 text-gray-800";
      case "available":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "available":
        return "Available";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const getDifficultyColor = (sectionsCount) => {
    if (sectionsCount <= 1) return "bg-green-100 text-green-800";
    if (sectionsCount <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const getDifficultyLabel = (sectionsCount) => {
    if (sectionsCount <= 1) return "Easy";
    if (sectionsCount <= 3) return "Medium";
    return "Hard";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getTimeRemaining = (testDate, startTime, windowTime) => {
    if (!testDate || !startTime) return 'No deadline';
    
    const testStart = new Date(`${testDate}T${startTime}`);
    const startWindow = new Date(testStart.getTime() + (15 * 60000)); // 15 minutes after start
    const testEnd = new Date(testStart.getTime() + (windowTime * 60000));
    const now = new Date();
    
    if (now > testEnd) return 'Expired';
    if (now > startWindow) return 'Start window expired';
    if (now < testStart) {
      const minutesUntilStart = Math.ceil((testStart - now) / (1000 * 60));
      if (minutesUntilStart < 60) {
        return `Starts in ${minutesUntilStart}m`;
      }
      const hoursUntilStart = Math.ceil(minutesUntilStart / 60);
      return `Starts in ${hoursUntilStart}h`;
    }
    
    // Within start window
    const minutesRemaining = Math.ceil((startWindow - now) / (1000 * 60));
    return `${minutesRemaining}m to join`;
  };
  
  const handleStartTest = (testId) => {
    navigate(`/student/test/${testId}`);
  };
  
  const handleViewResults = (testId) => {
    navigate(`/student/test-result/${testId}`);
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Tests</h1>
              <p className="text-purple-100">Welcome back, {studentInfo.name || 'Student'}</p>
              {studentInfo.department && (
                <p className="text-purple-200 text-sm">Department: {studentInfo.department}</p>
              )}
            </div>
            <Button 
              onClick={fetchAssignedTests} 
              variant="outline" 
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Test Navigation */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Active Tests ({upcomingTests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Tests ({completedTests.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Tests */}
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your tests...</p>
              </div>
            ) : upcomingTests.length === 0 ? (
              <div className="text-center py-12">
                <Timer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active tests</h3>
                <p className="text-gray-500">You don't have any tests available right now.</p>
              </div>
            ) : (
              upcomingTests.map((test) => (
                <Card key={test.testId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{test.testName}</h3>
                          <Badge className={getDifficultyColor(test.sectionsCount)}>
                            {getDifficultyLabel(test.sectionsCount)}
                          </Badge>
                          <Badge className={getStatusColor(test.status)}>
                            {getStatusLabel(test.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{test.description || 'No description available'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {test.totalDuration} minutes
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            {test.sectionsCount} sections
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <AlertCircle className="w-4 h-4" />
                            {getTimeRemaining(test.testDate, test.startTime, test.windowTime)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Timer className="w-4 h-4" />
                            {formatDate(test.testDate)} at {formatTime(test.startTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        {test.canStart ? (
                          <div className="space-y-2">
                            <Button onClick={() => handleStartTest(test.testId)}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Test
                            </Button>
                            {test.isLicensedUser && (
                              <div className="text-xs text-orange-600 max-w-32">
                                ⚠️ One-time only
                              </div>
                            )}
                          </div>
                        ) : test.canContinue ? (
                          <div className="space-y-2">
                            <Button onClick={() => handleStartTest(test.testId)}>
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                            {test.isLicensedUser && (
                              <div className="text-xs text-orange-600 max-w-32">
                                ⚠️ One-time only
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Button variant="outline" disabled>
                              {test.status === 'upcoming' ? 'Not Available' : 
                               test.status === 'expired' ? 'Window Expired' :
                               test.alreadyCompleted ? 'Completed' :
                               test.alreadyAttempted ? 'Already Attempted' : 'Expired'}
                            </Button>
                            {(test.alreadyCompleted || test.alreadyAttempted) && test.isLicensedUser && (
                              <div className="text-xs text-red-600 max-w-32">
                                Licensed users: One attempt only
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Tests */}
          <TabsContent value="completed" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading completed tests...</p>
              </div>
            ) : completedTests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tests</h3>
                <p className="text-gray-500">Your completed tests will appear here.</p>
              </div>
            ) : (
              completedTests.map((test) => (
                <Card key={test.testId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{test.testName}</h3>
                          <Badge className={getDifficultyColor(test.sectionsCount)}>
                            {getDifficultyLabel(test.sectionsCount)}
                          </Badge>
                          <Badge className={getStatusColor(test.status)}>
                            {getStatusLabel(test.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{test.description || 'No description available'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {test.totalDuration} minutes
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            {test.sectionsCount} sections
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4" />
                            Completed {formatDate(test.completedAt)}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Your Score</span>
                            <span className={`font-medium ${getScoreColor(test.percentage)}`}>
                              {test.score}/{test.maxScore} ({test.percentage}%)
                            </span>
                          </div>
                          <Progress value={test.percentage} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button variant="outline" onClick={() => handleViewResults(test.testId)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentInfo.totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Timer className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentInfo.availableTests}</div>
              <div className="text-sm text-gray-600">Available Now</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentInfo.completedTests}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentInfo.upcomingTests}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentTests;
