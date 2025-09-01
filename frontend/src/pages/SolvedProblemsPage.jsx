import { useState, useEffect } from 'react';
import { getMySubmissions } from '../api/submissionApi';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FaCheckCircle } from 'react-icons/fa';

const ProblemRow = ({ problem }) => {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <Link to={`/problems/${problem.slug}`} className="block hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h4 className="font-semibold text-slate-800">{problem.name}</h4>
          <p className="text-sm text-slate-500">{problem.topics.join(', ')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getDifficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-sm text-slate-600">{problem.points} Points</span>
        </div>
      </div>
    </Link>
  );
};

const SolvedProblemsPage = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolved = async () => {
      try {
        const res = await getMySubmissions();
        // FIX: Add a defensive check to handle cases where groupedSubmissions might be undefined.
        const submissionsData = res.data?.groupedSubmissions || [];
        const allSubmissions = submissionsData.flatMap(group => group.submissions);
        const acceptedSubs = allSubmissions.filter(sub => sub.verdict === 'Accepted');
        
        const solvedMap = new Map();
        acceptedSubs.forEach(sub => {
          if (!solvedMap.has(sub.problem._id)) {
            solvedMap.set(sub.problem._id, sub.problem);
          }
        });
        
        setSolvedProblems(Array.from(solvedMap.values()));
      } catch (err) {
        setError('Failed to load solved problems.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSolved();
  }, []);

  if (loading) return <div className="text-center p-12">Loading solved problems...</div>;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 text-center">Problems Solved</h1>
        <p className="text-lg text-slate-600 text-center mt-2">A list of all the problems you have successfully solved.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaCheckCircle className="mr-3 text-green-500" />
            Solved ({solvedProblems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {solvedProblems.length > 0 ? (
            <div>
              {solvedProblems.map(problem => (
                <ProblemRow key={problem._id} problem={problem} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 p-8">You haven't solved any problems yet. Time to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolvedProblemsPage;