import { useState, useEffect } from 'react';
import { CheckCircle, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

const StudentTestNotification = () => {
  const { user } = useAuth();
  const [newCompletion, setNewCompletion] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const checkForNewCompletions = async () => {
    if (!user?.id) return;
    
    try {
      // Check localStorage for immediate completion notification
      const lastCompletedTest = localStorage.getItem('lastCompletedTest');
      if (lastCompletedTest) {
        const completionData = JSON.parse(lastCompletedTest);
        const completionTime = new Date(completionData.completedAt);
        
        if (completionTime > lastChecked) {
          setNewCompletion({
            testName: `Test ${completionData.testId}`,
            totalScore: completionData.score,
            maxScore: completionData.maxScore,
            completedAt: completionData.completedAt
          });
          setIsVisible(true);
          setLastChecked(new Date());
          localStorage.removeItem('lastCompletedTest');
          return;
        }
      }
      
      // Fallback: Check API for recent completions
      const response = await axios.get(`${API_BASE_URL}/api/student/test-history/${user.id}`);
      if (response.data.success) {
        const history = response.data.data;
        
        // Find the most recent completed test
        const recentCompletion = history
          .filter((test: any) => test.status === 'completed')
          .sort((a: any, b: any) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())[0];
        
        if (recentCompletion && new Date(recentCompletion.completedAt || recentCompletion.createdAt) > lastChecked) {
          setNewCompletion(recentCompletion);
          setIsVisible(true);
          setLastChecked(new Date());
        }
      }
    } catch (error) {
      console.error('Error checking for new completions:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Check immediately on mount
      checkForNewCompletions();
      
      // Then check for new completions every 10 seconds
      const interval = setInterval(checkForNewCompletions, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id, lastChecked]);

  const dismissNotification = () => {
    setIsVisible(false);
    setNewCompletion(null);
  };

  const viewReports = () => {
    window.location.href = '/student/reports';
  };

  if (!isVisible || !newCompletion) {
    return null;
  }

  const percentage = Math.round(((newCompletion.totalScore || newCompletion.score || 0) / (newCompletion.maxScore || 100)) * 100);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-green-200 bg-green-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Test Completed!</h4>
                <p className="text-sm text-green-700">{newCompletion.testName || newCompletion.name}</p>
                <p className="text-xs text-green-600 font-medium">
                  Score: {newCompletion.totalScore || newCompletion.score || 0}/{newCompletion.maxScore || 100} ({percentage}%)
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
          
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={viewReports}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileText className="w-3 h-3 mr-1" />
              View Reports
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={dismissNotification}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTestNotification;