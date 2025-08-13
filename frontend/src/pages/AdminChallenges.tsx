
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Code, Plus, Edit, Trash2, Search, Filter, Play, Square } from "lucide-react";
import { useState } from "react";

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "Two Sum Problem",
      difficulty: "Easy",
      languages: ["Python", "Java", "C++"],
      status: "Active",
      submissions: 45,
      passRate: 78
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      languages: ["Python", "C++"],
      status: "Active",
      submissions: 32,
      passRate: 65
    },
    {
      id: 3,
      title: "Dynamic Programming - Coins",
      difficulty: "Hard",
      languages: ["Python", "Java"],
      status: "Inactive",
      submissions: 18,
      passRate: 42
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    languages: [],
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    testCases: ""
  });

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800"
  };

  const handleCreateChallenge = () => {
    const challenge = {
      id: challenges.length + 1,
      title: newChallenge.title,
      difficulty: newChallenge.difficulty,
      languages: newChallenge.languages,
      status: "Active",
      submissions: 0,
      passRate: 0
    };
    setChallenges([...challenges, challenge]);
    setIsCreateOpen(false);
    setNewChallenge({
      title: "",
      description: "",
      difficulty: "Easy",
      languages: [],
      inputFormat: "",
      outputFormat: "",
      sampleInput: "",
      sampleOutput: "",
      testCases: ""
    });
  };

  const toggleLanguage = (language) => {
    const languages = newChallenge.languages.includes(language)
      ? newChallenge.languages.filter(l => l !== language)
      : [...newChallenge.languages, language];
    setNewChallenge({ ...newChallenge, languages });
  };

  const toggleStatus = (id) => {
    setChallenges(challenges.map(c => 
      c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Code Challenges</h1>
            <p className="text-gray-600">Manage coding problems and assignments</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Code Challenge</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="problem">Problem Details</TabsTrigger>
                  <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Problem Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="Enter problem title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newChallenge.difficulty}
                      onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Supported Languages</label>
                    <div className="flex gap-2">
                      {["Python", "Java", "C++"].map(lang => (
                        <Button
                          key={lang}
                          type="button"
                          variant={newChallenge.languages.includes(lang) ? "default" : "outline"}
                          onClick={() => toggleLanguage(lang)}
                          className="text-sm"
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="problem" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Problem Description</label>
                    <Textarea
                      className="min-h-[120px]"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Write the problem statement here..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Input Format</label>
                      <Textarea
                        value={newChallenge.inputFormat}
                        onChange={(e) => setNewChallenge({ ...newChallenge, inputFormat: e.target.value })}
                        placeholder="Describe input format"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Output Format</label>
                      <Textarea
                        value={newChallenge.outputFormat}
                        onChange={(e) => setNewChallenge({ ...newChallenge, outputFormat: e.target.value })}
                        placeholder="Describe output format"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Sample Input</label>
                      <Textarea
                        value={newChallenge.sampleInput}
                        onChange={(e) => setNewChallenge({ ...newChallenge, sampleInput: e.target.value })}
                        placeholder="Sample input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sample Output</label>
                      <Textarea
                        value={newChallenge.sampleOutput}
                        onChange={(e) => setNewChallenge({ ...newChallenge, sampleOutput: e.target.value })}
                        placeholder="Expected output"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="testcases" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Cases (JSON Format)</label>
                    <Textarea
                      className="min-h-[200px] font-mono text-sm"
                      value={newChallenge.testCases}
                      onChange={(e) => setNewChallenge({ ...newChallenge, testCases: e.target.value })}
                      placeholder={`[
  {
    "input": "test input 1",
    "output": "expected output 1"
  },
  {
    "input": "test input 2", 
    "output": "expected output 2"
  }
]`}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChallenge} className="bg-green-600 hover:bg-green-700">
                      Create Challenge
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              All Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.map((challenge) => (
                  <TableRow key={challenge.id}>
                    <TableCell className="font-medium">{challenge.title}</TableCell>
                    <TableCell>
                      <Badge className={difficultyColors[challenge.difficulty]}>
                        {challenge.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {challenge.languages.map(lang => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(challenge.id)}
                        className="flex items-center gap-1"
                      >
                        {challenge.status === "Active" ? (
                          <>
                            <Play className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Inactive</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{challenge.submissions}</TableCell>
                    <TableCell>{challenge.passRate}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminChallenges;
