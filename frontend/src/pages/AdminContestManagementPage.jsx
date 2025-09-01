import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllContests, deleteContest } from '../api/contestApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaCode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FilterControls from '../components/FilterControls';

const AdminContestManagementPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const isViewOnly = new URLSearchParams(location.search).get('view') === 'true';

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    const controller = new AbortController();
    const fetchContests = async () => {
      try {
        const res = await getAllContests({ signal: controller.signal });
        
        // FIX: Changed the check from 'res.data.contests' to 'res.data.data' to match the actual API response structure.
        if (res.data && Array.isArray(res.data.data)) {
          setContests(res.data.data);
        } else {
          console.error("Invalid data structure received for contests:", res.data);
          setContests([]);
          setError('Failed to load contests due to invalid data format.');
          toast.error('Failed to load contests: Invalid data format.');
        }
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError('Failed to fetch contests.');
          toast.error('Failed to fetch contests.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
    return () => controller.abort();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ status: '' });
  };

  const handleDeleteContest = async (contestId) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        await deleteContest(contestId);
        setContests(contests.filter(c => c._id !== contestId));
        toast.success('Contest deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete contest.');
      }
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { text: 'Live', color: 'bg-red-100 text-red-800 animate-pulse' };
    } else {
      return { text: 'Ended', color: 'bg-slate-100 text-slate-800' };
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const calculateDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      const searchMatch = searchTerm === '' ||
        contest.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusInfo = getContestStatus(contest);
      const statusMatch = filters.status === '' || statusInfo.text === filters.status;

      return searchMatch && statusMatch;
    });
  }, [contests, searchTerm, filters]);

  const filterOptions = [
    { key: 'status', label: 'Filter by Status', options: [{ value: 'Live', label: 'Live' }, { value: 'Upcoming', label: 'Upcoming' }, { value: 'Ended', label: 'Ended' }] }
  ];

  if (loading) return <p className="text-center p-8">Loading contests...</p>;
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contest Management</h1>
          <p className="text-lg text-slate-600 mt-2">Manage and monitor all contests</p>
        </div>
        {!isViewOnly && (
          <Link to="/admin/create-contest">
            <Button><FaPlus className="mr-2" /> Create Contest</Button>
          </Link>
        )}
      </div>

      {!isViewOnly && (
        <FilterControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          onClear={handleClearFilters}
          filterOptions={filterOptions}
          placeholder="Search by contest title..."
        />
      )}

      {filteredContests.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No contests found.</p>
      ) : (
        <div className="space-y-6">
          {filteredContests.map((contest) => {
            const status = getContestStatus(contest);
            return (
              <Card key={contest._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-800">{contest.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{formatDate(contest.startTime)} - {formatDate(contest.endTime)}</p>
                    </div>
                    {!isViewOnly && (
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/edit-contest/${contest._id}`}>
                          <Button variant="outline" size="sm"><FaEdit /></Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteContest(contest._id)}><FaTrash /></Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Status: </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>{status.text}</span>
                    </div>
                    <div><span className="font-semibold">Duration: </span>{calculateDuration(contest.startTime, contest.endTime)}</div>
                    <div className="flex items-center gap-1"><FaCode className="text-slate-500" /> {contest.problems.length} Problems</div>
                    <div className="flex items-center gap-1"><FaUsers className="text-slate-500" /> {contest.participants?.length || 0} Participants</div>
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