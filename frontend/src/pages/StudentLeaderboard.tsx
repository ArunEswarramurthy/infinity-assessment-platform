import StudentLayout from "@/components/StudentLayout";
import Leaderboard from "@/components/Leaderboard";

const StudentLeaderboard = () => {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-purple-100">See how you rank among licensed students</p>
        </div>
        <Leaderboard />
      </div>
    </StudentLayout>
  );
};

export default StudentLeaderboard;