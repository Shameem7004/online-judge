import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyProblem } from '../api/problemApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

function DailyProblemPage() {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await getDailyProblem();
        setProblem(res.data.problem);
      } catch (err) {
        setError('Failed to fetch today\'s problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading daily problem...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!problem) return <div className="p-8 text-center text-gray-500">No daily problem available.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        Daily Problem
      </h1>
      <p className="text-lg text-gray-600">
        Your problem for today
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-700 text-2xl font-bold">{problem.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600">{problem.difficulty} • {problem.points} points</div>
          <div className="mb-6 text-gray-800 whitespace-pre-line">{problem.statement}</div>
          <Button onClick={() => navigate(`/problems/${problem.slug}`)}>
            Solve Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default DailyProblemPage;