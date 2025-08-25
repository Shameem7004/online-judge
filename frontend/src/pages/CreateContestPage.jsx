import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createContest } from '../api/contestApi';
import { getAllProblems } from '../api/problemApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

function CreateContestPage() {
    const navigate = useNavigate();
    const [allProblems, setAllProblems] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: [],
        contestType: 'ICPC', // ICPC, IOI, CF, etc.
        maxParticipants: '', // Optional limit
        isPublic: true,
        allowLateSubmissions: false,
        penaltyPerWrongSubmission: 20, // minutes
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedProblems, setSelectedProblems] = useState([]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await getAllProblems();
                setAllProblems(res.data.problems);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
                toast.error("Failed to load problems");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProblemToggle = (problemId) => {
        setSelectedProblems(prev => {
            const newSelected = prev.includes(problemId) 
                ? prev.filter(id => id !== problemId)
                : [...prev, problemId];
            
            setFormData({ ...formData, problems: newSelected });
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedProblems.length === allProblems.length) {
            setSelectedProblems([]);
            setFormData({ ...formData, problems: [] });
        } else {
            const allIds = allProblems.map(p => p._id);
            setSelectedProblems(allIds);
            setFormData({ ...formData, problems: allIds });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        const now = new Date();

        if (startTime <= now) {
            toast.error("Contest start time must be in the future");
            return;
        }

        if (endTime <= startTime) {
            toast.error("Contest end time must be after start time");
            return;
        }

        if (formData.problems.length === 0) {
            toast.error("Please select at least one problem for the contest");
            return;
        }

        setSubmitting(true);
        try {
            await createContest(formData);
            toast.success('Contest created successfully!');
            // FIX: Redirect to contests listing instead of admin management
            navigate('/contests');
        } catch (err) {
            console.error("Failed to create contest:", err);
            const errorMessage = err.response?.data?.message || 'An error occurred while creating the contest.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Generate default times
    const getDefaultStartTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // 10:00 AM tomorrow
        return tomorrow.toISOString().slice(0, 16);
    };

    const getDefaultEndTime = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0); // 12:00 PM tomorrow (2 hour contest)
        return tomorrow.toISOString().slice(0, 16);
    };

    // Set default times if not set
    useEffect(() => {
        if (!formData.startTime) {
            setFormData(prev => ({
                ...prev,
                startTime: getDefaultStartTime(),
                endTime: getDefaultEndTime()
            }));
        }
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Create New Contest</h1>
                    <p className="text-slate-600">Loading problems...</p>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Hard': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Contest</h1>
                <p className="text-lg text-slate-600">
                    Configure the contest details and select problems for the contest.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                                Contest Title *
                            </label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="e.g., Weekly Programming Contest #1"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                                Contest Description *
                            </label>
                            <textarea 
                                name="description" 
                                id="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="4" 
                                required
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                placeholder="Describe the contest, rules, and any special instructions..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Timing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contest Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-2">
                                    Start Time *
                                </label>
                                <input 
                                    type="datetime-local" 
                                    name="startTime" 
                                    id="startTime" 
                                    value={formData.startTime} 
                                    onChange={handleChange} 
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-2">
                                    End Time *
                                </label>
                                <input 
                                    type="datetime-local" 
                                    name="endTime" 
                                    id="endTime" 
                                    value={formData.endTime} 
                                    onChange={handleChange} 
                                    required
                                    min={formData.startTime}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                />
                            </div>
                        </div>
                        
                        {formData.startTime && formData.endTime && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                    <p><strong>Duration:</strong> {
                                        Math.round((new Date(formData.endTime) - new Date(formData.startTime)) / (1000 * 60))
                                    } minutes</p>
                                    <p><strong>Start:</strong> {new Date(formData.startTime).toLocaleString()}</p>
                                    <p><strong>End:</strong> {new Date(formData.endTime).toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contest Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contest Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contestType" className="block text-sm font-medium text-slate-700 mb-2">
                                    Contest Type
                                </label>
                                <select 
                                    name="contestType" 
                                    id="contestType" 
                                    value={formData.contestType} 
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                >
                                    <option value="ICPC">ICPC Style (Penalty-based)</option>
                                    <option value="IOI">IOI Style (Partial scoring)</option>
                                    <option value="CF">Codeforces Style</option>
                                    <option value="CUSTOM">Custom</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    Determines scoring and penalty rules
                                </p>
                            </div>

                            <div>
                                <label htmlFor="maxParticipants" className="block text-sm font-medium text-slate-700 mb-2">
                                    Max Participants <span className="text-slate-500">(Optional)</span>
                                </label>
                                <input 
                                    type="number" 
                                    name="maxParticipants" 
                                    id="maxParticipants" 
                                    value={formData.maxParticipants} 
                                    onChange={handleChange}
                                    min="1"
                                    max="10000"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="penaltyPerWrongSubmission" className="block text-sm font-medium text-slate-700 mb-2">
                                    Penalty per Wrong Submission (minutes)
                                </label>
                                <input 
                                    type="number" 
                                    name="penaltyPerWrongSubmission" 
                                    id="penaltyPerWrongSubmission" 
                                    value={formData.penaltyPerWrongSubmission} 
                                    onChange={handleChange}
                                    min="0"
                                    max="120"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Standard ICPC: 20 minutes
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Public Contest</span>
                                </label>
                                <p className="text-xs text-slate-500 ml-7">
                                    Public contests appear in the contest listing
                                </p>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="allowLateSubmissions"
                                        checked={formData.allowLateSubmissions}
                                        onChange={(e) => setFormData({...formData, allowLateSubmissions: e.target.checked})}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Allow Late Submissions</span>
                                </label>
                                <p className="text-xs text-slate-500 ml-7">
                                    Allow submissions after contest ends (for practice)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Problem Selection with Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Contest Problems & Scoring</CardTitle>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-600">
                                    {selectedProblems.length} of {allProblems.length} selected
                                </span>
                                <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                                    {selectedProblems.length === allProblems.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Problem Point Allocation */}
                        {selectedProblems.length > 0 && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-3">Problem Point Distribution</h4>
                                <div className="grid gap-3">
                                    {selectedProblems.map((problemId, index) => {
                                        const problem = allProblems.find(p => p._id === problemId);
                                        return (
                                            <div key={problemId} className="flex items-center justify-between bg-white p-3 rounded border">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-medium text-slate-600">#{index + 1}</span>
                                                    <span className="font-medium text-slate-900">{problem?.name}</span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem?.difficulty)}`}>
                                                        {problem?.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-sm text-slate-600">Points:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="1000"
                                                        defaultValue={problem?.points || 100}
                                                        className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                                        onChange={(e) => {
                                                            // Handle point changes if needed
                                                            console.log(`Problem ${problemId} points: ${e.target.value}`);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {allProblems.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No problems available. Please create some problems first.
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="text-sm text-amber-800">
                                        <p><strong>Tip:</strong> Select problems with varying difficulty levels for a balanced contest.</p>
                                        <p>Problems will appear in the contest in the order you select them.</p>
                                    </div>
                                </div>
                                
                                <div className="grid gap-3 max-h-96 overflow-y-auto">
                                    {allProblems.map(problem => (
                                        <div
                                            key={problem._id}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedProblems.includes(problem._id)
                                                    ? 'bg-indigo-50 border-indigo-200'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                            onClick={() => handleProblemToggle(problem._id)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProblems.includes(problem._id)}
                                                    onChange={() => handleProblemToggle(problem._id)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                                />
                                                <div>
                                                    <div className="font-medium text-slate-900">{problem.name}</div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                                                            {problem.difficulty}
                                                        </span>
                                                        <span className="text-sm text-slate-500">
                                                            {problem.points} points
                                                        </span>
                                                        {problem.tags && problem.tags.length > 0 && (
                                                            <span className="text-xs text-slate-400">
                                                                • {problem.tags.slice(0, 2).join(', ')}
                                                                {problem.tags.length > 2 && ` +${problem.tags.length - 2}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {selectedProblems.includes(problem._id) && (
                                                <div className="text-sm text-indigo-600 font-medium">
                                                    #{selectedProblems.indexOf(problem._id) + 1}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Contest Preview */}
                {formData.title && formData.startTime && formData.endTime && selectedProblems.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contest Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-700">Title:</span>
                                        <p className="text-slate-900">{formData.title}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Type:</span>
                                        <p className="text-slate-900">{formData.contestType}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Duration:</span>
                                        <p className="text-slate-900">
                                            {Math.round((new Date(formData.endTime) - new Date(formData.startTime)) / (1000 * 60))} minutes
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Problems:</span>
                                        <p className="text-slate-900">{selectedProblems.length}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Visibility:</span>
                                        <p className="text-slate-900">{formData.isPublic ? 'Public' : 'Private'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Max Participants:</span>
                                        <p className="text-slate-900">{formData.maxParticipants || 'Unlimited'}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="font-medium text-slate-700 block mb-2">Selected Problems:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProblems.map((id, index) => {
                                            const problem = allProblems.find(p => p._id === id);
                                            return (
                                                <span key={id} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                                    #{index + 1} {problem?.name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={submitting || selectedProblems.length === 0}
                        className="px-8 py-3 text-lg font-medium min-w-[200px]"
                    >
                        {submitting ? 'Creating Contest...' : 'Create Contest'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreateContestPage;