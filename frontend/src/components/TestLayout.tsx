import { ReactNode } from "react";

interface TestLayoutProps {
  children: ReactNode;
}

const TestLayout = ({ children }: TestLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header for test mode */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src="/favicon.svg" alt="icon" className="w-18 h-18 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Assessment Platform - Test Mode</h1>
          </div>
          <div className="text-sm text-red-600 font-medium">
            🔒 Test in Progress - Navigation Disabled
          </div>
        </div>
      </header>

      {/* Main content without sidebar */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default TestLayout;