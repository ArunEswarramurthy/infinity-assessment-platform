import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudentTestNotification from "@/components/StudentTestNotification";
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock,
  CheckCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";

const StudentReports = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [performanceStats, setPerformanceStats] = useState({
    totalTests: 0,
    averageScore: 0,
    completionRate: 0,
    bestScore: 0,
    worstScore: 0
  });
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [timeAnalytics, setTimeAnalytics] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [insights, setInsights] = useState({
    strengths: 'Complete your first test to see your strengths',
    improvements: 'Complete your first test to see areas for improvement',
    progress: 'Complete your first test to track your progress'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStudentReports = useCallback(async () => {
    const currentStudentId = studentId || localStorage.getItem('studentId') || '1';
    
    try {
      setIsLoading(true);
      console.log(`Fetching reports for user: ${currentStudentId}`);
      const response = await axios.get(`${API_BASE_URL}/api/student/reports/${currentStudentId}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const data = response.data;
        console.log(`✅ Found ${data.testsTaken} completed tests`);
        
        // Set performance stats directly from API
        setPerformanceStats({
          totalTests: data.testsTaken,
          averageScore: data.averageScore,
          completionRate: data.completionRate,
          bestScore: data.bestScore,
          worstScore: data.worstScore || 0
        });
        
        // Set new analytics data
        setPerformanceTrend(data.performanceTrend || []);
        setSubjectPerformance(data.subjectPerformance || []);
        setTimeAnalytics(data.timeAnalytics || {});
        setStudentInfo(data.studentInfo || {});
        
        // Set test history
        setTestHistory(data.recentTests || []);
        console.log('📊 Test history set:', data.recentTests?.length || 0, 'tests');
        
        // Set insights
        setInsights(data.insights || {
          strengths: 'Complete your first test to see your strengths',
          improvements: 'Complete your first test to see areas for improvement',
          progress: 'Complete your first test to track your progress'
        });
      } else {
        console.log('❌ API returned success: false');
        setTestHistory([]);
        setPerformanceStats({
          totalTests: 0,
          averageScore: 0,
          completionRate: 100,
          bestScore: 0
        });
        setInsights({
          strengths: 'Complete your first test to see your strengths',
          improvements: 'Complete your first test to see areas for improvement',
          progress: 'Complete your first test to track your progress'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching student reports:', error);
      console.error('Error details:', error.response?.data || error.message);
      setTestHistory([]);
      setPerformanceStats({
        totalTests: 0,
        averageScore: 0,
        completionRate: 100,
        bestScore: 0
      });
      setInsights({
        strengths: 'Unable to load data. Please check your connection and refresh.',
        improvements: 'Unable to load data. Please check your connection and refresh.',
        progress: 'Unable to load data. Please check your connection and refresh.'
      });
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, [studentId]);

  useEffect(() => {
    // Get student ID from localStorage or use default
    const currentStudentId = localStorage.getItem('studentId') || '1';
    setStudentId(currentStudentId);
    
    console.log('StudentReports - Student ID:', currentStudentId);
    fetchStudentReports();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStudentReports, 30000);
    
    // Check for refresh flags from test completion
    const shouldRefresh = localStorage.getItem('refreshReports') || localStorage.getItem('refreshStudentReports');
    if (shouldRefresh) {
      console.log('Refreshing student reports due to test completion');
      localStorage.removeItem('refreshReports');
      localStorage.removeItem('refreshStudentReports');
      setTimeout(fetchStudentReports, 2000);
    }
    
    return () => clearInterval(interval);
  }, [fetchStudentReports]);

  // Listen for storage changes (when test is completed)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if ((e.key === 'refreshReports' || e.key === 'refreshStudentReports') && e.newValue) {
        console.log('Test completed - refreshing student reports immediately');
        fetchStudentReports();
        localStorage.removeItem('refreshReports');
        localStorage.removeItem('refreshStudentReports');
      }
    };

    // Listen for both cross-tab and same-tab events
    window.addEventListener('storage', handleStorageChange);
    
    // Check for refresh flags on component mount
    const shouldRefresh = localStorage.getItem('refreshReports') || localStorage.getItem('refreshStudentReports');
    if (shouldRefresh) {
      console.log('Found refresh flag on mount - refreshing student reports');
      fetchStudentReports();
      localStorage.removeItem('refreshReports');
      localStorage.removeItem('refreshStudentReports');
    }
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchStudentReports]);



  const downloadReport = async (testSessionId: string, testName: string) => {
    try {
      console.log(`Downloading report for session: ${testSessionId}`);
      const response = await axios.get(`${API_BASE_URL}/api/student/download-report/${testSessionId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${testName.replace(/\s+/g, '_')}_Report.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const downloadOverallReport = async () => {
    try {
      const currentStudentId = studentId || localStorage.getItem('studentId') || '1';
      console.log(`Downloading overall report for user: ${currentStudentId}`);
      const response = await axios.get(`${API_BASE_URL}/api/student/overall-report/${currentStudentId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentInfo?.name || 'Student'}_Overall_Report.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      console.log('Overall report downloaded successfully');
    } catch (error) {
      console.error('Error downloading overall report:', error);
      alert('Failed to download overall report. Please try again.');
    }
  };

  return (
    <StudentLayout>
      <StudentTestNotification />
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">📊 My Reports</h1>
              <p className="text-purple-100">View your test performance and download reports</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-200">
                  Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh: ON
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchStudentReports}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600"
                disabled={isLoading}
              >
                <Clock className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                onClick={downloadOverallReport}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Overall Report
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{performanceStats.totalTests}</div>
              <div className="text-sm text-gray-600">Tests Taken</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{performanceStats.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{performanceStats.bestScore}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{performanceStats.worstScore}%</div>
              <div className="text-sm text-gray-600">Lowest Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{timeAnalytics.averageTestTime || 0}m</div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Test History & Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">You haven't completed any tests yet.</p>
                <p className="text-sm text-gray-400 mt-2">Your results will appear here after your first test.</p>
              </div>
            ) : (
              testHistory.map((test, index) => (
                <div key={test.testId || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{test.testName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {test.testId}
                      </Badge>
                      <Badge 
                        variant="default"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {test.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.duration}
                      </span>
                      <span className="font-medium">
                        Score: {test.rawScore}/{test.maxScore} ({test.score}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className={`text-lg font-bold ${
                        test.score >= 80 ? 'text-green-600' : 
                        test.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {test.score}%
                      </div>
                      <div className="text-xs text-gray-500">Grade</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadReport(test.testId, test.testName)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Subject Performance */}
        {subjectPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectPerformance.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                      <p className="text-sm text-gray-600">{subject.testsCount} test{subject.testsCount > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{subject.averageScore}%</div>
                        <div className="text-xs text-gray-500">Average</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{subject.bestScore}%</div>
                        <div className="text-xs text-gray-500">Best</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Trend */}
        {performanceTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trend (Last 10 Tests)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceTrend.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {test.testNumber}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{test.testName}</div>
                        <div className="text-xs text-gray-500">{test.date}</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      test.score >= 80 ? 'text-green-600' : 
                      test.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {test.score}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Analytics */}
        {Object.keys(timeAnalytics).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{timeAnalytics.averageTestTime}m</div>
                  <div className="text-sm text-blue-700">Average Time</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{timeAnalytics.fastestTest}m</div>
                  <div className="text-sm text-green-700">Fastest Test</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{timeAnalytics.slowestTest}m</div>
                  <div className="text-sm text-orange-700">Slowest Test</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(timeAnalytics.totalTestTime / 60)}h</div>
                  <div className="text-sm text-purple-700">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🎯 Strengths</h4>
                <p className="text-sm text-blue-700">
                  {insights.strengths}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">📈 Areas for Improvement</h4>
                <p className="text-sm text-yellow-700">
                  {insights.improvements}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📊 Progress Analysis</h4>
                <p className="text-sm text-green-700">
                  {insights.progress}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">💡 Personalized Recommendation</h4>
                <p className="text-sm text-purple-700">
                  {insights.recommendation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentReports;