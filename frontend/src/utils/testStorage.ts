// Simple localStorage-based test storage
export interface Test {
  testId: string;
  name: string;
  description: string;
  instructions: string;
  testDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  Sections: Section[];
}

export interface Section {
  id: number;
  name: string;
  duration: number;
  type: string;
  correctMarks: number;
  instructions: string | null;
  testId: string;
  createdAt: string;
  updatedAt: string;
  test_id: string;
  MCQs?: any[];
}

export const saveTest = (test: Test) => {
  const existingTests = getTests();
  const updatedTests = [...existingTests, test];
  localStorage.setItem('tests', JSON.stringify(updatedTests));
};

export const getTests = (): Test[] => {
  const tests = localStorage.getItem('tests');
  return tests ? JSON.parse(tests) : [];
};

export const generateTestId = (): string => {
  return 'TEST' + Date.now().toString().slice(-6);
};