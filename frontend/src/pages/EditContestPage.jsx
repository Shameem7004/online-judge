// filepath: /Users/mdshameemalam/Desktop/Project/Online-Judge/frontend/src/pages/EditContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getContestDetails, updateContest } from '../api/contestApi';
import { getAllProblems } from '../api/problemApi';
import { format } from 'date-fns';

function EditContestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allProblems, setAllProblems] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contestRes, problemsRes] = await Promise.all([
                    getContestDetails(id),
                    getAllProblems()
                ]);
                
                const contestData = contestRes.data.contest;
                setFormData({
                    title: contestData.title,
                    description: contestData.description,
                    startTime: format(new Date(contestData.startTime), "yyyy-MM-dd'T'HH:mm"),
                    endTime: format(new Date(contestData.endTime), "yyyy-MM-dd'T'HH:mm"),
                    problems: contestData.problems.map(p => p._id)
                });
                setAllProblems(problemsRes.data.problems);

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load contest data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProblemSelect = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setFormData({ ...formData, problems: selectedIds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await updateContest(id, formData);
            alert('Contest updated successfully!');
            navigate('/admin/contests');
        } catch (err) {
            console.error("Failed to update contest:", err);
            setError(err.response?.data?.message || 'An error occurred while updating the contest.');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading contest data...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Contest</h1>
            <p className="text-lg text-gray-600 mb-6">
                Modify the contest details below. Ensure the timings and problems are correctly set.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input type="datetime-local" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                    <input type="datetime-local" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="problems" className="block text-sm font-medium text-gray-700">Problems</label>
                    <select
                        id="problems"
                        name="problems"
                        multiple
                        value={formData.problems}
                        onChange={handleProblemSelect}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md h-60"
                        required
                    >
                        {allProblems.map(problem => (
                            <option key={problem._id} value={problem._id}>
                                {problem.name} ({problem.difficulty})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Command (Mac) or Ctrl (Windows) to select multiple problems.</p>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                        Update Contest
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditContestPage;