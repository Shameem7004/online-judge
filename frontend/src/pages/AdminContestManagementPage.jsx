import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllContests, deleteContest } from '../api/contestApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminContestManagementPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchContests = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getAllContests({ signal });
        
        if (!signal.aborted) {
          // FIX: Correctly access the contest array from response.data.data
          const contestsData = response.data?.data || response.data?.contests || [];
          setContests(Array.isArray(contestsData) ? contestsData : []);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          console.log('Request canceled:', err.message);
        } else if (!signal.aborted) {
          console.error('Error fetching contests:', err);
          setError('Failed to load contests. Please try again.');
          setContests([]);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchContests();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm('Are you sure you want to delete this contest? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteContest(contestId);
      setContests(prevContests => prevContests.filter(contest => contest._id !== contestId));
      toast.success('Contest deleted successfully');
    } catch (err) {
      console.error('Error deleting contest:', err);
      toast.error(err.response?.data?.message || 'Failed to delete contest');
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return { color: 'bg-blue-100 text-blue-700', text: 'Upcoming' };
    if (now >= start && now <= end) return { color: 'bg-emerald-100 text-emerald-700', text: 'Active' };
    return { color: 'bg-slate-100 text-slate-700', text: 'Ended' };
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const calculateDuration = (start, end) => {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60); // minutes
    const hours = Math.floor(duration / 60);
    const minutes = Math.round(duration % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="text-center p-8">Loading contests...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contest Management</h1>
          <p className="text-lg text-slate-600 mt-2">Manage and monitor all contests</p>
        </div>
        <Link to="/admin/create-contest">
          <Button><FaPlus className="mr-2" /> Create Contest</Button>
        </Link>
      </div>

      {contests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-500 text-lg mb-4">No contests found</div>
            <p className="text-slate-400 mb-6">Create your first contest to get started</p>
            <Link to="/admin/create-contest"><Button><FaPlus className="mr-2" /> Create Your First Contest</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contests.map((contest) => {
            const statusInfo = getContestStatus(contest);
            return (
              <Card key={contest._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{contest.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                      </div>
                      <p className="text-slate-600 mb-4 line-clamp-2">{contest.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link to={`/contests/${contest._id}`}><Button variant="outline" size="sm"><FaEye className="mr-1" /> View</Button></Link>
                      <Link to={`/admin/edit-contest/${contest._id}`}><Button variant="outline" size="sm"><FaEdit className="mr-1" /> Edit</Button></Link>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteContest(contest._id)}><FaTrash className="mr-1" /> Delete</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-slate-600"><FaClock className="mr-2" /><div><div className="font-medium">Start Time</div><div>{formatDate(contest.startTime)}</div></div></div>
                    <div className="flex items-center text-slate-600"><FaClock className="mr-2" /><div><div className="font-medium">Duration</div><div>{calculateDuration(contest.startTime, contest.endTime)}</div></div></div>
                    <div className="flex items-center text-slate-600"><FaUsers className="mr-2" /><div><div className="font-medium">Participants</div><div>{contest.participants?.length || 0}</div></div></div>
                    <div className="flex items-center text-slate-600"><div className="mr-2">📝</div><div><div className="font-medium">Problems</div><div>{contest.problems?.length || 0}</div></div></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminContestManagementPage;