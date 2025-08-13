
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, CheckCircle, Clock, Trophy, Zap, Target, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentChallenges = () => {
  const navigate = useNavigate();

  const availableChallenges = [
    {
      id: 1,
      title: "Two Sum Problem",
      description: "Find two numbers in an array that add up to a target sum",
      difficulty: "Easy",
      points: 50,
      timeLimit: "30 min",
      languages: ["Python", "Java", "C++"],
      status: "Available",
      attempts: 0,
      successRate: 78
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      description: "Implement different tree traversal algorithms",
      difficulty: "Medium",
      points: 100,
      timeLimit: "60 min",
      languages: ["Python", "C++", "Java"],
      status: "In Progress",
      attempts: 2,
      successRate: 65
    },
    {
      id: 3,
      title: "Dynamic Programming - Fibonacci",
      description: "Optimize fibonacci sequence calculation using DP",
      difficulty: "Medium",
      points: 120,
      timeLimit: "45 min",
      languages: ["Python", "Java"],
      status: "Available",
      attempts: 0,
      successRate: 58
    }
  ];

  const completedChallenges = [
    {
      id: 4,
      title: "Array Reversal",
      description: "Reverse an array in-place using optimal algorithm",
      difficulty: "Easy",
      points: 30,
      timeLimit: "15 min",
      languages: ["Python", "C++"],
      status: "Passed",
      attempts: 1,
      score: 85,
      completedAt: "2 days ago"
    },
    {
      id: 5,
      title: "String Palindrome",
      description: "Check if a string is a palindrome ignoring spaces and case",
      difficulty: "Easy",
      points: 40,
      timeLimit: "20 min", 
      languages: ["Python", "Java"],
      status: "Passed",
      attempts: 3,
      score: 92,
      completedAt: "1 week ago"
    },
    {
      id: 6,
      title: "Linked List Cycle",
      description: "Detect if a linked list has a cycle using Floyd's algorithm",
      difficulty: "Medium",
      points: 80,
      timeLimit: "40 min",
      languages: ["C++", "Java"],
      status: "Failed",
      attempts: 2,
      score: 45,
      completedAt: "3 days ago"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      case "Passed":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Passed":
        return <CheckCircle className="w-4 h-4" />;
      case "Failed":
        return <Target className="w-4 h-4" />;
      case "In Progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const totalPoints = completedChallenges
    .filter(c => c.status === "Passed")
    .reduce((sum, c) => sum + c.points, 0);

  const totalSolved = completedChallenges.filter(c => c.status === "Passed").length;

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Code Challenges</h1>
              <p className="text-purple-100">Sharpen your programming skills with real-world problems</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-xl font-bold">{totalPoints}</span>
                <span className="text-purple-200">XP</span>
              </div>
              <div className="text-sm text-purple-200">{totalSolved} challenges solved</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Code className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{availableChallenges.length}</div>
              <div className="text-xs text-gray-600">Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{availableChallenges.filter(c => c.status === "In Progress").length}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{totalSolved}</div>
              <div className="text-xs text-gray-600">Solved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{totalPoints}</div>
              <div className="text-xs text-gray-600">Total XP</div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Navigation */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Available Challenges ({availableChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              My Submissions ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Challenges */}
          <TabsContent value="available" className="space-y-4 mt-6">
            {availableChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        {challenge.status !== "Available" && (
                          <Badge className={getStatusColor(challenge.status)}>
                            {getStatusIcon(challenge.status)}
                            <span className="ml-1">{challenge.status}</span>
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{challenge.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Trophy className="w-4 h-4" />
                          {challenge.points} XP
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {challenge.timeLimit}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4" />
                          {challenge.successRate}% pass rate
                        </div>
                        {challenge.attempts > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Zap className="w-4 h-4" />
                            {challenge.attempts} attempts
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {challenge.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <Button 
                        onClick={() => navigate(`/student/challenge/${challenge.id}`)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {challenge.status === "In Progress" ? "Continue" : "Solve Now"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Completed Challenges */}
          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                challenge.status === "Passed" ? "border-l-green-500" : "border-l-red-500"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge className={getStatusColor(challenge.status)}>
                          {getStatusIcon(challenge.status)}
                          <span className="ml-1">{challenge.status}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{challenge.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Trophy className="w-4 h-4" />
                          {challenge.points} XP
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {challenge.timeLimit}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="w-4 h-4" />
                          {challenge.attempts} attempts
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-medium ${
                          challenge.status === "Passed" ? "text-green-600" : "text-red-600"
                        }`}>
                          <Star className="w-4 h-4" />
                          {challenge.score}% score
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4" />
                          {challenge.completedAt}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {challenge.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Solution
                      </Button>
                      {challenge.status === "Failed" && (
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/student/challenge/${challenge.id}`)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default StudentChallenges;
