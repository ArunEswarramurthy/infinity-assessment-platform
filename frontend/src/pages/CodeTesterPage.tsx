import React from 'react';
import CodeTester from '@/components/CodeTester';

const CodeTesterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Code Compiler Test
          </h1>
          <p className="text-gray-600">
            Test your code with custom input and see compiler status
          </p>
        </div>
        <CodeTester />
      </div>
    </div>
  );
};

export default CodeTesterPage;