import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

interface TestResult {
  id: number;
  testName: string;
  studentId: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

const TestResultNotification = () => {
  const [newResults, setNewResults] = useState<TestResult[]>([]);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);

  const checkForNewResults = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/live-activity`);
      if (response.data.success) {
        const recentSessions = response.data.data.recentSessions;
        
        // Filter sessions completed after last check
        const newCompletedSessions = recentSessions.filter((session: any) => 
          session.status === 'completed' && 
          new Date(session.completedAt) > lastChecked
        );

        if (newCompletedSessions.length > 0) {
          setNewResults(newCompletedSessions);
          setIsVisible(true);
          setLastChecked(new Date());
        }
      }
    } catch (error) {
      console.error('Error checking for new results:', error);
    }
  };

  useEffect(() => {
    // Check for new results every 15 seconds
    const interval = setInterval(checkForNewResults, 15000);
    return () => clearInterval(interval);
  }, [lastChecked]);

  const dismissNotification = () => {
    setIsVisible(false);
    setNewResults([]);
  };

  if (!isVisible || newResults.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">New Test Results!</h4>
                <p className="text-sm text-green-700">
                  {newResults.length} test{newResults.length > 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissNotification}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-3 space-y-2">
            {newResults.slice(0, 3).map((result) => (
              <div key={result.id} className="text-xs text-green-800 bg-green-100 rounded p-2">
                <div className="font-medium">{result.testName}</div>
                <div className="flex justify-between">
                  <span>Student: {result.studentId}</span>
                  <span>{result.score}/{result.maxScore}</span>
                </div>
              </div>
            ))}
            {newResults.length > 3 && (
              <div className="text-xs text-green-700 text-center">
                +{newResults.length - 3} more results
              </div>
            )}
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              Refresh Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultNotification;