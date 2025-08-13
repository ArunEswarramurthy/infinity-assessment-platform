import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TestResultNotification from "@/components/TestResultNotification";
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileDown,
  Timer
} from "lucide-react";
import TestCountdown from "@/components/TestCountdown";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const AdminReports = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [overviewStats, setOverviewStats] = useState({
    totalTests: 0,
    completedTests: 0,
    totalStudents: 0,
    averageScore: 0
  });

  const timePeriods = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "last3months", label: "Last 3 Months" }
  ];

  const statsDisplay = [
    { title: "Total Tests", value: overviewStats.totalTests, icon: FileText, color: "blue" },
    { title: "Completed Tests", value: overviewStats.completedTests, icon: CheckCircle, color: "green" },
    { title: "Total Students", value: overviewStats.totalStudents, icon: Users, color: "purple" },
    { title: "Average Score", value: `${overviewStats.averageScore}%`, icon: TrendingUp, color: "orange" }
  ];



  const downloadTestReport = async (testId: string, testName: string, reportType: 'detailed' | 'assessment' = 'detailed') => {
    try {
      setDownloading(prev => ({ ...prev, [testId]: true }));
      
      const endpoint = reportType === 'detailed' 
        ? `${API_BASE_URL}/api/reports/download-test-report/${testId}`
        : `${API_BASE_URL}/api/reports/download-assessment/${testId}`;
      
      const response = await axios.get(endpoint, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = reportType === 'detailed' 
        ? `${testName.replace(/\s+/g, '_')}_Detailed_Report.pdf`
        : `${testName.replace(/\s+/g, '_')}_Assessment_Report.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${testName} ${reportType} report downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const downloadBulkReport = async () => {
    try {
      setDownloading(prev => ({ ...prev, 'bulk': true }));
      
      const response = await axios.get(`${API_BASE_URL}/api/reports/download-bulk-report`, {
        params: { period: selectedPeriod },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bulk_Test_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Bulk Download Complete",
        description: `Bulk report for ${selectedPeriod} downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading bulk report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download bulk report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(prev => ({ ...prev, 'bulk': false }));
    }
  };

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/reports/test-history`);
      
      if (response.data.success) {
        const tests = response.data.data.map(test => ({
          testId: test.testId,
          testName: test.testName,
          description: test.description,
          createdDate: new Date(test.createdDate).toLocaleDateString(),
          createdDateTime: test.createdDate,
          totalAttempts: test.totalAttempts || 0,
          completedAttempts: test.completedAttempts || 0,
          averageScore: test.averageScore || 0,
          status: test.status || 'active',
          lastAttempt: test.lastAttempt ? new Date(test.lastAttempt).toLocaleDateString() : 'No attempts',
          hasResults: test.hasResults || false
        }));
        
        setTestHistory(tests);
        setFilteredHistory(tests);
        
        // Calculate overview stats
        const totalTests = tests.length;
        const completedTests = tests.filter(t => t.completedAttempts > 0).length;
        const totalStudents = tests.reduce((sum, t) => sum + t.completedAttempts, 0);
        const avgScore = tests.length > 0 ? 
          Math.round(tests.reduce((sum, t) => sum + t.averageScore, 0) / tests.length) : 0;
        
        setOverviewStats({
          totalTests,
          completedTests,
          totalStudents,
          averageScore: avgScore
        });
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTestHistory = () => {
    let filtered = [...testHistory];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by time period
    if (selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (selectedPeriod) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last7days':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(test => new Date(test.createdDateTime) >= cutoffDate);
      }
    }
    
    setFilteredHistory(filtered);
  };
  
  const refreshData = () => {
    fetchTestHistory();
    toast({
      title: "Refreshed",
      description: "Test history has been updated.",
    });
  };

  useEffect(() => {
    fetchTestHistory();
  }, []);
  
  useEffect(() => {
    filterTestHistory();
  }, [searchTerm, selectedPeriod, testHistory]);

  return (
    <AdminLayout>
      <TestResultNotification />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Reports Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and download test assessment reports</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={downloadBulkReport} 
              variant="outline" 
              disabled={downloading['bulk'] || filteredHistory.length === 0}
            >
              {downloading['bulk'] ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download All
            </Button>
            <Button onClick={refreshData} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by test name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Test History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Test History
              </div>
              <Badge variant="secondary">
                {filteredHistory.length} tests
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading test history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedPeriod !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Test history will appear here when tests are created'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div className="col-span-4">Test Information</div>
                  <div className="col-span-2">Created Date</div>
                  <div className="col-span-2">Attempts</div>
                  <div className="col-span-2">Avg Score</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                {/* Table Rows */}
                {filteredHistory.map((test) => (
                  <div key={test.testId} className="grid grid-cols-12 gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{test.testName}</h3>
                          <p className="text-sm text-gray-500">{test.testId}</p>
                          <Badge 
                            variant={test.status === 'active' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{test.createdDate}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {test.lastAttempt !== 'No attempts' ? `Last: ${test.lastAttempt}` : 'No attempts yet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {test.completedAttempts}
                        </div>
                        <p className="text-xs text-gray-500">
                          of {test.totalAttempts} total
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {test.averageScore}%
                        </div>
                        <p className="text-xs text-gray-500">
                          {test.completedAttempts > 0 ? 'average' : 'no data'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center gap-1">
                      {test.testInProgress ? (
                        <div className="flex-1">
                          <TestCountdown 
                            testId={test.testId} 
                            testName={test.testName}
                            onComplete={() => {
                              // Refresh data when countdown completes
                              setTimeout(refreshData, 1000);
                            }}
                          />
                        </div>
                      ) : test.hasResults ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => downloadTestReport(test.testId, test.testName, 'detailed')}
                            disabled={downloading[test.testId]}
                            className="flex-1 text-xs"
                            title="Download Detailed Report"
                          >
                            {downloading[test.testId] ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <FileDown className="w-3 h-3 mr-1" />
                                Detailed
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadTestReport(test.testId, test.testName, 'assessment')}
                            disabled={downloading[test.testId]}
                            className="flex-1 text-xs"
                            title="Download Assessment Report"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Assessment
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1 text-center text-sm text-gray-500">
                          No results available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;