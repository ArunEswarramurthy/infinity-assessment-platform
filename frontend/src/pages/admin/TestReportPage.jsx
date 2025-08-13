import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import TestReportDetails from '@/components/TestReportDetails';

const TestReportPage = () => {
  const { testId } = useParams();

  if (!testId) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Test ID not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TestReportDetails testId={testId} />
    </AdminLayout>
  );
};

export default TestReportPage;
