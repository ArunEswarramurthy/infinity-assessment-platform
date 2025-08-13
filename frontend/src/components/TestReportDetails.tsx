import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Trophy,
  Medal,
  Award,
  Clock,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";

interface SectionScore {
  score: number;
  maxScore: number;
  percentage: number;
}

interface Student {
  rank: number;
  studentId: string;
  studentName: string;
  email: string;
  department: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionScores: Record<string, SectionScore>;
  completedAt: string;
  status: string;
  timeTaken: number;
}

interface TestReportDetailsProps {
  testId: string;
}

const TestReportDetails = ({ testId }: TestReportDetailsProps) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportDetails();
  }, [testId]);

  const fetchReportDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/test-reports/${testId}/details`);
      const data = await response.json();
      if (data.success) {
        setReportData(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch report details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'excel' | 'csv') => {
    try {
      setDownloading(format);
      const response = await fetch(`${API_BASE_URL}/api/admin/test-reports/${testId}/download?format=${format}`);
      
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 75) return "text-blue-600 bg-blue-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-gray-600">Loading report details...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No report data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/test-reports')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{reportData.test.name}</h1>
            <p className="text-gray-600">Test Report - {reportData.statistics.totalStudents} Students</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport('excel')}
            disabled={downloading === 'excel'}
          >
            {downloading === 'excel' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport('csv')}
            disabled={downloading === 'csv'}
          >
            {downloading === 'csv' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.statistics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{reportData.statistics.averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.statistics.highestScore}%</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                <p className="text-2xl font-bold text-red-600">{reportData.statistics.lowestScore}%</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Student Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.students.map((student: Student) => (
              <div
                key={student.studentId}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200">
                      {getRankIcon(student.rank)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                      <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                      {student.department && (
                        <p className="text-xs text-gray-500">{student.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Section Scores */}
                    <div className="flex gap-2">
                      {Object.entries(student.sectionScores).map(([section, score]) => (
                        <div key={section} className="text-center">
                          <p className="text-xs text-gray-500 capitalize">{section.replace('section', 'Sec ')}</p>
                          <Badge variant="outline" className="text-xs">
                            {score.score}/{score.maxScore}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total Score */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <Badge className={`text-sm font-bold ${getScoreColor(student.percentage)}`}>
                        {student.percentage}%
                      </Badge>
                    </div>
                    
                    {/* Time Taken */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {student.timeTaken}m
                    </div>
                    
                    {/* Status */}
                    <Badge 
                      variant={student.status === 'completed' ? 'default' : 'secondary'}
                      className={student.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {student.status === 'auto-submitted' ? 'Auto-Submitted' : 'Completed'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReportDetails;