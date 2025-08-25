import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProblemBySlug, updateProblem } from '../api/problemApi';
import { toast } from 'react-toastify';

function EditProblemPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        difficulty: 'Easy',
        points: 10,
        tags: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await getProblemBySlug(id);
                const problemData = res.data.problem;
                setFormData({
                    name: problemData.name,
                    description: problemData.statement,
                    difficulty: problemData.difficulty,
                    points: problemData.points,
                    tags: problemData.tags ? problemData.tags.join(', ') : '',
                });
            } catch (err) {
                toast.error("Failed to load problem data.");
                console.error("Fetch problem error:", err);
                setError("Failed to load problem data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const problemPayload = {
                ...formData,
                statement: formData.description,
            };
            await updateProblem(id, problemPayload);
            toast.success('Problem updated successfully!');
            navigate('/admin/contests');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update problem.');
            console.error("Update problem error:", err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading problem...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Problem</h1>
            <p className="text-lg text-gray-600 mb-6">
                Update the problem details below. Ensure all fields are correctly filled.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                {/* Problem Details */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Problem Details</h2>
                    <div>
                        <label className="block font-medium">Problem Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block font-medium">Statement (Markdown supported)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="6" className="w-full p-2 border rounded-md" required></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Difficulty</label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full p-2 border rounded-md">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="points" className="block text-sm font-medium text-gray-700">Points</label>
                            <input type="number" name="points" id="points" value={formData.points} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g. array, string, dynamic programming"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter tags separated by commas.</p>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                        Update Problem
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProblemPage;