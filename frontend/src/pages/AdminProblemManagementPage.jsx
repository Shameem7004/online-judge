import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProblems, deleteProblem } from '../api/problemApi';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminProblemManagementPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await getAllProblems({ page: 1, limit: 100 }); // Fetch more for admin view
        setProblems(res.data.problems);
      } catch (error) {
        toast.error("Failed to fetch problems.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(id);
        setProblems(problems.filter(p => p._id !== id));
        toast.success('Problem deleted successfully.');
      } catch (error) {
        toast.error('Failed to delete problem.');
      }
    }
  };

  if (loading) return <div>Loading problems...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Problem Management</h1>
          <p className="text-lg text-slate-600 mt-2">
            View, edit, or delete all coding problems.
          </p>
        </div>
        <Link to="/admin/create-problem">
          <Button>
            <FaPlus className="mr-2" /> Create New Problem
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="p-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map(problem => (
                  <tr key={problem._id} className="hover:bg-gray-50">
                    <td className="p-2 whitespace-nowrap font-medium text-gray-800">{problem.name}</td>
                    <td className="p-2 whitespace-nowrap text-sm text-gray-500">{problem.difficulty}</td>
                    <td className="p-2 whitespace-nowrap text-sm text-gray-500">{problem.points}</td>
                    <td className="p-2 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                      <Link to={`/admin/edit-problem/${problem._id}`}>
                        <Button variant="outline" size="sm"><FaEdit /></Button>
                      </Link>
                      <Link to={`/admin/problems/${problem._id}/testcases`}>
                        <Button size="sm" variant="primary">Manage Testcases</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(problem._id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProblemManagementPage;