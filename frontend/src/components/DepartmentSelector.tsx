import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DepartmentSelector = () => {
  const [selectedDept, setSelectedDept] = useState("");
  const [currentDept, setCurrentDept] = useState("");

  useEffect(() => {
    const dept = localStorage.getItem('studentDepartment') || '';
    setCurrentDept(dept);
    setSelectedDept(dept);
  }, []);

  const handleSave = () => {
    localStorage.setItem('studentDepartment', selectedDept);
    setCurrentDept(selectedDept);
    window.location.reload();
  };

  const departments = [
    { value: "CSE1", label: "Computer Science - I" },
    { value: "CSE2", label: "Computer Science - II" },
    { value: "CSE3", label: "Computer Science - III" },
    { value: "CSE4", label: "Computer Science - IV" },
    { value: "IT1", label: "Information Technology - I" },
    { value: "IT2", label: "Information Technology - II" },
    { value: "IT3", label: "Information Technology - III" },
    { value: "IT4", label: "Information Technology - IV" },
    { value: "ECE1", label: "Electronics - I" },
    { value: "ECE2", label: "Electronics - II" },
    { value: "ECE3", label: "Electronics - III" },
    { value: "ECE4", label: "Electronics - IV" },
    { value: "AIDS1", label: "AI & Data Science - I" },
    { value: "AIDS2", label: "AI & Data Science - II" },
    { value: "AIDS3", label: "AI & Data Science - III" },
    { value: "AIDS4", label: "AI & Data Science - IV" },
    { value: "CYBER1", label: "Cyber Security - I" },
    { value: "CYBER2", label: "Cyber Security - II" },
    { value: "CYBER3", label: "Cyber Security - III" },
    { value: "CYBER4", label: "Cyber Security - IV" },
    { value: "MECH1", label: "Mechanical - I" },
    { value: "MECH2", label: "Mechanical - II" },
    { value: "MECH3", label: "Mechanical - III" },
    { value: "MECH4", label: "Mechanical - IV" }
  ];

  if (currentDept) {
    return (
      <div className="mb-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Your Department:</p>
                <p className="font-medium text-blue-900">
                  {departments.find(d => d.value === currentDept)?.label || currentDept}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDept("")}
                className="text-blue-600 border-blue-300"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Select Your Department</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your department..." />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSave} 
          disabled={!selectedDept}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          Save Department
        </Button>
      </CardContent>
    </Card>
  );
};

export default DepartmentSelector;