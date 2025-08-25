import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContestDetails, registerForContest } from '../api/contestApi';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { toast } from 'react-toastify';
import { FaTrophy, FaUsers, FaClock, FaCode, FaCheckCircle, FaCalendarAlt, FaPlay, FaInfo } from 'react-icons/fa';

// Enhanced Countdown Timer
const CountdownTimer = ({ targetDate, prefix = "", onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Expired');
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
      <div className="text-center">
        <div className="text-sm font-medium opacity-90 mb-2">{prefix}</div>
        <div className="text-3xl font-bold font-mono">{timeLeft}</div>
      </div>
    </div>
  );
};

// Contest Problems List
const ContestProblems = ({ problems, contestStarted, contestEnded }) => {
  if (!problems || problems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FaCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Problems Available</h3>
          <p className="text-gray-600">Problems will be revealed when the contest starts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FaCode className="mr-2" />
          Contest Problems
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problems.map((problem, index) => (
            <div 
              key={problem._id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {String.fromCharCode(65 + index)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{problem.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{problem.points} points</span>
                  </div>
                </div>
              </div>
              
              {contestStarted && !contestEnded ? (
                <Link to={`/problems/${problem.slug}`}>
                  <Button size="sm">
                    Solve
                  </Button>
                </Link>
              ) : (
                <Button size="sm" disabled>
                  {contestEnded ? 'Ended' : 'Locked'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Contest Stats Component
const ContestStats = ({ contest }) => {
  const stats = [
    {
      icon: FaUsers,
      label: 'Participants',
      value: contest.participants?.length || 0,
      color: 'text-blue-600'
    },
    {
      icon: FaCode,
      label: 'Problems',
      value: contest.problems?.length || 0,
      color: 'text-green-600'
    },
    {
      icon: FaClock,
      label: 'Duration',
      value: (() => {
        const duration = new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      })(),
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-6">
            <stat.icon className={`mx-auto h-8 w-8 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Main Contest Detail Component
const ContestDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const res = await getContestDetails(id);
        const contestData = res.data.data;
        setContest(contestData);

        if (user && contestData.participants.includes(user._id)) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        setError('Failed to load contest details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please log in to register for contests.');
      return;
    }

    try {
      setRegistering(true);
      await registerForContest(id);
      setIsRegistered(true);
      setContest(prev => ({
        ...prev,
        participants: [...(prev.participants || []), user._id]
      }));
      toast.success("You have successfully registered for the contest!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contest Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link to="/contests">
            <Button>Back to Contests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const contestStarted = isAfter(now, start);
  const contestEnded = isAfter(now, end);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{contest.title}</h1>
            <p className="text-lg text-gray-600">{contest.description}</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            {!contestEnded && (
              <Link to={`/contests/${contest._id}/leaderboard`}>
                <Button variant="outline">
                  <FaTrophy className="mr-2" />
                  Leaderboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Contest Stats */}
        <ContestStats contest={contest} />
      </div>

      {/* Countdown Timer */}
      <div className="mb-8">
        {!contestStarted ? (
          <CountdownTimer 
            targetDate={contest.startTime} 
            prefix="Contest starts in:" 
          />
        ) : !contestEnded ? (
          <CountdownTimer 
            targetDate={contest.endTime} 
            prefix="Contest ends in:" 
          />
        ) : (
          <div className="bg-gray-100 text-gray-700 p-6 rounded-xl text-center">
            <div className="text-lg font-semibold">Contest Ended</div>
            <div className="text-sm opacity-75 mt-1">
              Ended {formatDistanceToNow(end, { addSuffix: true })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaInfo className="mr-2" />
                Contest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Start Time</h4>
                  <p className="text-gray-600">
                    {format(start, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(start, 'h:mm a')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">End Time</h4>
                  <p className="text-gray-600">
                    {format(end, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(end, 'h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contest Problems */}
          <ContestProblems 
            problems={contest.problems} 
            contestStarted={contestStarted}
            contestEnded={contestEnded}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent>
              {isRegistered ? (
                <div className="text-center">
                  <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Registered!</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    You're all set for this contest. Good luck!
                  </p>
                  {contestStarted && !contestEnded && (
                    <Button className="w-full">
                      <FaPlay className="mr-2" />
                      Enter Contest
                    </Button>
                  )}
                </div>
              ) : !contestEnded ? (
                <div className="text-center">
                  <FaUsers className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Contest</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Register now to participate in this contest.
                  </p>
                  <Button 
                    onClick={handleRegister}
                    loading={registering}
                    className="w-full"
                    disabled={contestEnded}
                  >
                    Register Now
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contest Ended</h3>
                  <p className="text-gray-600 text-sm">
                    This contest has ended. Check out the leaderboard to see the results.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">Rated Contest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium">ICPC Style</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">Multi-language</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailPage;