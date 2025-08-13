
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Trophy, BookOpen, Code } from "lucide-react";

const StudentProfile = () => {
  const studentData = {
    name: "John Doe",
    email: "john.doe@example.com",
    studentId: "STU001",
    joinDate: "September 2023",
    totalTests: 12,
    totalChallenges: 8,
    averageScore: 85,
    completionRate: 92
  };

  const achievements = [
    { title: "First Test Completed", date: "Sep 15, 2023", icon: BookOpen },
    { title: "Code Master", date: "Oct 2, 2023", icon: Code },
    { title: "Perfect Score", date: "Oct 15, 2023", icon: Trophy },
  ];

  const recentActivity = [
    { type: "Test", title: "React Fundamentals", score: 88, date: "2 days ago" },
    { type: "Challenge", title: "Array Algorithms", status: "Completed", date: "5 days ago" },
    { type: "Test", title: "JavaScript ES6+", score: 92, date: "1 week ago" },
  ];

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{studentData.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{studentData.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {studentData.joinDate}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-2">
                  ID: {studentData.studentId}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentData.totalTests}</div>
              <div className="text-sm text-gray-600">Tests Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Code className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentData.totalChallenges}</div>
              <div className="text-sm text-gray-600">Challenges Solved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{studentData.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{studentData.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
              <Progress value={studentData.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                    <achievement.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.type} • {activity.date}</p>
                  </div>
                  <div className="text-right">
                    {activity.type === "Test" ? (
                      <Badge variant="secondary">{activity.score}%</Badge>
                    ) : (
                      <Badge variant="outline">Completed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
