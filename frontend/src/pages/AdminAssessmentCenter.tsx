import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Eye, Calendar, Clock, Users, Timer, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";



interface Test {
  testId: string;
  name: string;
  description: string;
  testDuration?: number;
  status?: string;
  testDate?: string;
  startTime?: string;
  windowTime?: number;
  createdAt: string;
  Sections: Section[];
}


interface Section {
  id: number;
  name: string;
  duration: number;
  type: string;
  MCQs?: any[];
}

const AdminAssessmentCenter = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({
    testDate: "",
    startTime: "",
    windowTime: "",
    departments: [] as string[]
  });
  const { toast } = useToast();

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test');
      if (response.ok) {
        const data = await response.json();
        setTests(data.map((test: any) => ({
          ...test,
          status: test.status || 'draft'
        })));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/test/${testId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test deleted successfully"
        });
        fetchTests();
      } else {
        throw new Error('Failed to delete test');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  const handleAssignTests = async () => {
    if (!assignData.testDate || !assignData.startTime) {
      toast({
        title: "Error",
        description: "Please fill in test date and start time",
        variant: "destructive",
      });
      return;
    }

    if (assignData.departments.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    try {
      const promises = selectedTests.map(testId => 
        fetch(`http://localhost:5000/api/test/${testId}/assign`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testDate: assignData.testDate,
            startTime: assignData.startTime,
            windowTime: parseInt(assignData.windowTime) || 180,
            departments: assignData.departments,
            status: 'scheduled'
          })
        })
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `${selectedTests.length} test(s) assigned successfully`
      });
     
      setSelectedTests([]);
      setAssignData({ testDate: "", startTime: "", windowTime: "", departments: [] });
      setShowAssignModal(false);
      fetchTests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign tests",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuestions = tests.reduce((total, test) => 
    total + test.Sections.reduce((sectionTotal, section) => 
      sectionTotal + (section.MCQs?.length || 0), 0), 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading tests...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">📋 Assessment Center</h1>
          <p className="text-purple-100">Monitor and manage all your tests in this page</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{tests.length}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{tests.filter(t => t.testDate).length}</div>
              <div className="text-sm text-gray-600">Scheduled Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{tests.reduce((total, test) => total + test.Sections.length, 0)}</div>
              <div className="text-sm text-gray-600">Total Sections</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tests by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment Button */}
        {selectedTests.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedTests.length} test(s) selected for assignment
                  </p>
                  <p className="text-sm text-blue-700">
                    Set schedule and assign to departments
                  </p>
                </div>
                <Button 
                  onClick={() => setShowAssignModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule & Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tests List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tests ({filteredTests.length})</CardTitle>
          </CardHeader>
          
          <CardContent>
            {filteredTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <div key={test.testId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.testId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTests(prev => [...prev, test.testId]);
                              } else {
                                setSelectedTests(prev => prev.filter(id => id !== test.testId));
                              }
                            }}
                            disabled={test.status === 'scheduled'}
                            className="rounded border-gray-300"
                          />
                          <h3 className="text-xl font-semibold text-gray-900">{test.name}</h3>
                          <Badge variant="outline" className="text-xs">{test.testId}</Badge>
                          <Badge 
                            variant={
                              test.status === 'scheduled' ? 'default' : 
                              test.status === 'saved' ? 'secondary' : 'outline'
                            } 
                            className="text-xs"
                          >
                            {test.status === 'scheduled' ? 'Scheduled' : 
                             test.status === 'saved' ? 'Saved' : 'Draft'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{test.description}</p>
                        
                        {test.status === 'scheduled' && test.testDate && (
                          <div className="mb-3 p-2 bg-green-50 rounded text-sm">
                            <div className="flex items-center gap-4 text-green-700">
                              <span>📅 {new Date(test.testDate).toLocaleDateString()}</span>
                              <span>🕐 {test.startTime}</span>
                              <span>⏱️ {test.windowTime} min window</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          {test.Sections.map((section, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {section.type === "MCQ" ? "📝" : "💻"} {section.name} ({section.MCQs?.length || 0} questions)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="ml-6 flex items-center gap-2">
                        {test.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `/admin/create-test?edit=${test.testId}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(test.testId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      Created: {new Date(test.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule & Assign Tests ({selectedTests.length} selected)
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Selected Tests Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Selected Tests:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTests.map(testId => {
                    const test = tests.find(t => t.testId === testId);
                    return (
                      <Badge key={testId} variant="secondary" className="text-xs">
                        {test?.name || testId}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    📅 Test Date *
                  </label>
                  <Input
                    type="date"
                    value={assignData.testDate}
                    onChange={(e) => setAssignData(prev => ({ ...prev, testDate: e.target.value }))}
                    className="w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    ⏰ Start Time *
                  </label>
                  <Input
                    type="time"
                    value={assignData.startTime}
                    onChange={(e) => setAssignData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    ⌛ Window Time (minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="180"
                    value={assignData.windowTime}
                    onChange={(e) => setAssignData(prev => ({ ...prev, windowTime: e.target.value }))}
                    className="w-full"
                    min="30"
                    max="480"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 180 minutes</p>
                </div>
              </div>
              
              {/* Department Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  🏢 Assign to Departments *
                </label>
                <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50">
                  {/* All Departments Option */}
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="assign-ALL"
                        checked={assignData.departments.includes("ALL")}
                        onChange={(e) => {
                          setAssignData(prev => ({ 
                            ...prev, 
                            departments: e.target.checked ? ["ALL"] : [] 
                          }));
                        }}
                        className="rounded border-gray-300 text-purple-600"
                      />
                      <label htmlFor="assign-ALL" className="text-sm cursor-pointer font-medium text-purple-700">
                        🌐 All Departments
                      </label>
                    </div>
                  </div>
                  
                  {/* Department Groups */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Computer Science",
                        icon: "💻",
                        color: "blue",
                        departments: [
                          { value: "CSE1", label: "First Year" },
                          { value: "CSE2", label: "Second Year" },
                          { value: "CSE3", label: "Third Year" },
                          { value: "CSE4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Information Technology",
                        icon: "🖥️",
                        color: "green",
                        departments: [
                          { value: "IT1", label: "First Year" },
                          { value: "IT2", label: "Second Year" },
                          { value: "IT3", label: "Third Year" },
                          { value: "IT4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Electronics & Communication",
                        icon: "⚡",
                        color: "yellow",
                        departments: [
                          { value: "ECE1", label: "First Year" },
                          { value: "ECE2", label: "Second Year" },
                          { value: "ECE3", label: "Third Year" },
                          { value: "ECE4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "AI & Data Science",
                        icon: "🤖",
                        color: "indigo",
                        departments: [
                          { value: "AIDS1", label: "First Year" },
                          { value: "AIDS2", label: "Second Year" },
                          { value: "AIDS3", label: "Third Year" },
                          { value: "AIDS4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Mechanical Engineering",
                        icon: "⚙️",
                        color: "gray",
                        departments: [
                          { value: "MECH1", label: "First Year" },
                          { value: "MECH2", label: "Second Year" },
                          { value: "MECH3", label: "Third Year" },
                          { value: "MECH4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Cyber Security Engineering",
                        icon: "🔒",
                        color: "red",
                        departments: [
                          { value: "CYBER1", label: "First Year" },
                          { value: "CYBER2", label: "Second Year" },
                          { value: "CYBER3", label: "Third Year" },
                          { value: "CYBER4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Biomedical Engineering",
                        icon: "🏥",
                        color: "pink",
                        departments: [
                          { value: "BME1", label: "First Year" },
                          { value: "BME2", label: "Second Year" },
                          { value: "BME3", label: "Third Year" },
                          { value: "BME4", label: "Fourth Year" }
                        ]
                      },
                      {
                        name: "Agriculture Engineering",
                        icon: "🌾",
                        color: "green",
                        departments: [
                          { value: "AGR1", label: "First Year" },
                          { value: "AGR2", label: "Second Year" },
                          { value: "AGR3", label: "Third Year" },
                          { value: "AGR4", label: "Fourth Year" }
                        ]
                      }
                    ].map((group) => (
                      <div key={group.name} className={`p-3 bg-${group.color}-50 rounded-lg border border-${group.color}-200`}>
                        <h4 className={`font-medium text-${group.color}-800 mb-2 flex items-center gap-2`}>
                          <span>{group.icon}</span>
                          {group.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {group.departments.map((dept) => (
                            <div key={dept.value} className="flex items-center space-x-2 hover:bg-white p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                id={`assign-${dept.value}`}
                                checked={assignData.departments.includes(dept.value)}
                                onChange={(e) => {
                                  const newDepts = e.target.checked
                                    ? [...assignData.departments.filter(d => d !== "ALL"), dept.value]
                                    : assignData.departments.filter(d => d !== dept.value);
                                  setAssignData(prev => ({ ...prev, departments: newDepts }));
                                }}
                                className={`rounded border-gray-300 text-${group.color}-600`}
                              />
                              <label
                                htmlFor={`assign-${dept.value}`}
                                className={`text-sm cursor-pointer flex-1 text-${group.color}-700 ${assignData.departments.includes(dept.value) ? 'font-medium' : ''}`}
                              >
                                {dept.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {assignData.departments.length} department(s)
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignData({ testDate: "", startTime: "", windowTime: "", departments: [] });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTests} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!assignData.testDate || !assignData.startTime || assignData.departments.length === 0}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign {selectedTests.length} Test(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAssessmentCenter;



// /*{ <CardContent className="flex justify-between items-center">{/* Scheduling Fields */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
//                           <div>
//                             <label className="text-sm font-medium text-gray-700">Test Date</label>
//                             <Input
//                               type="date"
//                               value={test.testDate || ''}
//                               onChange={(e) => handleTestUpdate(test.testId, 'testDate', e.target.value)}
//                               className="mt-1"
//                             />
//                           </div>
//                           <div>
//                             <label className="text-sm font-medium text-gray-700">Start Time</label>
//                             <Input
//                               type="time"
//                               value={test.startTime || ''}
//                               onChange={(e) => handleTestUpdate(test.testId, 'startTime', e.target.value)}
//                               className="mt-1"
//                             />
//                           </div>
//                           <div>
//                             <label className="text-sm font-medium text-gray-700">Window Time (minutes)</label>
//                             <Input
//                               type="number"
//                               placeholder="180"
//                               value={test.windowTime || ''}
//                               onChange={(e) => handleTestUpdate(test.testId, 'windowTime', e.target.value)}
//                               className="mt-1"
//                             />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <Timer className="w-4 h-4" />
//                             {test.testDuration || test.Sections.reduce((total, s) => total + s.duration, 0)} minutes
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <Calendar className="w-4 h-4" />
//                             {test.testDate ? new Date(test.testDate).toLocaleDateString() : 'Not scheduled'}
//                           </div>

//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <Clock className="w-4 h-4" />
//                             {test.startTime || 'No time set'}
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <span>Window: {test.windowTime || 180} minutes</span>
//                           </div>
//                         </div>
// </CardContent> }