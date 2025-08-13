import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Send, 
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const TestAssignment = () => {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    testId: '',
    testDate: '',
    startTime: '',
    windowTime: 180,
    studentIds: [],
    departments: [],
    assignToAll: false
  });

  const departments = [
    'Computer Science',
    'Information Technology', 
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical'
  ];

  // Fetch available tests
  const fetchTests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tests`);
      setTests(response.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tests",
        variant: "destructive"
      });
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/licensed-users`);
      setStudents(response.data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/test-assignments/all`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchStudents();
    fetchAssignments();
  }, []);

  // Handle form submission
  const handleAssignTest = async (e) => {
    e.preventDefault();
    
    if (!assignmentForm.testId) {
      toast({
        title: "Error",
        description: "Please select a test to assign",
        variant: "destructive"
      });
      return;
    }

    if (!assignmentForm.testDate || !assignmentForm.startTime) {
      toast({
        title: "Error", 
        description: "Please set test date and time",
        variant: "destructive"
      });
      return;
    }

    if (!assignmentForm.assignToAll && 
        assignmentForm.studentIds.length === 0 && 
        assignmentForm.departments.length === 0) {
      toast({
        title: "Error",
        description: "Please select students, departments, or assign to all",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/test-assignments/${assignmentForm.testId}/assign`,
        assignmentForm
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Test assigned to ${response.data.assignedCount} students`
        });
        
        // Reset form
        setAssignmentForm({
          testId: '',
          testDate: '',
          startTime: '',
          windowTime: 180,
          studentIds: [],
          departments: [],
          assignToAll: false
        });
        
        // Refresh assignments
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error assigning test:', error);
      toast({
        title: "Error",
        description: "Failed to assign test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setAssignmentForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  // Handle department selection
  const handleDepartmentToggle = (department) => {
    setAssignmentForm(prev => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter(d => d !== department)
        : [...prev.departments, department]
    }));
  };

  // Get selected test details
  const selectedTest = tests.find(t => t.testId === assignmentForm.testId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Assignment</h1>
            <p className="text-gray-600 mt-1">Assign tests to students with scheduling</p>
          </div>
          <Button onClick={fetchAssignments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="assign" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assign">Assign New Test</TabsTrigger>
            <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
          </TabsList>

          {/* Assign New Test */}
          <TabsContent value="assign" className="space-y-6">
            <form onSubmit={handleAssignTest} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Select Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="test">Choose Test</Label>
                      <Select 
                        value={assignmentForm.testId} 
                        onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, testId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a test to assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {tests.map((test) => (
                            <SelectItem key={test.testId} value={test.testId}>
                              {test.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTest && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">{selectedTest.name}</h4>
                        <p className="text-sm text-blue-700 mb-2">{selectedTest.description}</p>
                        <div className="flex items-center gap-4 text-xs text-blue-600">
                          <span>Status: {selectedTest.status}</span>
                          <span>Sections: {selectedTest.Sections?.length || 0}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="testDate">Test Date</Label>
                        <Input
                          id="testDate"
                          type="date"
                          value={assignmentForm.testDate}
                          onChange={(e) => setAssignmentForm(prev => ({ ...prev, testDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={assignmentForm.startTime}
                          onChange={(e) => setAssignmentForm(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="windowTime">Test Window (minutes)</Label>
                      <Input
                        id="windowTime"
                        type="number"
                        value={assignmentForm.windowTime}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, windowTime: parseInt(e.target.value) }))}
                        min="60"
                        max="480"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Students can start the test within this time window
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Assign to Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assign to All Option */}
                  <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="assignToAll"
                      checked={assignmentForm.assignToAll}
                      onCheckedChange={(checked) => setAssignmentForm(prev => ({ 
                        ...prev, 
                        assignToAll: checked,
                        studentIds: checked ? [] : prev.studentIds,
                        departments: checked ? [] : prev.departments
                      }))}
                    />
                    <Label htmlFor="assignToAll" className="font-medium">
                      Assign to all students
                    </Label>
                  </div>

                  {!assignmentForm.assignToAll && (
                    <>
                      {/* Department Selection */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Select Departments</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {departments.map((dept) => (
                            <div key={dept} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dept-${dept}`}
                                checked={assignmentForm.departments.includes(dept)}
                                onCheckedChange={() => handleDepartmentToggle(dept)}
                              />
                              <Label htmlFor={`dept-${dept}`} className="text-sm">
                                {dept}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Individual Student Selection */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Select Individual Students ({assignmentForm.studentIds.length} selected)
                        </Label>
                        <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                          {students.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={assignmentForm.studentIds.includes(student.id)}
                                onCheckedChange={() => handleStudentToggle(student.id)}
                              />
                              <Label htmlFor={`student-${student.id}`} className="flex-1 text-sm">
                                {student.name} ({student.email})
                                {student.department && (
                                  <span className="text-gray-500 ml-2">- {student.department}</span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Assignment Summary */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Assignment Summary</h4>
                    <div className="text-sm text-green-700">
                      {assignmentForm.assignToAll ? (
                        <p>Test will be assigned to all students</p>
                      ) : (
                        <div>
                          <p>Departments: {assignmentForm.departments.length}</p>
                          <p>Individual students: {assignmentForm.studentIds.length}</p>
                          <p>Total estimated assignments: {
                            assignmentForm.departments.length * 10 + assignmentForm.studentIds.length
                          }</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="min-w-32">
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Assign Test
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Manage Assignments */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Test Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-500">Test assignments will appear here once created.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.test.testId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{assignment.test.name}</h3>
                            <p className="text-sm text-gray-600">Test ID: {assignment.test.testId}</p>
                          </div>
                          <Badge variant={assignment.test.status === 'scheduled' ? 'default' : 'secondary'}>
                            {assignment.test.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{assignment.totalAssigned}</div>
                            <div className="text-xs text-gray-500">Total Assigned</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{assignment.completedCount}</div>
                            <div className="text-xs text-gray-500">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{assignment.inProgressCount || 0}</div>
                            <div className="text-xs text-gray-500">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{assignment.notStartedCount || 0}</div>
                            <div className="text-xs text-gray-500">Not Started</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Average Score: {assignment.averageScore || 0}%
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TestAssignment;