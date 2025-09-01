import { useState, useEffect } from 'react';
import { getMySubmissions } from '../api/submissionApi';
import { getAllContests } from '../api/contestApi';
import ContestCard from '../components/ContestCard';
import { FaTrophy } from 'react-icons/fa';

const AttendedContestsPage = () => {
  const [attendedContests, setAttendedContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendedContests = async () => {
      try {
        const [submissionsRes, contestsRes] = await Promise.all([
          getMySubmissions(),
          getAllContests()
        ]);

        // FIX: Add a defensive check to ensure groupedSubmissions exists and is an array
        const submissionsData = submissionsRes.data?.groupedSubmissions || [];
        const allSubmissions = submissionsData.flatMap(group => group.submissions);
        const attendedContestIds = new Set(allSubmissions.filter(sub => sub.contest).map(sub => sub.contest));
        
        const allContests = contestsRes.data?.data || [];
        const filteredContests = allContests.filter(contest => attendedContestIds.has(contest._id));
        
        setAttendedContests(filteredContests);
      } catch (err) {
        setError('Failed to load attended contests.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendedContests();
  }, []);

  if (loading) return <div className="text-center p-12">Loading attended contests...</div>;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 text-center">Contests Attended</h1>
        <p className="text-lg text-slate-600 text-center mt-2">A history of all the contests you've participated in.</p>
      </div>
      {attendedContests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendedContests.map(contest => (
            <ContestCard key={contest._id} contest={contest} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg shadow-sm">
            <FaTrophy className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No Contests Attended</h3>
            <p className="mt-1 text-sm text-slate-500">You haven't participated in any contests yet.</p>
        </div>
      )}
    </div>
  );
};

export default AttendedContestsPage;