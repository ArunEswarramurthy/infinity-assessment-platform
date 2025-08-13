import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Users, TrendingUp, RefreshCw, Crown } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const departments = ['all', 'CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const endpoint = selectedDepartment === 'all' 
        ? `${API_BASE_URL}/api/leaderboard`
        : `${API_BASE_URL}/api/leaderboard/department/${selectedDepartment}`;
      
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard || []);
        setStats(response.data.stats || {});
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${response.data.leaderboard?.length || 0} leaderboard entries`);
      }
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      setLeaderboard([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDepartment]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 font-bold';
    if (score >= 80) return 'text-blue-600 font-semibold';
    if (score >= 70) return 'text-yellow-600 font-medium';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Licensed Users Leaderboard</h1>
            <p className="text-gray-600">Top performing licensed students</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchLeaderboard} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.activeLicensedUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.overallAverageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.averageTestsPerUser}</div>
              <div className="text-sm text-gray-600">Avg Tests/User</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.topPerformer?.averageScore || 0}%</div>
              <div className="text-sm text-gray-600">Top Score</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
              {selectedDepartment !== 'all' && (
                <Badge variant="outline">{selectedDepartment}</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">
                No licensed users with completed tests found
                {selectedDepartment !== 'all' && ` in ${selectedDepartment} department`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Student Name</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-1">Year</div>
                <div className="col-span-2">Test Count</div>
                <div className="col-span-2">Avg Score</div>
                <div className="col-span-1">Best</div>
              </div>
              
              {/* Table Rows */}
              {leaderboard.map((student) => (
                <div key={student.studentId} className={`grid grid-cols-12 gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  student.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="col-span-1 flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankBadgeColor(student.rank)}`}>
                      {student.rank <= 3 ? getRankIcon(student.rank) : student.rank}
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <div>
                      <div className="font-semibold text-gray-900">{student.studentName}</div>
                      <div className="text-xs text-gray-500">{student.sinNumber}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="text-xs">
                      {student.department}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm font-medium text-gray-700">{student.year}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{student.testCount}</div>
                      <div className="text-xs text-gray-500">tests</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getScoreColor(student.averageScore)}`}>
                        {student.averageScore}%
                      </div>
                      <div className="text-xs text-gray-500">average</div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${getScoreColor(student.bestScore)}`}>
                        {student.bestScore}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;