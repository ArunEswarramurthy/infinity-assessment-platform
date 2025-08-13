import React, { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

interface TestCountdownProps {
  testId: string;
  testName: string;
  onComplete?: () => void;
}

const TestCountdown: React.FC<TestCountdownProps> = ({ testId, testName, onComplete }) => {
  const [countdown, setCountdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/test-timer/countdown/${testId}`);
        if (response.data.success) {
          setCountdown(response.data.countdown);
        }
      } catch (error) {
        console.error('Error fetching countdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountdown();
    const interval = setInterval(fetchCountdown, 1000); // Update every second

    return () => clearInterval(interval);
  }, [testId]);

  useEffect(() => {
    if (countdown?.isCompleted && onComplete) {
      onComplete();
    }
  }, [countdown?.isCompleted, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!countdown) {
    return null;
  }

  if (countdown.isCompleted) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Timer className="w-3 h-3 mr-1" />
        Reports Available
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        {countdown.formattedTime}
      </Badge>
      <span className="text-xs text-gray-500">
        Reports in {countdown.minutesRemaining}m
      </span>
    </div>
  );
};

export default TestCountdown;