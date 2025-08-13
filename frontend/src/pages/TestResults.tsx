import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Award, ArrowLeft, Download, Code } from 'lucide-react';
import StudentLayout from '@/components/StudentLayout';
import { API_BASE_URL } from '@/config/api';

const TestResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [codingStats, setCodingStats] = useState<any>(null);

  const studentId = 'student123'; // Replace with actual student ID

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-session/${testId}/${studentId}/results`);
      const result = await response.json();

      if (result.success) {
        setResults(result.results);
        calculateCodingStats(result.results);
      } else {
        console.error('Failed to fetch results:', result.error);
      }
    } catch (error) {
      console.error('Fetch results error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const calculateCodingStats = (results: any) => {
    let totalTestCases = 0;
    let passedTestCases = 0;
    let totalCodingQuestions = 0;

    results.sections.forEach((section: any) => {
      if (section.codingSubmissions && section.codingSubmissions.length > 0) {
        section.codingSubmissions.forEach((submission: any) => {
          totalCodingQuestions++;
          if (submission.testResults) {
            totalTestCases += submission.testResults.total || 0;
            passedTestCases += submission.testResults.passed || 0;
          }
        });
      }
    });

    setCodingStats({
      totalTestCases,
      passedTestCases,
      totalCodingQuestions
    });
  };

  const downloadResults = () => {
    const data = {
      studentName: 'Student Name',
      testName: results.testName,
      totalScore: results.totalScore,
      maxScore: results.maxScore,
      percentage: results.percentage,
      sections: results.sections,
      codingStats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${results.testName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!results) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Results not found</p>
            <Button onClick={() => navigate('/student/assessment')}>
              Back to Tests
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
            <p className="text-gray-600">{results.testName}</p>
          </div>

          {/* Overall Results */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                Your Results
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadResults}
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center mb-8">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {results.totalScore}
                  </div>
                  <div className="text-gray-600">Total Score</div>
                  <div className="text-sm text-gray-500">out of {results.maxScore}</div>
                </div>
                
                <div>
                  <div className={`text-4xl font-bold mb-2 ${getGradeColor(results.percentage)}`}>
                    {results.percentage}%
                  </div>
                  <div className="text-gray-600">Percentage</div>
                  <div className={`text-sm font-medium ${getGradeColor(results.percentage)}`}>
                    Grade: {getGradeLetter(results.percentage)}
                  </div>
                </div>
                
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {results.sections.length}
                  </div>
                  <div className="text-gray-600">Sections</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                
                {codingStats && codingStats.totalCodingQuestions > 0 && (
                  <div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {codingStats.passedTestCases}
                    </div>
                    <div className="text-gray-600">Test Cases Passed</div>
                    <div className="text-sm text-gray-500">out of {codingStats.totalTestCases}</div>
                  </div>
                )}
              </div>

              {codingStats && codingStats.totalCodingQuestions > 0 && (
                <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Code className="w-5 h-5" />
                      Coding Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{codingStats.totalCodingQuestions}</div>
                        <div className="text-sm text-gray-600">Coding Questions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{codingStats.passedTestCases}</div>
                        <div className="text-sm text-gray-600">Test Cases Passed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{codingStats.totalTestCases}</div>
                        <div className="text-sm text-gray-600">Total Test Cases</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Test Cases Success Rate</span>
                        <span className="text-sm text-gray-500">
                          {codingStats.totalTestCases > 0 ? Math.round((codingStats.passedTestCases / codingStats.totalTestCases) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={codingStats.totalTestCases > 0 ? (codingStats.passedTestCases / codingStats.totalTestCases) * 100 : 0} 
                        className="h-3" 
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-500">{results.percentage}%</span>
                </div>
                <Progress value={results.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Section-wise Results */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Section-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.sections.map((section: any, index: number) => {
                  const sectionPercentage = Math.round((section.score / section.maxScore) * 100);
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Section {section.sectionIndex + 1}: {section.sectionName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(section.timeSpent)}
                            </span>
                            <span>
                              Score: {section.score}/{section.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getGradeColor(sectionPercentage)}`}>
                            {sectionPercentage}%
                          </div>
                          <div className={`text-sm font-medium ${getGradeColor(sectionPercentage)}`}>
                            {getGradeLetter(sectionPercentage)}
                          </div>
                        </div>
                      </div>
                      <Progress value={sectionPercentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Test Information */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Test Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600 capitalize">{results.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span>{new Date(results.startedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span>{new Date(results.completedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span>{results.sections.reduce((sum: number, s: any) => sum + (s.maxScore || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sections Completed:</span>
                      <span>{results.sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score:</span>
                      <span>{results.percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/student/assessment')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default TestResults;