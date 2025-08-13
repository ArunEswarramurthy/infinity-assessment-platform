import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, FileText, Play, Pause, Square, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
//
interface Test {
  id: string;
  name: string;
  description: string;
  testDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'paused';
  sections: number;
  totalStudents: number;
  completedStudents: number;
  createdAt: string;
}

const AssessmentCenter = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockTests: Test[] = [
        {
          id: '1',
          name: 'Programming Fundamentals Test',
          description: 'Basic programming concepts and problem solving',
          testDate: '2024-01-15',
          startTime: '10:00',
          endTime: '12:00',
          status: 'scheduled',
          sections: 3,
          totalStudents: 25,
          completedStudents: 0,
          createdAt: '2024-01-10'
        },
        {
          id: '2',
          name: 'Data Structures Quiz',
          description: 'Arrays, linked lists, stacks, and queues',
          testDate: '2024-01-12',
          startTime: '14:00',
          endTime: '15:30',
          status: 'active',
          sections: 2,
          totalStudents: 30,
          completedStudents: 12,
          createdAt: '2024-01-08'
        }
      ];
      setTests(mockTests);
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAction = async (testId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      // API call would go here
      toast.success(`Test ${action}ed successfully`);
      fetchTests();
    } catch (error) {
      toast.error(`Failed to ${action} test`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
//tha
  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Assessment Center</h1>
              <p className="text-purple-100">Monitor and manage all your tests</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading tests...</div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-500">Create your first test to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDateTime(test.testDate, test.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{test.startTime} - {test.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>{test.sections} sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{test.completedStudents}/{test.totalStudents} completed</span>
                    </div>
                  </div>

                  {test.status === 'active' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Test in Progress</span>
                        <div className="w-32 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(test.completedStudents / test.totalStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {test.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleTestAction(test.id, 'start')}
                        className="gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Start Test
                      </Button>
                    )}
                    
                    {test.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestAction(test.id, 'pause')}
                          className="gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleTestAction(test.id, 'stop')}
                          className="gap-1"
                        >
                          <Square className="w-3 h-3" />
                          Stop
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AssessmentCenter;