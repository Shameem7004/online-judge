import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMySubmissions } from '../api/submissionApi';
import { Card, CardContent } from '../components/ui/Card';

function getDifficultyClass(difficulty) {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getVerdictClass(verdict) {
  switch ((verdict || '').toLowerCase()) {
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'wrong answer':
      return 'bg-red-100 text-red-800';
    case 'time limit exceeded':
      return 'bg-yellow-100 text-yellow-800';
    case 'runtime error':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function SubmissionsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [expandedProblems, setExpandedProblems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchSubmissions = async () => {
      try {
        const res = await getMySubmissions();
        // Group by problem on frontend
        const grouped = {};
        res.data.submissions.forEach(sub => {
          const problemId = sub.problem?._id || 'unknown';
          if (!grouped[problemId]) {
            grouped[problemId] = { problem: sub.problem, submissions: [] };
          }
          grouped[problemId].submissions.push(sub);
        });
        setGroupedSubmissions(grouped);
      } catch (error) {
        setError('Failed to load submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user, navigate]);

  const toggleProblem = (problemId) => {
    setExpandedProblems(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const getMostRecentSubmission = (submissions) => {
    return submissions.reduce((latest, current) => {
      return (!latest || new Date(current.createdAt) > new Date(latest.createdAt)) ? current : latest;
    }, null);
  };

  const problemIds = Object.keys(groupedSubmissions);

  const sortedProblemIds = problemIds.sort((a, b) => {
    const aLatest = getMostRecentSubmission(groupedSubmissions[a].submissions);
    const bLatest = getMostRecentSubmission(groupedSubmissions[b].submissions);
    return new Date(bLatest.createdAt) - new Date(aLatest.createdAt);
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your submissions.</p>
          <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 h-10 w-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full"></div>
          <div className="text-gray-500 text-lg">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Submissions</h1>
        <p className="text-lg text-gray-600">Your submission history, grouped by problem</p>
      </div>

      {sortedProblemIds.length > 0 ? (
        <div className="space-y-8">
          {sortedProblemIds
            .filter(problemId => groupedSubmissions[problemId] && groupedSubmissions[problemId].problem)
            .map(problemId => {
              const { problem, submissions } = groupedSubmissions[problemId];
              const latestSubmission = getMostRecentSubmission(submissions);
              const isExpanded = expandedProblems[problemId];

              return (
                <Card key={problemId} className="overflow-hidden">
                  <div className="flex flex-col">
                    <div
                      className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 rounded-t-xl p-4"
                      onClick={() => toggleProblem(problemId)}
                      style={{ userSelect: 'none' }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className="font-semibold text-lg text-indigo-700">{problem.name}</span>
                        <span className={`ml-0 md:ml-3 px-2 py-1 rounded text-xs font-medium border ${getDifficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerdictClass(latestSubmission.verdict)}`}>
                          {latestSubmission.verdict}
                        </span>
                        <span className="text-gray-400 text-sm">{new Date(latestSubmission.createdAt).toLocaleString()}</span>
                        <svg className={`w-5 h-5 ml-2 transition-transform text-gray-500 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {isExpanded && (
                      <CardContent className="bg-gray-50 rounded-b-xl">
                        <div className="divide-y divide-gray-200">
                          {submissions
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map(sub => (
                              <div key={sub._id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getVerdictClass(sub.verdict)}`}>
                                    {sub.verdict}
                                  </span>
                                  <span className="text-xs text-gray-600">{new Date(sub.createdAt).toLocaleString()}</span>
                                  <span className="text-xs text-gray-400 ml-2">{sub.language}</span>
                                </div>
                                <Link to={`/submissions/${sub._id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                                  View Details
                                </Link>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card className="shadow-lg rounded-xl p-12 text-center border border-gray-100">
          <CardContent>
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500 mb-6">Get started by solving your first problem!</p>
            <Link
              to="/problems"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
            >
              Browse Problems
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SubmissionsPage;
