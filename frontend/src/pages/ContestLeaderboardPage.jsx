import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContestLeaderboard } from '../api/contestApi';

const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};

function ContestLeaderboardPage() {
    const { contestId } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await getContestLeaderboard(contestId);
                setLeaderboard(res.data.leaderboard);
            } catch (err) {
                setError('Failed to fetch leaderboard data.');
                console.error('Fetch leaderboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [contestId]);

    if (loading) return <div className="p-8 text-center">Loading Leaderboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    Contest Leaderboard
                </h1>
                <p className="text-lg text-gray-600">
                    See how you stack up against other participants
                </p>
                <Link to={`/contests/${contestId}`} className="text-indigo-600 hover:underline mt-2 inline-block">
                    &larr; Back to Contest
                </Link>
            </div>
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {leaderboard.map((user, idx) => (
                        <li key={user.username} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-600 w-12 text-center">{getRankMedal(idx + 1)}</span>
                                <span className="ml-4 text-lg font-medium text-indigo-700">{user.username}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-800">{user.totalPoints} Points</p>
                                <p className="text-sm text-gray-500">{user.problemsSolved} problems solved</p>
                            </div>
                        </li>
                    ))}
                </ul>
                {leaderboard.length === 0 && (
                    <p className="text-center p-12 text-gray-500">No successful submissions yet.</p>
                )}
            </div>
        </div>
    );
}

export default ContestLeaderboardPage;