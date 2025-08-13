import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, Clock, Trophy, RefreshCw, Code } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";

import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentTestNotification from "@/components/StudentTestNotification";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Sample Leaderboard Data
const leaderboardRows = [
  { name: "Alice Johnson", department: "CSE", year: "3rd", testCount: 10, score: 95 },
  { name: "Mark Lee", department: "ECE", year: "2nd", testCount: 8, score: 90 },
  { name: "Sophia Brown", department: "IT", year: "4th", testCount: 12, score: 88 },
  { name: "David Smith", department: "MECH", year: "3rd", testCount: 9, score: 85 },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    scheduledTests: [],
    completedTests: [],
    practiceResults: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("Student");

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const studentId = localStorage.getItem("studentId") || "1";
      
      // Fetch all test data sources
      const [assignedTestsResponse, practiceResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/student-dashboard/dashboard/${studentId}`).catch(err => ({ data: { success: false, assignedTests: [] } })),
        axios.get(`http://localhost:5000/api/practice/dashboard/${studentId}`).catch(err => ({ data: { success: false, data: { practiceResults: [] } } }))
      ]);
      
      let combinedData = {
        scheduledTests: [],
        completedTests: [],
        practiceResults: []
      };
      
      // Process assigned tests data
      if (assignedTestsResponse.data.success && assignedTestsResponse.data.assignedTests) {
        const assignedTests = assignedTestsResponse.data.assignedTests || [];
        
        combinedData.scheduledTests = assignedTests.filter(test => 
          test.status === 'upcoming' || test.status === 'available' || test.status === 'in_progress'
        );
        
        combinedData.completedTests = assignedTests.filter(test => 
          test.status === 'completed'
        ).map(test => ({
          testId: test.testId,
          name: test.testName,
          score: test.score || 0,
          maxScore: test.maxScore || 100,
          percentage: test.percentage || 0,
          completedAt: test.completedAt
        }));
        
        if (assignedTestsResponse.data.studentName) {
          setStudentName(assignedTestsResponse.data.studentName);
        }
      } else {
        // If API fails, try to get data from localStorage or other sources
        const storedTests = localStorage.getItem('studentTests');
        if (storedTests) {
          try {
            const parsedTests = JSON.parse(storedTests);
            combinedData.scheduledTests = parsedTests.scheduled || [];
            combinedData.completedTests = parsedTests.completed || [];
          } catch (e) {
            console.warn('Failed to parse stored tests');
          }
        }
      }
      
      // Process practice data
      if (practiceResponse.data.success && practiceResponse.data.data) {
        combinedData.practiceResults = practiceResponse.data.data.practiceResults || [];
        console.log('Fetched practice results:', combinedData.practiceResults.length);
      }
      
      setDashboardData(combinedData);
      
      // Store test data for backup
      localStorage.setItem('studentTests', JSON.stringify({
        scheduled: combinedData.scheduledTests,
        completed: combinedData.completedTests,
        lastUpdated: new Date().toISOString()
      }));
      
      console.log("Dashboard updated - Scheduled:", combinedData.scheduledTests.length, "Completed:", combinedData.completedTests.length);
      
    } catch (error) {
      // If test assignments fail, still try to show practice data
      if (error.response?.status === 404) {
        setError("Student data not found");
      } else if (error.response?.status === 500) {
        setError("Server error occurred");
      } else if (error.code === "NETWORK_ERROR") {
        setError("Network connection failed");
      } else {
        setError("Failed to load some dashboard data");
      }
      console.error("Dashboard fetch error:", error.message || "Unknown error");
      
      // Set empty data to prevent crashes
      setDashboardData({
        scheduledTests: [],
        completedTests: [],
        practiceResults: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    let timeoutId;
    const scheduleNextFetch = () => {
      timeoutId = setTimeout(() => {
        fetchDashboardData().finally(() => {
          scheduleNextFetch();
        });
      }, 30000);
    };

    scheduleNextFetch();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const calculateAverageScore = () => {
    if (!dashboardData.completedTests || dashboardData.completedTests.length === 0) return 0;
    const total = dashboardData.completedTests.reduce(
      (sum, test) => sum + (test.percentage || 0),
      0
    );
    return Math.round(total / dashboardData.completedTests.length);
  };

  // Calculate total tests count with fallback
  const scheduledCount = dashboardData.scheduledTests?.length || 0;
  const completedCount = dashboardData.completedTests?.length || 0;
  const totalTests = scheduledCount + completedCount;
  
  // If total is 0 but we know there should be tests, try alternative count
  const actualTotalTests = totalTests > 0 ? totalTests : 
    (localStorage.getItem('knownTestCount') ? parseInt(localStorage.getItem('knownTestCount') || '0') : 0);

  return (
    <StudentLayout>
      <StudentTestNotification />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {studentName}!
              </h1>
              <p className="text-purple-100">
                Ready to continue your learning journey?
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="text-purple-600 border-white hover:bg-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="text-red-800 text-sm font-medium">⚠️ {error}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDashboardData}
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : scheduledCount + (dashboardData.scheduledTests?.filter(t => t.status === 'available').length || 0)}
              </div>
              <div className="text-sm text-gray-600">Upcoming Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : scheduledCount}
              </div>
              <div className="text-sm text-gray-600">Scheduled Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : completedCount}
              </div>
              <div className="text-sm text-gray-600">Tests Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : `${calculateAverageScore()}%`}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div><strong>Student ID:</strong> {localStorage.getItem("studentId") || "STUDENT123"}</div>
                <div><strong>Total Tests:</strong> {actualTotalTests} (calc: {totalTests})</div>
                <div><strong>Scheduled:</strong> {scheduledCount}</div>
                <div><strong>Completed:</strong> {completedCount}</div>
                <div><strong>Loading:</strong> {loading.toString()}</div>
                <div><strong>Error:</strong> {error || 'None'}</div>
                {dashboardData.scheduledTests?.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Scheduled Tests Data</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(dashboardData.scheduledTests, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/student/tests')}
              >
                <BookOpen className="w-6 h-6 mb-2" />
                <span className="text-sm">All Tests</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/student/practice')}
              >
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm">Practice</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
                onClick={() => navigate('/coding-platform')}
              >
                <Code className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Coding Platform</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/student/reports')}
              >
                <Trophy className="w-6 h-6 mb-2" />
                <span className="text-sm">Results</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={fetchDashboardData}
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="text-sm">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Tests Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scheduled Tests */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Scheduled Tests ({dashboardData.scheduledTests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <div className="text-sm text-gray-600">Loading scheduled tests...</div>
                </div>
              ) : dashboardData.scheduledTests?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.scheduledTests.slice(0, 5).map((test, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium">{test.testName || test.name}</h4>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-blue-600">
                          {test.testDate} at {test.startTime}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            test.status === 'available' ? 'bg-green-100 text-green-800' :
                            test.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {test.status}
                          </span>
                          {(test.status === 'available' || test.status === 'in_progress') && (
                            <Button 
                              size="sm" 
                              onClick={() => navigate(`/test/${test.testId}`)}
                              className="text-xs"
                            >
                              {test.status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.scheduledTests.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/tests')}>
                        View All Tests ({dashboardData.scheduledTests.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No scheduled tests</p>
              )}
            </CardContent>
          </Card> */}

          {/* Completed Tests */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Completed Tests ({dashboardData.completedTests?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
                  <div className="text-sm text-gray-600">Loading completed tests...</div>
                </div>
              ) : dashboardData.completedTests?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.completedTests.slice(0, 5).map((test, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium">{test.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-green-600">
                          Score: {test.score}/{test.maxScore} ({test.percentage}%)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(test.completedAt).toLocaleDateString()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/test-results/${test.testId}`)}
                            className="text-xs"
                          >
                            View Results
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.completedTests.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/results')}>
                        View All Results ({dashboardData.completedTests.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No completed tests</p>
              )}
            </CardContent>
          </Card> */}
        </div>

        {/* Recent Activity */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-600" />
                <div className="text-sm text-gray-600">Loading activity...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show recent completed tests */}
                {/* {dashboardData.completedTests?.slice(0, 3).map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-gray-600">
                          Completed {new Date(test.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{test.percentage}%</div>
                      <div className="text-xs text-gray-500">{test.score}/{test.maxScore}</div>
                    </div>
                  </div>
                ))} */}
{/*                 
                Show upcoming tests */}
                {/* {dashboardData.scheduledTests?.slice(0, 2).map((test, index) => (
                  <div key={`scheduled-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{test.testName || test.name}</div>
                        <div className="text-xs text-gray-600">
                          Scheduled for {test.testDate} at {test.startTime}
                        </div>
                      </div>
                    </div> */}
                    {/* <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        test.status === 'available' ? 'bg-green-100 text-green-800' :
                        test.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                  </div> */}
                {/* ))} */} 
                
                {/* {(!dashboardData.completedTests?.length && !dashboardData.scheduledTests?.length) && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <div className="font-medium">No recent activity</div>
                    <div className="text-sm">Your test activity will appear here</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Leaderboard Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="leaderboard table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Student Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Department
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Year
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Test Count
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Score
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboardRows
                    .sort((a, b) => b.score - a.score)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.department}</TableCell>
                        <TableCell align="right">{row.year}</TableCell>
                        <TableCell align="right">{row.testCount}</TableCell>
                        <TableCell align="right">{row.score}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
