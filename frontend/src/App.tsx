import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MCQTest from "./pages/MCQTest";
import CodeChallenge from "./pages/CodeChallenge";
import StudentProfile from "./pages/StudentProfile";
import MCQManagement from "./pages/MCQManagement";
import StudentManagement from "./pages/StudentManagement";
import StudentPractice from "./pages/StudentPractice";
import AdminChallenges from "./pages/AdminChallenges";
import AdminAnalytics from "./pages/AdminAnalytics";
import StudentTests from "./pages/StudentTests";
import StudentChallenges from "./pages/StudentChallenges";
import StudentAssessment from "./pages/StudentAssessment";
import CreateTest from "./pages/CreateTest";
import AdminPasscode from "./pages/AdminPasscode";
import AdminLicense from "./pages/AdminLicense";
import AdminPractice from "./pages/AdminPractice";

import PracticeTest from "./pages/PracticeTest";
import UploadQuestions from "./pages/UploadQuestions";
import AdminAssessmentCenter from "./pages/AdminAssessmentCenter";
import AdminReports from "./pages/AdminReports";
import TestResult from "./pages/TestResult";
import TestListPage from "./pages/admin/TestListPage";
import TestReportPage from "./pages/admin/TestReportPage";
import PracticeResult from "./pages/PracticeResult";
import AIQuizGenerator from "./pages/AIQuizGenerator";
import QuestionTemplate from "./pages/QuestionTemplate";
import NotFound from "./pages/NotFound";
import StudentReports from "./pages/StudentReports";
import StudentLeaderboard from "./pages/StudentLeaderboard";
import AdminLeaderboard from "./pages/AdminLeaderboard";
import CompilerTest from "./pages/CompilerTest";
import SectionTest from "./pages/SectionTest";
import AdminTestReports from "./pages/AdminTestReports";
import CodingPlatform from "./pages/CodingPlatform";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  // Get the Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route
                  path="/student/dashboard"
                  element={<StudentDashboard />}
                />
                <Route
                  path="/student/assessment"
                  element={<StudentAssessment />}
                />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/student/test/:testId" element={<MCQTest />} />
                <Route path="/student/section-test/:testId" element={<SectionTest />} />
                <Route path="/student/test/:testId/result" element={<TestResult />} />
                <Route path="/student/practice/:topicId/result" element={<PracticeResult />} />
                <Route
                  path="/student/challenge/:challengeId"
                  element={<CodeChallenge />}
                />
                <Route
                  path="/student/mcq-test/:topicId"
                  element={<PracticeTest />}
                />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/tests" element={<StudentTests />} />
                <Route
                  path="/student/challenges"
                  element={<StudentChallenges />}
                />
                <Route path="/student/practice" element={<StudentPractice />} />
                <Route path="/student/reports" element={<StudentReports />} />
                <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
                <Route path="/admin/mcq" element={<MCQManagement />} />
                <Route path="/admin/students" element={<StudentManagement />} />
                <Route path="/admin/challenges" element={<AdminChallenges />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/create-test" element={<CreateTest />} />
                <Route path="/admin/passcode" element={<AdminPasscode />} />
                <Route path="/admin/license" element={<AdminLicense />} />
                <Route path="/admin/practice" element={<AdminPractice />} />
                <Route path="/admin/upload-questions/:topicId" element={<UploadQuestions />} />
                <Route path="/admin/assessment-center" element={<AdminAssessmentCenter />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/test-reports" element={<AdminTestReports />} />
                <Route path="/admin/test-reports/:testId" element={<TestReportPage />} />
                <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
                <Route path="/ai-quiz-generator" element={<AIQuizGenerator />} />
                <Route path="/question-template" element={<QuestionTemplate />} />
                <Route path="/compiler-test" element={<CompilerTest />} />
                <Route path="/coding-platform" element={<CodingPlatform />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
