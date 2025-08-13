import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, FileText, Upload, BookOpen, Download, Calendar } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const AdminPractice = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSectionFormVisible, setNewSectionFormVisible] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    departments: [] as string[],
    subtitles: [] as {
      subtitle: string;
      topics: { name: string; type: string; file: File | null }[];
    }[],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/practice/sections");
      setSections(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast({
        title: "Error",
        description: "Failed to load sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/practice/section/${sectionId}`);
      setSections(sections.filter((s) => s.id !== sectionId));
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtitle = () => {
    setNewSection((prev) => ({
      ...prev,
      subtitles: [
        ...prev.subtitles,
        { subtitle: "", topics: [{ name: "", type: "", file: null }] },
      ],
    }));
  };

  const handleSubtitleChange = (index: number, value: string) => {
    const updated = [...newSection.subtitles];
    updated[index].subtitle = value;
    setNewSection((prev) => ({ ...prev, subtitles: updated }));
  };

  const handleTopicChange = (
    subtitleIndex: number,
    topicIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...newSection.subtitles];
    updated[subtitleIndex].topics[topicIndex][field] = value;
    setNewSection((prev) => ({ ...prev, subtitles: updated }));
  };

  const handleAddTopic = (subtitleIndex: number) => {
    const updated = [...newSection.subtitles];
    updated[subtitleIndex].topics.push({ name: "", type: "", file: null });
    setNewSection((prev) => ({ ...prev, subtitles: updated }));
  };

  const handleSubmitNewSection = async () => {
    const { title, subtitles } = newSection;

    if (!title || subtitles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);

      const cleanSubtitles = subtitles.map(sub => ({
        subtitle: sub.subtitle,
        topics: sub.topics.map(topic => ({
          name: topic.name,
          type: topic.type
        }))
      }));

      formData.append("subtitles", JSON.stringify(cleanSubtitles));

      subtitles.forEach(sub => {
        sub.topics.forEach(topic => {
          if (topic.file) {
            formData.append("files", topic.file);
          }
        });
      });

      const response = await axios.post(
        "http://localhost:5000/api/practice/section",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSections(prev => [...prev, response.data.data]);
      setNewSectionFormVisible(false);
      setNewSection({ title: "", departments: [], subtitles: [] });
      toast({
        title: "Success",
        description: "Section created successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create section",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Practice Section
          </h1>
          <Button
            onClick={() => setNewSectionFormVisible(true)}
            disabled={loading}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Section
          </Button>
        </div>

        {newSectionFormVisible && (
          <div className="rounded-xl border p-6 bg-white shadow-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Create New Practice Section
            </h2>
            <input
              type="text"
              placeholder="Section Title"
              className="w-full border rounded-md p-2"
              value={newSection.title}
              onChange={(e) =>
                setNewSection((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            {/* Department Dropdown with Checkboxes */}
            <div className="mt-4">
              <label className="text-base font-medium text-gray-700">Scheduled to</label>
              <div className="relative mt-1">
                <button
                  type="button"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => {
                    const dropdown = document.getElementById('practice-dropdown');
                    dropdown?.classList.toggle('hidden');
                  }}
                >
                  <span className="text-sm text-gray-700">
                    {newSection.departments?.length > 0 
                      ? newSection.departments.includes('ALL') 
                        ? 'All Departments'
                        : `${newSection.departments.length} department(s) selected`
                      : 'Select departments'
                    }
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                <div
                  id="practice-dropdown"
                  className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  <div className="p-2 space-y-2">
                    {[
                      { value: "ALL", label: "All Departments" },
                      { value: "CSE1", label: "Computer Science - I (CSE)" },
                      { value: "CSE2", label: "Computer Science - II (CSE)" },
                      { value: "CSE3", label: "Computer Science - III (CSE)" },
                      { value: "CSE4", label: "Computer Science - IV (CSE)" },
                      { value: "IT1", label: "Information Technology - I (IT)" },
                      { value: "IT2", label: "Information Technology - II (IT)" },
                      { value: "IT3", label: "Information Technology - III (IT)" },
                      { value: "IT4", label: "Information Technology - IV (IT)" },
                      { value: "ECE1", label: "Electronics (ECE) - I" },
                      { value: "ECE2", label: "Electronics (ECE) - II" },
                      { value: "ECE3", label: "Electronics (ECE) - III" },
                      { value: "ECE4", label: "Electronics (ECE) - IV" },
                      { value: "AIDS1", label: "AI & Data Science - I (AIDS)" },
                      { value: "AIDS2", label: "AI & Data Science - II (AIDS)" },
                      { value: "AIDS3", label: "AI & Data Science - III (AIDS)" },
                      { value: "AIDS4", label: "AI & Data Science - IV (AIDS)" },
                      { value: "CYBER1", label: "Cyber Security - I (CYBER)" },
                      { value: "CYBER2", label: "Cyber Security - II (CYBER)" },
                      { value: "CYBER3", label: "Cyber Security - III (CYBER)" },
                      { value: "CYBER4", label: "Cyber Security - IV (CYBER)" },
                      { value: "MECH1", label: "Mechanical - I (MECH)" },
                      { value: "MECH2", label: "Mechanical - II (MECH)" },
                      { value: "MECH3", label: "Mechanical - III (MECH)" },
                      { value: "MECH4", label: "Mechanical - IV (MECH)" }
                    ].map((dept) => (
                      <div key={dept.value} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          id={`practice-${dept.value}`}
                          checked={newSection.departments?.includes(dept.value) || false}
                          onChange={(e) => {
                            const currentDepts = newSection.departments || [];
                            const newDepts = e.target.checked
                              ? [...currentDepts, dept.value]
                              : currentDepts.filter(d => d !== dept.value);
                            setNewSection(prev => ({ ...prev, departments: newDepts }));
                          }}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`practice-${dept.value}`}
                          className="text-sm text-gray-700 cursor-pointer flex-1"
                        >
                          {dept.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {newSection.subtitles.map((sub, subIndex) => (
              <div
                key={subIndex}
                className="bg-gray-50 p-4 rounded-md space-y-4"
              >
                <input
                  type="text"
                  placeholder="Subtitle"
                  className="w-full border rounded-md p-2 text-sm"
                  value={sub.subtitle}
                  onChange={(e) =>
                    handleSubtitleChange(subIndex, e.target.value)
                  }
                />

                {sub.topics.map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <input
                      type="text"
                      placeholder="Topic Name"
                      className="border rounded-md p-2 text-sm"
                      value={topic.name}
                      onChange={(e) =>
                        handleTopicChange(
                          subIndex,
                          topicIndex,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <select
                      value={topic.type}
                      onChange={(e) =>
                        handleTopicChange(
                          subIndex,
                          topicIndex,
                          "type",
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2 text-sm"
                    >
                      <option value="">Select Type</option>
                      <option value="MCQ">MCQ</option>
                      <option value="Coding">Coding</option>
                    </select>
                    <div className="space-y-2">
                      {topic.type === "MCQ" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = 'http://localhost:5000/api/test/template/download';
                            link.download = 'question-template.xlsx';
                            link.click();
                          }}
                          className="gap-2 mb-2"
                        >
                          <FileText className="w-4 h-4" />
                          Download Template
                        </Button>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept={
                            topic.type === "MCQ" ? ".xlsx,.xls" : ".pdf,.docx"
                          }
                          onChange={(e) =>
                            handleTopicChange(
                              subIndex,
                              topicIndex,
                              "file",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          id={`file-${subIndex}-${topicIndex}`}
                        />
                        <label
                          htmlFor={`file-${subIndex}-${topicIndex}`}
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {topic.file ? topic.file.name : 'Click to upload file'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {topic.type === "MCQ" ? "Excel files (.xlsx, .xls)" : "PDF or Word files (.pdf, .docx)"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => handleAddTopic(subIndex)}
                >
                  + Add Topic
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleAddSubtitle}>
                + Add Subtitle
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewSectionFormVisible(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitNewSection} disabled={loading}>
                {loading ? "Uploading..." : "Upload Section"}
              </Button>
            </div>
          </div>
        )}

        {loading && sections.length === 0 ? (
          <div className="text-center py-8">Loading...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sections found.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <Card
                key={section.id}
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Created on {new Date(section.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="ml-6 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(section.id)}
                      >
                        {expandedSection === section.id ? 'Hide' : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {expandedSection === section.id && (
                    <div className="mt-6 pt-6 border-t">
                      {section.subtitles?.map((sub: any, subIndex: number) => (
                        <div key={subIndex} className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-3">{sub.subtitle}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sub.topics?.map((topic: any) => (
                              <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                <div>
                                  <p className="font-medium text-gray-900">{topic.name}</p>
                                  <p className="text-sm text-gray-500">Type: {topic.type}</p>
                                </div>
                                {topic.filePath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = `http://localhost:5000/api/practice/download?path=${encodeURIComponent(topic.filePath)}`;
                                      link.target = '_blank';
                                      link.click();
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPractice;