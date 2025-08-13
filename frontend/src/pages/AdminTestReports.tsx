import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";

interface TestReport {
  testId: string;
  testName: string;
  totalStudents: number;
  completedStudents: number;
  createdAt: string;
  hasReports: boolean;
  averageScore?: number;
  highestScore?: number;
  hasAutoReports?: boolean;
}

const AdminTestReports = () => {
  const [tests, setTests] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/test-reports`);
      const data = await response.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch test reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadReport = async (testId: string, format: 'excel' | 'csv') => {
    try {
      setDownloading(testId);
      
      // First try to download auto-generated report
      let response = await fetch(`${API_BASE_URL}/api/admin/test-reports/${testId}/download-auto?format=${format}`);
      
      // If auto-generated report not found, fall back to manual generation
      if (!response.ok) {
        console.log('Auto-generated report not found, generating manually...');
        response = await fetch(`${API_BASE_URL}/api/admin/test-reports/${testId}/download?format=${format}`);
      }
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${testId}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${format.toUpperCase()} report downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading test reports...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Test Reports & License Management</h1>
              <p className="text-purple-100 mt-2">Download and manage student test reports with comprehensive analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 bg-white/20 text-white border-white/30">
                {tests.length} Tests
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchTests}
                disabled={refreshing}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Reports</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tests.filter(t => t.hasReports).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tests.reduce((sum, test) => sum + test.completedStudents, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tests.filter(t => !t.hasReports).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Reports List */}
        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.testId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold">{test.testName}</CardTitle>
                    <div className="flex gap-2">
                      <Badge 
                        variant={test.hasReports ? "default" : "secondary"}
                        className={test.hasReports ? "bg-green-100 text-green-800" : ""}
                      >
                        {test.hasReports ? "Reports Available" : "No Reports"}
                      </Badge>
                      {test.hasAutoReports && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Auto-Generated
                        </Badge>
                      )}
                    </div>
                  </div>
                  {test.hasReports && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/test-reports/${test.testId}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{test.completedStudents}</span>
                      <span>/ {test.totalStudents} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Completion: {test.totalStudents > 0 ? Math.round((test.completedStudents / test.totalStudents) * 100) : 0}%</span>
                    </div>
                  </div>
                  
                  {test.hasReports && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(test.testId, 'excel')}
                        disabled={downloading === test.testId}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        {downloading === test.testId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                        )}
                        Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(test.testId, 'csv')}
                        disabled={downloading === test.testId}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        {downloading === test.testId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        CSV
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {test.totalStudents > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{test.completedStudents}/{test.totalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(test.completedStudents / test.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Found</h3>
              <p className="text-gray-500 mb-4">Create your first test to start generating reports</p>
              <Button onClick={() => navigate('/admin/create-test')}>
                Create Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestReports;