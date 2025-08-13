
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Code, BookOpen, Download, Calendar, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const AdminAnalytics = () => {
  const submissionData = [
    { date: "Jan", mcq: 120, code: 85 },
    { date: "Feb", mcq: 150, code: 95 },
    { date: "Mar", mcq: 180, code: 110 },
    { date: "Apr", mcq: 200, code: 125 },
    { date: "May", mcq: 240, code: 140 },
    { date: "Jun", mcq: 280, code: 160 }
  ];

  const languageData = [
    { name: "Python", value: 45, color: "#3B82F6" },
    { name: "Java", value: 30, color: "#EF4444" },
    { name: "C++", value: 20, color: "#10B981" },
    { name: "JavaScript", value: 5, color: "#F59E0B" }
  ];

  const topStudents = [
    { name: "Alice Johnson", score: 95 },
    { name: "Bob Smith", score: 92 },
    { name: "Carol Davis", score: 89 },
    { name: "David Wilson", score: 87 },
    { name: "Eva Brown", score: 85 }
  ];

  const kpiData = [
    {
      title: "Total MCQ Tests",
      value: "1,247",
      change: "+12%",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Code Submissions",
      value: "856",
      change: "+8%",
      icon: Code,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Average Score",
      value: "82.4%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pass Rate",
      value: "76.8%",
      change: "+5%",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Platform performance insights and metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <p className={`text-sm ${kpi.color} mt-1`}>{kpi.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Submissions Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="mcq" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="MCQ Tests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="code" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Code Challenges"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Language Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Programming Language Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {languageData.map((lang, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-sm">{lang.name} ({lang.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Students */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Performing Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topStudents} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      High server load detected during peak hours
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Daily backup completed successfully
                    </p>
                    <p className="text-xs text-green-600 mt-1">6 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      New batch of students registered
                    </p>
                    <p className="text-xs text-blue-600 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20">
                <div className="text-center">
                  <Download className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm">Student Reports</div>
                  <div className="text-xs text-gray-500">CSV Format</div>
                </div>
              </Button>
              <Button variant="outline" className="h-20">
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm">Performance Analytics</div>
                  <div className="text-xs text-gray-500">PDF Format</div>
                </div>
              </Button>
              <Button variant="outline" className="h-20">
                <div className="text-center">
                  <Code className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm">Submission Data</div>
                  <div className="text-xs text-gray-500">JSON Format</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
