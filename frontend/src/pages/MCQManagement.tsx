
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MCQManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle edit question
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowEditDialog(true);
  };

  // Handle update question
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Question updated successfully" });
        setShowEditDialog(false);
        fetchQuestions();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update question", variant: "destructive" });
    }
  };

  // Handle delete question
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: "Success", description: "Question deleted successfully" });
        fetchQuestions();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.Section?.Test?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading questions...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MCQ Management</h1>
            <p className="text-gray-600">Create and manage multiple choice questions</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.filter(q => q.Section?.Test).length}</div>
              <div className="text-sm text-gray-600">Test Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{questions.filter(q => q.Section?.type === 'MCQ').length}</div>
              <div className="text-sm text-gray-600">MCQ Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{new Set(questions.map(q => q.Section?.Test?.testId)).size}</div>
              <div className="text-sm text-gray-600">Tests</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search questions by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{question.questionText}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Test: {question.Section?.Test?.name || 'N/A'}</span>
                        <span>•</span>
                        <span>Section: {question.Section?.name || 'N/A'}</span>
                        <span>•</span>
                        <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {question.Section?.type || 'MCQ'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(question)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(question.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <strong>Options:</strong> A) {question.optionA} | B) {question.optionB} | C) {question.optionC} | D) {question.optionD}<br/>
                    <strong>Correct:</strong> {question.correctOptionLetter}) {question.correctOption}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Question Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({...editingQuestion, questionText: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Option A</Label>
                    <Input
                      value={editingQuestion.optionA}
                      onChange={(e) => setEditingQuestion({...editingQuestion, optionA: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Option B</Label>
                    <Input
                      value={editingQuestion.optionB}
                      onChange={(e) => setEditingQuestion({...editingQuestion, optionB: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Option C</Label>
                    <Input
                      value={editingQuestion.optionC || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, optionC: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Option D</Label>
                    <Input
                      value={editingQuestion.optionD || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, optionD: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <Input
                    value={editingQuestion.correctOption}
                    onChange={(e) => setEditingQuestion({...editingQuestion, correctOption: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                  <Button type="submit">Update Question</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MCQManagement;
