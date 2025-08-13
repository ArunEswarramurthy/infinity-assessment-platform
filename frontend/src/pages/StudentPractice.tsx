import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface PracticeSection {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  subtitles: PracticeSubtitle[];
}

interface PracticeSubtitle {
  id: number;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
  sectionId: number;
  topics: PracticeTopic[];
}

interface PracticeTopic {
  id: number;
  name: string;
  type: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  subtitleId: number;
}

const StudentPractice = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [sections, setSections] = useState<PracticeSection[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/practice/sections");
        setSections(response.data.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error("Failed to load practice sections");
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  const handleToggle = (id: number) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handlePractice = async (sectionId: number, topicId: number, topicName: string) => {
    try {
      setLoading(true);
      navigate(`/student/mcq-test/${topicId}`);
    } catch (error) {
      console.error("Error starting practice:", error);
      toast.error("Failed to start practice session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Student Practice Section</h1>
              <p className="text-purple-100 mt-2">Enhance your skills with interactive practice sessions and coding challenges</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 bg-white/20 text-white border-white/30">
                {sections.length} Sections
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Sections</p>
                  <p className="text-2xl font-bold text-purple-600">{sections.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Topics</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {sections.reduce((total, section) => 
                      total + (section.subtitles?.reduce((subTotal, sub) => 
                        subTotal + (sub.topics?.length || 0), 0) || 0), 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Practice Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && sections.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            <p className="ml-4 text-gray-600">Loading practice sections...</p>
          </div>
        ) : sections.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practice Sections Available</h3>
              <p className="text-gray-500 mb-4">Practice sections will appear here once they are created by your instructors</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <Card
              key={section.id}
              className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {section.subtitles?.length || 0} subtitles
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      Practice questions and coding challenges
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        {section.subtitles?.length || 0} Categories
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {section.subtitles?.reduce((total, sub) => total + (sub.topics?.length || 0), 0) || 0} Topics
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Available Now
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {section.subtitles?.slice(0, 3).map((sub, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          📚 {sub.subtitle}
                        </Badge>
                      ))}
                      {section.subtitles?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{section.subtitles.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(section.id)}
                    >
                      {expandedSection === section.id ? 'Hide' : 'Practice'}
                    </Button>
                  </div>
                </div>
                
                {expandedSection === section.id && (
                  <div className="mt-6 pt-6 border-t">
                    {section.subtitles.map((subtitle) => (
                      <div key={subtitle.id} className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">{subtitle.subtitle}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {subtitle.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded border hover:bg-white hover:shadow-sm transition-all"
                            >
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-2">{topic.name}</h5>
                                <Button
                                  size="sm"
                                  onClick={() => handlePractice(section.id, topic.id, topic.name)}
                                  disabled={loading}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {loading ? "Loading..." : "Start Practice"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentPractice;