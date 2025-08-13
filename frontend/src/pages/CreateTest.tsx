import React, { useState, useEffect } from 'react';
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, TestTube, Clock, FileText, Trash2, Eye, Upload, Calendar, Timer, Edit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

interface Question {
  id: string;
  questionText: string;
  questionImage?: string;
  optionA: string;
  optionAImage?: string;
  optionB: string;
  optionBImage?: string;
  optionC: string;
  optionCImage?: string;
  optionD: string;
  optionDImage?: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
}

interface SampleTestCase {
  id: string;
  input: string;
  output: string;
}

interface CodingQuestion {
  id: string;
  problemStatement: string;
  sampleTestCases: SampleTestCase[];
  allowedLanguages: string[];
  constraints: string;
  marks: number;
}

interface Section {
  id: string;
  name: string;
  duration: number;
  instructions: string;
  type: "MCQ" | "Coding";
  correctMarks: number;
  excelFile?: File | null;
  saved?: boolean;
  questions?: Question[];
  codingQuestions?: CodingQuestion[];
  currentQuestion?: {
    questionText: string;
    questionImage?: string;
    optionA: string;
    optionAImage?: string;
    optionB: string;
    optionBImage?: string;
    optionC: string;
    optionCImage?: string;
    optionD: string;
    optionDImage?: string;
    correctAnswer: string;
    explanation: string;
    marks: number;
  };
  currentCodingQuestion?: {
    problemStatement: string;
    sampleTestCases: SampleTestCase[];
    allowedLanguages: string[];
    constraints: string;
    marks: number;
  };
  showQuestionForm?: boolean;
  showCodingQuestionForm?: boolean;
}

interface Class {
  id: number;
  name: string;
  year: number;
  departmentId: number;
}



const CreateTest = () => {
  console.log('CreateTest component rendering...');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testName, setTestName] = useState("");
  const [numSections, setNumSections] = useState(1);
  const [description, setDescription] = useState("");
  const [testInstructions, setTestInstructions] = useState("");
  const [testDuration, setTestDuration] = useState("");
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testDate, setTestDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showScheduling, setShowScheduling] = useState(false);
  const [createdTestId, setCreatedTestId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "",
      duration: 30,
      instructions: "",
      type: "MCQ",
      correctMarks: 1,
      excelFile: null,
      saved: false,
      questions: [],
      codingQuestions: [],
      currentQuestion: {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        marks: 1
      },
      currentCodingQuestion: {
        problemStatement: "",
        sampleTestCases: [{ id: "1", input: "", output: "" }],
        allowedLanguages: [],
        constraints: "",
        marks: 1
      },
      showQuestionForm: false,
      showCodingQuestionForm: false
    }
  ]);
  const [openSections, setOpenSections] = useState<string[]>(["1"]);

  // Load test data if editing
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      
      if (editId) {
        setEditingTestId(editId);
        loadTestData(editId);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  const loadTestData = async (testId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/test/${testId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const testData = await response.json();
      setTestName(testData.name || "");
      setDescription(testData.description || "");
      setTestInstructions(testData.instructions || "");
      setTestDuration(testData.testDuration?.toString() || "");
      setTestDate(testData.testDate || "");
      setStartTime(testData.startTime || "");

      
      if (testData.Sections && testData.Sections.length > 0) {
        const loadedSections = testData.Sections.map((section: any, index: number) => ({
          id: (index + 1).toString(),
          name: section.name || "",
          duration: section.duration || 30,
          instructions: section.instructions || "",
          type: section.type || "MCQ",
          correctMarks: section.correctMarks || 1,
          excelFile: null,
          saved: true
        }));
        setSections(loadedSections);
        setNumSections(loadedSections.length);
        setOpenSections(loadedSections.map((_, index) => (index + 1).toString()));
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      toast({
        title: "Error",
        description: "Failed to load test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumSectionsChange = (value: string) => {
    const num = parseInt(value) || 1;
    setNumSections(num);
    
    if (num > sections.length) {
      const newSections = [...sections];
      for (let i = sections.length; i < num; i++) {
        newSections.push({
          id: (i + 1).toString(),
          name: "",
          duration: 30,
          instructions: "",
          type: "MCQ",
          correctMarks: 1,
          excelFile: null,
          saved: false,
          questions: [],
          codingQuestions: [],
          currentQuestion: {
            questionText: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            explanation: "",
            marks: 1
          },
          currentCodingQuestion: {
            problemStatement: "",
            sampleTestCases: [{ id: "1", input: "", output: "" }],
            allowedLanguages: [],
            constraints: "",
            marks: 1
          },
          showQuestionForm: false,
          showCodingQuestionForm: false
        });
      }
      setSections(newSections);
    } else if (num < sections.length) {
      setSections(sections.slice(0, num));
    }
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const updateCurrentQuestion = (sectionId: string, field: string, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId ? {
        ...section,
        currentQuestion: {
          ...section.currentQuestion!,
          [field]: value
        }
      } : section
    ));
  };

  const addQuestionToSection = (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section?.currentQuestion) return;

      const { questionText, optionA, optionB, optionC, optionD, correctAnswer } = section.currentQuestion;
      
      if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim() || !correctAnswer) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const newQuestion: Question = {
        id: Date.now().toString(),
        ...section.currentQuestion
      };

      setSections(sections.map(s => 
        s.id === sectionId ? {
          ...s,
          questions: [...(s.questions || []), newQuestion],
          currentQuestion: {
            questionText: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
            explanation: "",
            marks: 1
          }
        } : s
      ));

      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        questions: s.questions?.filter(q => q.id !== questionId) || []
      } : s
    ));
    
    toast({
      title: "Success",
      description: "Question deleted successfully",
    });
  };

  const editQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions?.find(q => q.id === questionId);
    
    if (question) {
      setSections(sections.map(s => 
        s.id === sectionId ? {
          ...s,
          currentQuestion: { ...question },
          showQuestionForm: true,
          questions: s.questions?.filter(q => q.id !== questionId) || []
        } : s
      ));
    }
  };

  const toggleQuestionForm = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        showQuestionForm: !s.showQuestionForm
      } : s
    ));
  };

  const toggleCodingQuestionForm = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        showCodingQuestionForm: !s.showCodingQuestionForm
      } : s
    ));
  };

  const updateCurrentCodingQuestion = (sectionId: string, field: string, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId ? {
        ...section,
        currentCodingQuestion: {
          ...section.currentCodingQuestion!,
          [field]: value
        }
      } : section
    ));
  };

  const addSampleTestCase = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.currentCodingQuestion) return;

    const newTestCase: SampleTestCase = {
      id: Date.now().toString(),
      input: "",
      output: ""
    };

    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        currentCodingQuestion: {
          ...s.currentCodingQuestion!,
          sampleTestCases: [...s.currentCodingQuestion!.sampleTestCases, newTestCase]
        }
      } : s
    ));
  };

  const removeSampleTestCase = (sectionId: string, testCaseId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        currentCodingQuestion: {
          ...s.currentCodingQuestion!,
          sampleTestCases: s.currentCodingQuestion!.sampleTestCases.filter(tc => tc.id !== testCaseId)
        }
      } : s
    ));
  };

  const updateSampleTestCase = (sectionId: string, testCaseId: string, field: 'input' | 'output', value: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        currentCodingQuestion: {
          ...s.currentCodingQuestion!,
          sampleTestCases: s.currentCodingQuestion!.sampleTestCases.map(tc => 
            tc.id === testCaseId ? { ...tc, [field]: value } : tc
          )
        }
      } : s
    ));
  };

  const toggleAllowedLanguage = (sectionId: string, language: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.currentCodingQuestion) return;

    const currentLanguages = section.currentCodingQuestion.allowedLanguages;
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(lang => lang !== language)
      : [...currentLanguages, language];

    updateCurrentCodingQuestion(sectionId, 'allowedLanguages', newLanguages);
  };

  const addCodingQuestionToSection = (sectionId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section?.currentCodingQuestion) return;

      const { problemStatement, sampleTestCases, allowedLanguages, constraints } = section.currentCodingQuestion;
      
      if (!problemStatement.trim() || allowedLanguages.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in problem statement and select at least one programming language",
          variant: "destructive",
        });
        return;
      }
      
      if (sampleTestCases.length === 0 || sampleTestCases.some(tc => !tc.input.trim() || !tc.output.trim())) {
        toast({
          title: "Validation Error",
          description: "Please add at least one complete test case with input and output",
          variant: "destructive",
        });
        return;
      }

      const newCodingQuestion: CodingQuestion = {
        id: Date.now().toString(),
        ...section.currentCodingQuestion
      };

      setSections(sections.map(s => 
        s.id === sectionId ? {
          ...s,
          codingQuestions: [...(s.codingQuestions || []), newCodingQuestion],
          currentCodingQuestion: {
            problemStatement: "",
            sampleTestCases: [{ id: Date.now().toString(), input: "", output: "" }],
            allowedLanguages: [],
            constraints: "",
            marks: 1
          }
        } : s
      ));

      toast({
        title: "Success",
        description: "Coding question added successfully",
      });
    } catch (error) {
      console.error('Error adding coding question:', error);
      toast({
        title: "Error",
        description: "Failed to add coding question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteCodingQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        codingQuestions: s.codingQuestions?.filter(q => q.id !== questionId) || []
      } : s
    ));
    
    toast({
      title: "Success",
      description: "Coding question deleted successfully",
    });
  };

  const editCodingQuestion = (sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const question = section?.codingQuestions?.find(q => q.id === questionId);
    
    if (question) {
      setSections(sections.map(s => 
        s.id === sectionId ? {
          ...s,
          currentCodingQuestion: { ...question },
          showCodingQuestionForm: true,
          codingQuestions: s.codingQuestions?.filter(q => q.id !== questionId) || []
        } : s
      ));
      
      toast({
        title: "Edit Mode",
        description: "Question loaded for editing",
      });
    }
  };

  const saveCodingQuestion = (sectionId: string) => {
    addCodingQuestionToSection(sectionId);
    toast({
      title: "Success",
      description: "Coding question saved successfully",
    });
  };

  const handleImageUpload = (sectionId: string, field: string, file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const img = new Image();
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Canvas context not available');
            }
            
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image with white background for transparency
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            updateCurrentQuestion(sectionId, field, compressedDataUrl);
            
            toast({
              title: "Image Uploaded",
              description: `Image processed and compressed (${Math.round(compressedDataUrl.length / 1024)}KB)`,
            });
          } catch (error) {
            console.error('Image processing error:', error);
            toast({
              title: "Processing Error",
              description: "Failed to process image. Please try a different image.",
              variant: "destructive",
            });
          }
        };
        
        img.onerror = () => {
          toast({
            title: "Invalid Image",
            description: "The selected file is not a valid image or is corrupted.",
            variant: "destructive",
          });
        };
        
        img.src = result;
      } catch (error) {
        console.error('File read error:', error);
        toast({
          title: "File Read Error",
          description: "Failed to read the selected file.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "File Error",
        description: "Failed to read the selected file.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = (sectionId: string, field: string) => {
    updateCurrentQuestion(sectionId, field, undefined);
  };

  const saveToQuestionBank = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section?.questions || section.questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to save",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/question-bank/save-to-bank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: section.questions,
          topic: section.name || 'Untitled Topic'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const result = text ? JSON.parse(text) : { success: false };
      
      if (result.success) {
        toast({
          title: "Success! 💾",
          description: `Saved ${section.questions.length} questions to question bank`,
        });
      } else {
        throw new Error(result.message || 'Failed to save questions');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save questions to bank",
        variant: "destructive",
      });
    }
  };



  const addSection = () => {
    // Check if last section is saved
    const lastSection = sections[sections.length - 1];
    if (!lastSection.saved) {
      toast({
        title: "Save Current Section",
        description: "Please save the current section before adding a new one.",
        variant: "destructive",
      });
      return;
    }
    
    const newId = (sections.length + 1).toString();
    setSections([...sections, {
      id: newId,
      name: "",
      duration: 30,
      instructions: "",
      type: "MCQ",
      correctMarks: 1,
      excelFile: null,
      saved: false,
      questions: [],
      codingQuestions: [],
      currentQuestion: {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        marks: 1
      },
      currentCodingQuestion: {
        problemStatement: "",
        sampleTestCases: [{ id: Date.now().toString(), input: "", output: "" }],
        allowedLanguages: [],
        constraints: "",
        marks: 1
      },
      showQuestionForm: false,
      showCodingQuestionForm: false
    }]);
    setNumSections(sections.length + 1);
    setOpenSections([...openSections, newId]);
  };
// Remove the 
  const removeSection = (id: string) => {
    if (sections.length > 1) {
      const filteredSections = sections.filter(section => section.id !== id);
      // Reassign IDs to maintain proper sequence
      const reindexedSections = filteredSections.map((section, index) => ({
        ...section,
        id: (index + 1).toString()
      }));
      setSections(reindexedSections);
      setOpenSections(openSections.filter(sectionId => sectionId !== id));
      setNumSections(reindexedSections.length);
    }
  };

  const toggleSection = (id: string) => {
    const sectionIndex = parseInt(id) - 1;
    const section = sections[sectionIndex];
    
    // Check if previous sections are saved (except for first section)
    if (sectionIndex > 0) {
      const previousSection = sections[sectionIndex - 1];
      if (!previousSection.saved) {
        toast({
          title: "Complete Previous Section",
          description: "Please save the previous section before opening this one.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setOpenSections(openSections.includes(id) 
      ? openSections.filter(sectionId => sectionId !== id)
      : [...openSections, id]
    );
  };

  const handleSaveSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    if (!section.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter section name",
        variant: "destructive",
      });
      return;
    }

    // Check if MCQ section has either Excel file or manual questions
    if (section.type === "MCQ" && !section.excelFile && (!section.questions || section.questions.length === 0)) {
      toast({
        title: "Questions Required",
        description: "Please either upload an Excel file or add questions manually",
        variant: "destructive",
      });
      return;
    }

    // Check if Coding section has coding questions
    if (section.type === "Coding" && (!section.codingQuestions || section.codingQuestions.length === 0)) {
      toast({
        title: "Coding Questions Required",
        description: "Please add at least one coding question",
        variant: "destructive",
      });
      return;
    }

    // Validate Excel file if uploaded
    if (section.excelFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(section.excelFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }

      if (section.excelFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Excel file must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    // Check total duration
    const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);
    const testDur = parseInt(testDuration) || 0;
    
    if (testDur > 0 && totalDuration > testDur) {
      toast({
        title: "Duration Error",
        description: "Total section duration exceeds overall test duration.",
        variant: "destructive",
      });
      return;
    }

    // Mark section as saved
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, saved: true } : s
    ));
    
    toast({
      title: "Section Saved ✓",
      description: `Section "${section.name}" saved successfully.`,
    });
  };

  const handleSaveTest = async () => {
    // Prevent multiple rapid clicks
    if (isLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Basic validation
      if (!testName.trim()) {
        setIsLoading(false);
        toast({
          title: "Validation Error",
          description: "Please enter a test name",
          variant: "destructive",
        });
        return;
      }

      // Auto-save all unsaved sections before creating test
      const unsavedSections = sections.filter(s => !s.saved);
      if (unsavedSections.length > 0) {
        for (const section of unsavedSections) {
          if (!section.name.trim()) {
            setIsLoading(false);
            toast({
              title: "Validation Error",
              description: `Please enter name for section ${sections.indexOf(section) + 1}`,
              variant: "destructive",
            });
            return;
          }
          
          if (section.type === "MCQ" && !section.excelFile && (!section.questions || section.questions.length === 0)) {
            setIsLoading(false);
            toast({
              title: "Questions Required",
              description: `Section "${section.name}" needs either Excel file or manual questions`,
              variant: "destructive",
            });
            return;
          }
          
          if (section.type === "Coding" && (!section.codingQuestions || section.codingQuestions.length === 0)) {
            setIsLoading(false);
            toast({
              title: "Coding Questions Required",
              description: `Section "${section.name}" needs at least one coding question`,
              variant: "destructive",
            });
            return;
          }
        }
        
        // Mark all sections as saved
        setSections(sections.map(s => ({ ...s, saved: true })));
      }

      const formData = new FormData();
      
      // Add basic test data
      formData.append('name', testName.trim());
      formData.append('description', description.trim() || '');
      formData.append('instructions', testInstructions.trim() || '');
      formData.append('testDuration', testDuration || '60');
      formData.append('status', 'saved');
      
      // Prepare sections data (without files and UI state)
      const sectionsData = sections.map(({ excelFile, currentQuestion, currentCodingQuestion, showQuestionForm, showCodingQuestionForm, saved, ...section }) => ({
        ...section,
        manualQuestions: section.questions || [],
        codingQuestions: section.codingQuestions || []
      }));
      formData.append('sections', JSON.stringify(sectionsData));
      
      // Add Excel files with section names as field names
      sections.forEach((section) => {
        if (section.excelFile && section.name) {
          formData.append(section.name, section.excelFile);
        }
      });
      
      const apiUrl = editingTestId 
        ? `${API_BASE_URL}/api/test/${editingTestId}/update`
        : `${API_BASE_URL}/api/test/create`;
      
      const response = await fetch(apiUrl, {
        method: editingTestId ? 'PUT' : 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const testIdToUse = editingTestId || result.testId;
        setCreatedTestId(testIdToUse);
        
        // Update test name if it was changed by the backend
        if (result.finalTestName && result.finalTestName !== testName) {
          setTestName(result.finalTestName);
          toast({
            title: "Name Updated",
            description: `Test name was changed to: ${result.finalTestName}`,
          });
        }
        
        setShowScheduling(true);
        toast({
          title: "Success! 🎉",
          description: editingTestId ? "Test updated successfully. Now set the schedule." : "Test saved successfully. Now set the schedule.",
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to save test');
      }
    } catch (error) {
      console.error('Test save error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: error.message || (editingTestId ? "Failed to update test" : "Failed to create test"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('CreateTest render state:', { isLoading, testName, sections: sections.length });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">{editingTestId ? 'Edit Test' : 'Create New Test'}</h1>
              <p className="text-purple-100">{editingTestId ? 'Modify your existing test' : 'Design comprehensive assessments for your students'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    placeholder="Enter test name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="numSections">Number of Sections</Label>
                  <Input
                    id="numSections"
                    type="number"
                    min="1"
                    max="10"
                    value={numSections}
                    onChange={(e) => handleNumSectionsChange(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Test Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and content of this test"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Test Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="General instructions for students taking this test"
                    value={testInstructions}
                    onChange={(e) => setTestInstructions(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="testDuration">Test Duration (minutes) *</Label>
                  <Input
                    id="testDuration"
                    type="number"
                    min="1"
                    placeholder="Enter total test duration"
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            <Card>
              <CardHeader>
                <div className="text-center space-y-4">
                  <Button onClick={addSection} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sections.map((section, index) => (
                  <Collapsible
                    key={section.id}
                    open={openSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <div className="border rounded-lg p-4 space-y-4">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {section.name || `Section ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {section.type} • {section.duration} minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {sections.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSection(section.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-4">
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Section Name *</Label>
                            <Input
                              placeholder="e.g., Programming Fundamentals"
                              value={section.name}
                              onChange={(e) => updateSection(section.id, "name", e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>Duration (minutes)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={section.duration}
                              onChange={(e) => updateSection(section.id, "duration", parseInt(e.target.value) || 30)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Section Type</Label>
                            <Select
                              value={section.type}
                              onValueChange={(value) => updateSection(section.id, "type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MCQ">MCQ Questions</SelectItem>
                                <SelectItem value="Coding">Coding Problems</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Correct Answer Marks</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={section.correctMarks}
                              onChange={(e) => updateSection(section.id, "correctMarks", parseFloat(e.target.value) || 1)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Section Instructions</Label>
                          <Textarea
                            placeholder="Specific instructions for this section"
                            value={section.instructions}
                            onChange={(e) => updateSection(section.id, "instructions", e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        {section.type === "MCQ" && (
                          <div>
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Create Questions</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleQuestionForm(section.id)}
                                className="gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                {section.showQuestionForm ? 'Hide Form' : 'Add Question'}
                              </Button>
                            </div>
                            
                            {/* Added Questions List - Always visible */}
                            {section.questions && section.questions.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <Label className="text-sm font-medium">Added Questions ({section.questions.length})</Label>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                  {section.questions.map((question, qIndex) => (
                                    <div key={question.id} className="bg-white p-3 rounded border">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {qIndex + 1}. {question.questionText.substring(0, 60)}...
                                          </p>
                                          <p className="text-xs text-gray-600 mt-1">
                                            Correct: {question.correctAnswer} | Marks: {question.marks}
                                          </p>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editQuestion(section.id, question.id)}
                                            className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteQuestion(section.id, question.id)}
                                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {section.showQuestionForm && (
                              <Card className="mt-2 p-4 bg-blue-50 border-blue-200">
                                <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`question-${section.id}`}>Question *</Label>
                                  <Textarea
                                    id={`question-${section.id}`}
                                    placeholder="Enter your question here..."
                                    value={section.currentQuestion?.questionText || ""}
                                    onChange={(e) => updateCurrentQuestion(section.id, "questionText", e.target.value)}
                                    className="mt-1"
                                    rows={2}
                                  />
                                  <div className="mt-2 flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(section.id, 'questionImage', file);
                                        }
                                        // Clear the input so the same file can be selected again if needed
                                        e.target.value = '';
                                      }}
                                      className="hidden"
                                      id={`question-image-${section.id}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => document.getElementById(`question-image-${section.id}`)?.click()}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                    {section.currentQuestion?.questionImage && (
                                      <div className="relative">
                                        <img src={section.currentQuestion.questionImage} alt="Question" className="w-16 h-16 object-cover rounded" />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeImage(section.id, 'questionImage')}
                                          className="absolute -top-2 -right-2 w-5 h-5 p-0"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  {['A', 'B', 'C', 'D'].map((option) => (
                                    <div key={option}>
                                      <Label>Option {option} *</Label>
                                      <Input 
                                        placeholder={`Enter option ${option}...`} 
                                        value={section.currentQuestion?.[`option${option}` as keyof typeof section.currentQuestion] as string || ""}
                                        onChange={(e) => updateCurrentQuestion(section.id, `option${option}`, e.target.value)}
                                        className="mt-1" 
                                      />
                                      <div className="mt-2 flex items-center gap-2">
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleImageUpload(section.id, `option${option}Image`, file);
                                            }
                                            // Clear the input so the same file can be selected again if needed
                                            e.target.value = '';
                                          }}
                                          className="hidden"
                                          id={`option${option}-image-${section.id}`}
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => document.getElementById(`option${option}-image-${section.id}`)?.click()}
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                        {section.currentQuestion?.[`option${option}Image` as keyof typeof section.currentQuestion] && (
                                          <div className="relative">
                                            <img 
                                              src={section.currentQuestion[`option${option}Image` as keyof typeof section.currentQuestion] as string} 
                                              alt={`Option ${option}`} 
                                              className="w-12 h-12 object-cover rounded" 
                                            />
                                            <Button
                                              type="button"
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => removeImage(section.id, `option${option}Image`)}
                                              className="absolute -top-2 -right-2 w-4 h-4 p-0"
                                            >
                                              <Trash2 className="w-2 h-2" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>Correct Answer *</Label>
                                    <Select 
                                      value={section.currentQuestion?.correctAnswer || ""}
                                      onValueChange={(value) => updateCurrentQuestion(section.id, "correctAnswer", value)}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select correct answer" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="A">Option A</SelectItem>
                                        <SelectItem value="B">Option B</SelectItem>
                                        <SelectItem value="C">Option C</SelectItem>
                                        <SelectItem value="D">Option D</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Marks</Label>
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      value={section.currentQuestion?.marks || 1}
                                      onChange={(e) => updateCurrentQuestion(section.id, "marks", parseInt(e.target.value) || 1)}
                                      className="mt-1" 
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Explanation</Label>
                                  <Textarea
                                    placeholder="Provide explanation for the correct answer..."
                                    value={section.currentQuestion?.explanation || ""}
                                    onChange={(e) => updateCurrentQuestion(section.id, "explanation", e.target.value)}
                                    className="mt-1"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => addQuestionToSection(section.id)}
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Question
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="default" 
                                    size="sm"
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      addQuestionToSection(section.id);
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                    Save Questions
                                  </Button>
                                  <Button type="button" variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview ({section.questions?.length || 0})
                                  </Button>
                                </div>

                                </div>
                              </Card>
                            )}
                            

                          </div>
                        )}

                        {section.type === "MCQ" && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Upload Questions (Excel File)</Label>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    window.open('/ai-quiz-generator', '_blank');
                                  }}
                                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                                >
                                  <span>🤖</span>
                                  AI Quiz Generate
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `${API_BASE_URL}/api/test/template/download`;
                                    link.download = 'question-template.xlsx';
                                    link.click();
                                  }}
                                  className="gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Download Template
                                </Button>
                              </div>
                            </div>

                            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Validate file type
                                    const allowedTypes = [
                                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                      'application/vnd.ms-excel'
                                    ];
                                    
                                    if (!allowedTypes.includes(file.type)) {
                                      toast({
                                        title: "Invalid File Type",
                                        description: "Please upload a valid Excel file (.xlsx or .xls)",
                                        variant: "destructive",
                                      });
                                      e.target.value = ''; // Clear the input
                                      return;
                                    }

                                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                      toast({
                                        title: "File Too Large",
                                        description: "Excel file must be smaller than 5MB",
                                        variant: "destructive",
                                      });
                                      e.target.value = ''; // Clear the input
                                      return;
                                    }

                                    updateSection(section.id, "excelFile", file);
                                    toast({
                                      title: "File Selected",
                                      description: `Selected: ${file.name}`,
                                    });
                                  } else {
                                    updateSection(section.id, "excelFile", null);
                                  }
                                }}
                                className="hidden"
                                id={`file-${section.id}`}
                              />
                              <label
                                htmlFor={`file-${section.id}`}
                                className="cursor-pointer flex flex-col items-center space-y-2"
                              >
                                <Upload className={`w-6 h-6 ${section.excelFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className={`text-sm ${section.excelFile ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                  {section.excelFile ? `✓ ${section.excelFile.name}` : 'Click to upload Excel file'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Use the template above for proper formatting (.xlsx, .xls - max 5MB)
                                </span>
                              </label>
                              {section.excelFile && (
                                <div className="mt-2 flex justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateSection(section.id, "excelFile", null);
                                      const fileInput = document.getElementById(`file-${section.id}`) as HTMLInputElement;
                                      if (fileInput) fileInput.value = '';
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove File
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {section.type === "Coding" && (
                          <div>
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Create Coding Questions</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCodingQuestionForm(section.id)}
                                className="gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                {section.showCodingQuestionForm ? 'Hide Form' : 'Add Question'}
                              </Button>
                            </div>
                            
                            {/* Added Coding Questions List */}
                            {section.codingQuestions && section.codingQuestions.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <Label className="text-sm font-medium">Added Coding Questions ({section.codingQuestions.length})</Label>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                  {section.codingQuestions.map((question, qIndex) => (
                                    <div key={question.id} className="bg-white p-3 rounded border">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {qIndex + 1}. {question.problemStatement.substring(0, 80)}...
                                          </p>
                                          <p className="text-xs text-gray-600 mt-1">
                                            Languages: {question.allowedLanguages.join(', ')} | Marks: {question.marks}
                                          </p>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editCodingQuestion(section.id, question.id)}
                                            className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                                            title="Edit Question"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteCodingQuestion(section.id, question.id)}
                                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {section.showCodingQuestionForm && (
                              <Card className="mt-2 p-4 bg-purple-50 border-purple-200">
                                <div className="space-y-4">
                                  {/* Problem Statement */}
                                  <div>
                                    <Label htmlFor={`problem-${section.id}`}>Problem Statement *</Label>
                                    <Textarea
                                      id={`problem-${section.id}`}
                                      placeholder="Write the coding problem description here..."
                                      value={section.currentCodingQuestion?.problemStatement || ""}
                                      onChange={(e) => updateCurrentCodingQuestion(section.id, "problemStatement", e.target.value)}
                                      className="mt-1"
                                      rows={6}
                                    />
                                  </div>

                                  {/* Sample Test Cases */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <Label>Sample Test Cases *</Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addSampleTestCase(section.id)}
                                        className="gap-2"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add Test Case
                                      </Button>
                                    </div>
                                    <div className="space-y-3">
                                      {section.currentCodingQuestion?.sampleTestCases.map((testCase, index) => (
                                        <div key={testCase.id} className="border rounded-lg p-3 bg-white">
                                          <div className="flex items-center justify-between mb-2">
                                            <Label className="text-sm font-medium">Test Case {index + 1}</Label>
                                            {section.currentCodingQuestion!.sampleTestCases.length > 1 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSampleTestCase(section.id, testCase.id)}
                                                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <Label className="text-xs">Sample Input</Label>
                                              <Textarea
                                                placeholder="Enter sample input...\nExample: 5\n1 2 3 4 5"
                                                value={testCase.input}
                                                onChange={(e) => updateSampleTestCase(section.id, testCase.id, 'input', e.target.value)}
                                                className="mt-1 text-sm font-mono"
                                                rows={4}
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-xs">Expected Output</Label>
                                              <Textarea
                                                placeholder="Enter expected output...\nExample: 15"
                                                value={testCase.output}
                                                onChange={(e) => updateSampleTestCase(section.id, testCase.id, 'output', e.target.value)}
                                                className="mt-1 text-sm font-mono"
                                                rows={4}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Allowed Languages */}
                                  <div>
                                    <Label>Allowed Programming Languages *</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                      {['Java', 'C++', 'C', 'Python'].map((language) => (
                                        <div key={language} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                                          <input
                                            type="checkbox"
                                            id={`${section.id}-${language}`}
                                            checked={section.currentCodingQuestion?.allowedLanguages.includes(language) || false}
                                            onChange={() => toggleAllowedLanguage(section.id, language)}
                                            className="rounded border-gray-300 text-purple-600 w-4 h-4"
                                          />
                                          <label htmlFor={`${section.id}-${language}`} className="text-sm cursor-pointer font-medium">
                                            {language}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Select the programming languages students can use for this question
                                    </p>
                                  </div>

                                  {/* Constraints and Marks */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3">
                                      <Label htmlFor={`constraints-${section.id}`}>Constraints</Label>
                                      <Textarea
                                        id={`constraints-${section.id}`}
                                        placeholder="Enter problem constraints (e.g., 1 ≤ n ≤ 10^5, Time limit: 2 seconds)..."
                                        value={section.currentCodingQuestion?.constraints || ""}
                                        onChange={(e) => updateCurrentCodingQuestion(section.id, "constraints", e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <Label>Marks</Label>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        value={section.currentCodingQuestion?.marks || 1}
                                        onChange={(e) => updateCurrentCodingQuestion(section.id, "marks", parseInt(e.target.value) || 1)}
                                        className="mt-1" 
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      className="gap-2"
                                      onClick={() => addCodingQuestionToSection(section.id)}
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Question
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="default" 
                                      size="sm"
                                      className="gap-2 bg-green-600 hover:bg-green-700"
                                      onClick={() => saveCodingQuestion(section.id)}
                                    >
                                      <Plus className="w-4 h-4" />
                                      Save Question
                                    </Button>
                                    <Button type="button" variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview ({section.codingQuestions?.length || 0})
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>
                        )}

                        {/* Section Save Button */}
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleSaveSection(section.id)}
                            variant={section.saved ? "secondary" : "default"}
                            size="sm"
                            className="gap-2"
                          >
                            {section.saved ? "✓ Saved" : "Save Section"}
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Test Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {testName || "Untitled Test"}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {sections.length} section{sections.length !== 1 ? "s" : ""}
                  </p>
       
                </div>
                

                <Separator />
               

                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">
                            {section.name || `Section ${index + 1}`}
                          </span>
                        </div>
                        {sections.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(section.id)}
                            className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {section.duration}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          section.type === "MCQ" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {section.type === "MCQ" ? "MCQ" : "Coding"}
                        </span>
                        {section.saved && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            ✓ Saved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={async () => {
              try {
                if (!isLoading) {
                  console.log('Save Test button clicked!');
                  console.log('Current state:', { testName, sections: sections.length, isLoading });
                  await handleSaveTest();
                }
              } catch (error) {
                console.error('Button click error:', error);
                toast({
                  title: "Error",
                  description: "An unexpected error occurred. Please try again.",
                  variant: "destructive",
                });
              }
            }}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-200 gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!testName.trim() || isLoading}
          >
            <TestTube className="w-5 h-5" />
            {isLoading ? 'Saving...' : (editingTestId ? 'Update Test' : 'Save Test')}
          </Button>
        </div>

        {/* Scheduling Modal */}
        {showScheduling && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-bold">Schedule Test</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Test Date *</Label>
                    <Input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Assign to Departments *</Label>
                  <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50 mt-1">
                    {/* All Departments Option */}
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dept-ALL"
                          checked={selectedDepartments.includes("ALL")}
                          onChange={(e) => {
                            setSelectedDepartments(e.target.checked ? ["ALL"] : []);
                          }}
                          className="rounded border-gray-300 text-purple-600"
                        />
                        <label htmlFor="dept-ALL" className="text-sm cursor-pointer font-medium text-purple-700">
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
                                  id={`dept-${dept.value}`}
                                  checked={selectedDepartments.includes(dept.value)}
                                  onChange={(e) => {
                                    const newDepts = e.target.checked
                                      ? [...selectedDepartments.filter(d => d !== "ALL"), dept.value]
                                      : selectedDepartments.filter(d => d !== dept.value);
                                    setSelectedDepartments(newDepts);
                                  }}
                                  className={`rounded border-gray-300 text-${group.color}-600`}
                                />
                                <label htmlFor={`dept-${dept.value}`} className={`text-sm cursor-pointer flex-1 text-${group.color}-700`}>
                                  {dept.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowScheduling(false);
                      // Reset form only if not editing
                      if (!editingTestId) {
                        setTestName("");
                        setDescription("");
                        setTestInstructions("");
                        setTestDuration("");
                        setTestDate("");
                        setStartTime("");
                        setSelectedDepartments([]);
                        setSections([{
                          id: "1",
                          name: "",
                          duration: 30,
                          instructions: "",
                          type: "MCQ",
                          correctMarks: 1,
                          excelFile: null,
                          saved: false,
                          questions: [],
                          currentQuestion: {
                            questionText: "",
                            optionA: "",
                            optionB: "",
                            optionC: "",
                            optionD: "",
                            correctAnswer: "",
                            explanation: "",
                            marks: 1
                          }
                        }]);
                        setNumSections(1);
                        setOpenSections(["1"]);
                      } else {
                        // If editing, redirect to tests list
                        window.location.href = '/admin/tests';
                      }
                    }}
                    className="flex-1"
                  >
                    Skip Scheduling
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!testDate || !startTime || selectedDepartments.length === 0) {
                        toast({
                          title: "Error",
                          description: "Please fill in all required fields",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      try {
                        const testIdToAssign = createdTestId || editingTestId;
                        const response = await fetch(`${API_BASE_URL}/api/test/${testIdToAssign}/assign`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            testDate,
                            startTime,

                            departments: selectedDepartments
                          })
                        });
                        
                        const result = await response.json();
                        if (response.ok && result.success) {
                          toast({
                            title: "Success! 🎉",
                            description: "Test scheduled and assigned successfully",
                          });
                          setShowScheduling(false);
                          // Reset form only if not editing
                          if (!editingTestId) {
                            setTestName("");
                            setDescription("");
                            setTestInstructions("");
                            setTestDuration("");
                            setTestDate("");
                            setStartTime("");
                            setSelectedDepartments([]);
                            setSections([{
                              id: "1",
                              name: "",
                              duration: 30,
                              instructions: "",
                              type: "MCQ",
                              correctMarks: 1,
                              excelFile: null,
                              saved: false,
                              questions: [],
                              currentQuestion: {
                                questionText: "",
                                optionA: "",
                                optionB: "",
                                optionC: "",
                                optionD: "",
                                correctAnswer: "",
                                explanation: "",
                                marks: 1
                              }
                            }]);
                            setNumSections(1);
                            setOpenSections(["1"]);
                          } else {
                            // If editing, redirect to tests list
                            window.location.href = '/admin/tests';
                          }
                        } else {
                          throw new Error('Failed to schedule test');
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to schedule test",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Schedule & Assign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateTest;
