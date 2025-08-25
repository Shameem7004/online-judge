import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/userApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FaTrophy, FaUserCircle } from 'react-icons/fa';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getLeaderboard({ signal: controller.signal });
        
        // FIX: Correctly access the 'leaderboard' array from the response
        // and ensure it's always an array, even if the response is malformed.
        if (response.data && response.data.success) {
          setLeaderboard(response.data.leaderboard || []);
        } else {
          throw new Error('Invalid response structure from server.');
        }

      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch leaderboard:', err);
          setError('Could not load the leaderboard. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      controller.abort();
    };
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-700';
    return 'text-slate-500';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Leaderboard</h1>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center bg-white p-4 rounded-lg shadow-sm">
              <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
              <div className="ml-4 h-6 w-1/3 bg-slate-200 rounded"></div>
              <div className="ml-auto h-6 w-1/6 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-slate-800">
            <FaTrophy className="mr-3 text-yellow-500" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-slate-500 py-8">The leaderboard is currently empty. Start solving problems to get ranked!</p>
          ) : (
            <ul className="space-y-3">
              {leaderboard.map((user, index) => (
                <li key={user._id} className="flex items-center bg-slate-50 p-4 rounded-lg shadow-sm transition hover:bg-slate-100">
                  <div className={`w-10 text-center text-xl font-bold ${getRankColor(index + 1)}`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center ml-4">
                    <FaUserCircle className="h-8 w-8 text-slate-400" />
                    <span className="ml-3 font-medium text-slate-800">{user.username}</span>
                  </div>
                  <div className="ml-auto text-lg font-semibold text-slate-700">
                    {user.score} Points
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;