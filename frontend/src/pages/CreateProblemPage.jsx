import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProblem } from '../api/problemApi';
import Button from '../components/ui/Button';

function CreateProblemPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        statement: '',
        difficulty: 'Easy',
        points: 10,
        tags: '',
        topics: '',
        inputFormat: '',
        outputFormat: '',
        timeLimit: 1000,
        memoryLimit: 256,
        customConstraints: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'number' ? Number(value) : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const problemPayload = {
                name: formData.name,
                statement: formData.statement,
                difficulty: formData.difficulty,
                points: formData.points,
                inputFormat: formData.inputFormat,
                outputFormat: formData.outputFormat,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                topics: formData.topics.split(',').map(topic => topic.trim()).filter(Boolean),
                constraints: {
                    timeLimit: formData.timeLimit,
                    memoryLimit: formData.memoryLimit,
                    custom: formData.customConstraints || undefined
                }
            };
            
            const res = await createProblem(problemPayload);
            const problemId = res.data.problem._id;
            navigate(`/admin/problems/${problemId}/testcases`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Create New Problem</h1>
            {error && (
                <div className="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded relative mb-4" role="alert">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
                {/* Basic Information */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                Problem Name *
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="e.g., Two Sum"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-2">
                                Difficulty *
                            </label>
                            <select 
                                name="difficulty" 
                                id="difficulty" 
                                value={formData.difficulty} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="statement" className="block text-sm font-medium text-slate-700 mb-2">
                            Problem Statement * <span className="text-slate-500">(Markdown supported)</span>
                        </label>
                        <textarea 
                            name="statement" 
                            id="statement" 
                            rows="10" 
                            value={formData.statement} 
                            onChange={handleChange} 
                            required 
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            placeholder="Describe the problem in detail..."
                        />
                    </div>
                </div>

                {/* Input/Output Format */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Input/Output Format
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="inputFormat" className="block text-sm font-medium text-slate-700 mb-2">
                                Input Format *
                            </label>
                            <textarea 
                                name="inputFormat" 
                                id="inputFormat" 
                                rows="4" 
                                value={formData.inputFormat} 
                                onChange={handleChange} 
                                required 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="Describe the input format..."
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="outputFormat" className="block text-sm font-medium text-slate-700 mb-2">
                                Output Format *
                            </label>
                            <textarea 
                                name="outputFormat" 
                                id="outputFormat" 
                                rows="4" 
                                value={formData.outputFormat} 
                                onChange={handleChange} 
                                required 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="Describe the output format..."
                            />
                        </div>
                    </div>
                </div>

                {/* Constraints and Limits */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Constraints & Limits
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="points" className="block text-sm font-medium text-slate-700 mb-2">
                                Points *
                            </label>
                            <input 
                                type="number" 
                                name="points" 
                                id="points" 
                                value={formData.points} 
                                onChange={handleChange} 
                                required 
                                min="1"
                                max="1000"
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="timeLimit" className="block text-sm font-medium text-slate-700 mb-2">
                                Time Limit (ms)
                            </label>
                            <input 
                                type="number" 
                                name="timeLimit" 
                                id="timeLimit" 
                                value={formData.timeLimit} 
                                onChange={handleChange} 
                                min="100"
                                max="10000"
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            />
                            <p className="text-xs text-slate-500 mt-1">Default: 1000ms</p>
                        </div>
                        
                        <div>
                            <label htmlFor="memoryLimit" className="block text-sm font-medium text-slate-700 mb-2">
                                Memory Limit (MB)
                            </label>
                            <input 
                                type="number" 
                                name="memoryLimit" 
                                id="memoryLimit" 
                                value={formData.memoryLimit} 
                                onChange={handleChange} 
                                min="64"
                                max="1024"
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            />
                            <p className="text-xs text-slate-500 mt-1">Default: 256MB</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="customConstraints" className="block text-sm font-medium text-slate-700 mb-2">
                            Additional Constraints <span className="text-slate-500">(Optional)</span>
                        </label>
                        <textarea 
                            name="customConstraints" 
                            id="customConstraints" 
                            rows="3" 
                            value={formData.customConstraints} 
                            onChange={handleChange} 
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                            placeholder="e.g., 1 ≤ N ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
                        />
                    </div>
                </div>

                {/* Tags and Topics */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                        Classification
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                                Tags <span className="text-slate-500">(comma-separated)</span>
                            </label>
                            <input 
                                type="text" 
                                name="tags" 
                                id="tags" 
                                value={formData.tags} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="e.g., array, hash-table, easy"
                            />
                            <p className="text-xs text-slate-500 mt-1">Used for filtering and categorization</p>
                        </div>
                        
                        <div>
                            <label htmlFor="topics" className="block text-sm font-medium text-slate-700 mb-2">
                                Topics <span className="text-slate-500">(comma-separated)</span>
                            </label>
                            <input 
                                type="text" 
                                name="topics" 
                                id="topics" 
                                value={formData.topics} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="e.g., data structures, algorithms, dynamic programming"
                            />
                            <p className="text-xs text-slate-500 mt-1">Main algorithmic concepts</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <Button
                        type="submit" 
                        disabled={loading} 
                        className="px-8 py-3 text-lg font-medium min-w-[200px]"
                    >
                        {loading ? 'Creating...' : 'Create Problem & Add Test Cases'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreateProblemPage;
