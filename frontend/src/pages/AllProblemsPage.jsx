import { useEffect, useState } from "react";
import { getAllProblems } from "../api/problemApi";
import { Link } from 'react-router-dom';

// Helper function for styling difficulty tags
const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return 'bg-green-100 text-green-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        case 'hard': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

function AllProblemsPage() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllProblems = async () => {
            try {
                const res = await getAllProblems();
                // This logic correctly handles if the API returns a direct array or an object
                const problemsData = Array.isArray(res.data) ? res.data : res.data.problems;
                // Add a placeholder 'status' for demonstration. In a real app, this would come from user data.
                const problemsWithStatus = problemsData.map(p => ({ ...p, status: 'Not Attempted' }));
                setProblems(problemsWithStatus);
            } catch (error) {
                setError('Failed to fetch problems. Please try again later.');
                console.error('Failed to fetch problems:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProblems();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading problems...</div>
    }
    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Problem Set</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {problems.length > 0 ? (
                            problems.map((problem, index) => (
                                <tr key={problem._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link to={`/problems/${problem.slug}`} className="text-indigo-600 hover:text-indigo-900">
                                            {problem.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center px-6 py-12 text-gray-500">
                                    No problems available at the moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllProblemsPage;