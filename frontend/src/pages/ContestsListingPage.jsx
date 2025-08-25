import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAllContests } from '../api/contestApi';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { FaTrophy, FaUsers, FaClock, FaFire, FaCalendarAlt, FaPlay, FaCheckCircle, FaFilter, FaPlus, FaCog } from 'react-icons/fa';

// Enhanced Contest Status Component
const ContestStatus = ({ contest }) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  
  if (isBefore(now, start)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-blue-700 font-semibold text-sm">Upcoming</span>
      </div>
    );
  } else if (isAfter(now, end)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        <span className="text-gray-600 font-semibold text-sm">Ended</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-red-700 font-semibold text-sm">Live</span>
      </div>
    );
  }
};

// Enhanced Contest Card Component
const EnhancedContestCard = ({ contest }) => {
  const { user } = useContext(AuthContext);
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isRegistered = user && contest.participants?.includes(user._id);
  
  const getContestDuration = () => {
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTimeDisplay = () => {
    if (isBefore(now, start)) {
      return {
        label: 'Starts',
        time: formatDistanceToNow(start, { addSuffix: true }),
        color: 'text-blue-600'
      };
    } else if (isAfter(now, end)) {
      return {
        label: 'Ended',
        time: formatDistanceToNow(end, { addSuffix: true }),
        color: 'text-gray-600'
      };
    } else {
      return {
        label: 'Ends',
        time: formatDistanceToNow(end, { addSuffix: true }),
        color: 'text-red-600'
      };
    }
  };

  const timeInfo = getTimeDisplay();

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                {contest.title}
              </h3>
              <ContestStatus contest={contest} />
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">{contest.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contest Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaUsers className="w-4 h-4" />
            <span>{contest.participants?.length || 0} participants</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaClock className="w-4 h-4" />
            <span>{getContestDuration()}</span>
          </div>
        </div>

        {/* Time Information */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{timeInfo.label}</div>
              <div className={`font-semibold ${timeInfo.color}`}>{timeInfo.time}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Start Date</div>
              <div className="text-sm font-medium text-gray-900">
                {format(start, 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-gray-500">
                {format(start, 'h:mm a')}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Status */}
        {isRegistered && (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 p-2 rounded-lg">
            <FaCheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">You're registered!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Link to={`/contests/${contest._id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {isBefore(now, end) && (
            <Link to={`/contests/${contest._id}`} className="flex-1">
              <Button className="w-full">
                <FaPlay className="mr-2 w-4 h-4" />
                {isBefore(now, start) ? 'Register' : 'Enter Contest'}
              </Button>
            </Link>
          )}
          {isAfter(now, end) && (
            <Link to={`/contests/${contest._id}/leaderboard`} className="flex-1">
              <Button variant="outline" className="w-full">
                <FaTrophy className="mr-2 w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Filter Component
const ContestFilters = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Contests' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live' },
    { value: 'ended', label: 'Ended' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <FaFilter className="mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Contest Listing Component
function ContestsListingPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchContests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await getAllContests({ signal });
        
        if (!signal.aborted) {
          // FIX: Correctly access data and ensure it's an array
          const contestsData = res.data?.data || res.data?.contests || res.data || [];
          setContests(Array.isArray(contestsData) ? contestsData : []);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          // This log is for debugging cancellations and can be kept or removed
          // console.log('Request canceled:', err.message);
        } else if (!signal.aborted) {
          setError('Failed to fetch contests. Please try again later.');
          console.error('Failed to fetch contests:', err);
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

  const groupContests = () => {
    const now = new Date();
    
    const liveContests = contests.filter(contest => {
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);
      return isAfter(now, start) && isBefore(now, end);
    });
    
    const upcomingContests = contests.filter(contest => {
      const start = new Date(contest.startTime);
      return isBefore(now, start);
    });
    
    const endedContests = contests.filter(contest => {
      const end = new Date(contest.endTime);
      return isAfter(now, end);
    });
    
    return { live: liveContests, upcoming: upcomingContests, ended: endedContests };
  };

  const groupedContests = groupContests();

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredContests = contests.filter(contest => {
    if (filters.status === 'all') return true;
    
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    
    switch (filters.status) {
      case 'upcoming':
        return isBefore(now, start);
      case 'live':
        return isAfter(now, start) && isBefore(now, end);
      case 'ended':
        return isAfter(now, end);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Programming Contests
            </h1>
            <p className="text-lg text-gray-600">
              Compete with developers worldwide and showcase your skills
            </p>
          </div>
          
          {/* Admin Controls - REMOVED Manage Contests button */}
          {user && user.role === 'admin' && (
            <div className="flex gap-3">
              <Link to="/admin/create-contest">
                <Button>
                  <FaPlus className="mr-2" /> Create Contest
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 mb-8 lg:mb-0">
          <ContestFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Contests List */}
        <div className="lg:col-span-3 space-y-8">
          {/* Live Contests */}
          {groupedContests.live.length > 0 && (filters.status === 'all' || filters.status === 'live') && (
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <FaFire className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">Live Contests</h2>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {groupedContests.live.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {groupedContests.live.map(contest => (
                  <EnhancedContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Contests */}
          {groupedContests.upcoming.length > 0 && (filters.status === 'all' || filters.status === 'upcoming') && (
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <FaCalendarAlt className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Contests</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {groupedContests.upcoming.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {groupedContests.upcoming.map(contest => (
                  <EnhancedContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            </section>
          )}

          {/* Past Contests */}
          {groupedContests.ended.length > 0 && (filters.status === 'all' || filters.status === 'ended') && (
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <FaTrophy className="w-6 h-6 text-gray-500" />
                <h2 className="text-2xl font-bold text-gray-900">Past Contests</h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {groupedContests.ended.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedContests.ended.map(contest => (
                  <EnhancedContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredContests.length === 0 && (
            <div className="text-center py-16">
              <FaTrophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No contests found</h3>
              <p className="text-gray-600">
                {filters.status === 'all' 
                  ? "There are no contests available at the moment."
                  : `No ${filters.status} contests found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContestsListingPage;