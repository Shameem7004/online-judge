import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getGroupedSubmissions, deleteSubmission, toggleSubmissionFlag } from '../api/adminApi';
import { FaFlag, FaTrash, FaCheck, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FilterControls from '../components/FilterControls'; // Import the new component

const AdminAllSubmissionsPage = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const isViewOnly = new URLSearchParams(location.search).get('view') === 'true';

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ verdict: '', language: '' });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await getGroupedSubmissions();
        setGroupedData(res.data.data);
      } catch (err) {
        setError('Failed to fetch submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ verdict: '', language: '' });
  };

  const handleToggleFlag = async (submissionId) => {
    try {
      const res = await toggleSubmissionFlag(submissionId);
      const updatedData = groupedData.map(group => ({
        ...group,
        submissions: group.submissions.map(s => 
          s._id === submissionId ? { ...s, isFlagged: res.data.isFlagged } : s
        )
      }));
      setGroupedData(updatedData);
      toast.success(`Submission ${res.data.isFlagged ? 'flagged' : 'unflagged'}.`);
    } catch (err) {
      toast.error('Failed to update flag status.');
    }
  };

  const handleDelete = async (submissionId) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteSubmission(submissionId);
        const updatedData = groupedData.map(group => ({
          ...group,
          submissions: group.submissions.filter(s => s._id !== submissionId)
        })).filter(group => group.submissions.length > 0);
        setGroupedData(updatedData);
        toast.success('Submission deleted.');
      } catch (err) {
        toast.error('Failed to delete submission.');
      }
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  // Memoized filtering logic for submissions
  const filteredGroupedData = useMemo(() => {
    if (!groupedData) return [];

    const lowerCaseSearch = searchTerm.toLowerCase();

    return groupedData.map(group => {
      // First, filter the submissions within the group
      const filteredSubmissions = group.submissions.filter(sub => {
        const verdictMatch = filters.verdict === '' || sub.verdict === filters.verdict;
        const langMatch = filters.language === '' || sub.language === filters.language;
        return verdictMatch && langMatch;
      });

      // If no submissions remain after filtering, this group is out
      if (filteredSubmissions.length === 0) {
        return null;
      }

      // Then, check if the group itself matches the search term
      const userMatch = group.user.username.toLowerCase().includes(lowerCaseSearch);
      const problemMatch = filteredSubmissions.some(sub => 
        sub.problem?.name.toLowerCase().includes(lowerCaseSearch) ||
        sub.problem?._id.toLowerCase().includes(lowerCaseSearch)
      );

      if (searchTerm === '' || userMatch || problemMatch) {
        return { ...group, submissions: filteredSubmissions };
      }

      return null;
    }).filter(Boolean); // Remove null groups

  }, [groupedData, searchTerm, filters]);

  const filterOptions = [
    { key: 'verdict', label: 'Filter by Verdict', options: [{ value: 'Accepted', label: 'Accepted' }, { value: 'Wrong Answer', label: 'Wrong Answer' }, { value: 'Time Limit Exceeded', label: 'TLE' }, { value: 'Runtime Error', label: 'Runtime Error' }, { value: 'Compilation Error', label: 'Compilation Error' }] },
    { key: 'language', label: 'Filter by Language', options: [{ value: 'cpp', label: 'C++' }, { value: 'java', label: 'Java' }, { value: 'python', label: 'Python' }, { value: 'javascript', label: 'JavaScript' }] }
  ];

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Submissions Management</h1>
        <p className="text-lg text-slate-600 mt-2">
          Review and manage all submissions from all users.
        </p>
      </div>
      {!isViewOnly && (
        <FilterControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          onClear={handleClearFilters}
          filterOptions={filterOptions}
          placeholder="Search by user, problem name, or ID..."
        />
      )}

      <div className="space-y-6">
        {filteredGroupedData.map(({ user, submissions }) => (
          <Card key={user._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaUser /> {user.username} <span className="text-sm font-normal text-slate-500">({user._id})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Problem</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Verdict</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      {!isViewOnly && (
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {submissions.map(sub => (
                      <tr key={sub._id} className={`hover:bg-slate-50 ${sub.isFlagged ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">
                          <div>{sub.problem?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500 font-mono">{sub.problem?._id}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{sub.verdict}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{formatDate(sub.createdAt)}</td>
                        {!isViewOnly && (
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Link to={`/submissions/${sub._id}`} className="text-indigo-600 hover:underline">View</Link>
                            <button onClick={() => handleToggleFlag(sub._id)} className={`p-2 rounded-full ${sub.isFlagged ? 'bg-yellow-500 text-white' : 'bg-slate-200 text-slate-600'} hover:opacity-80`}>
                              {sub.isFlagged ? <FaCheck /> : <FaFlag />}
                            </button>
                            <button onClick={() => handleDelete(sub._id)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAllSubmissionsPage;