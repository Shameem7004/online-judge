import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProblems } from '../api/problemApi';
import { getAllContests } from '../api/contestApi';
import { getLeaderboard } from '../api/userApi';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaTrophy, FaArrowRight, FaPlay, FaClock, FaFire, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';

// --- HERO SECTION (dynamic, interactive) ---
function HomeHero() {
  const [stats, setStats] = useState({ problems: 0, contests: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const [problemsRes, contestsRes, usersRes] = await Promise.all([
          getAllProblems({ page: 1, limit: 1 }),
          getAllContests(),
          getLeaderboard()
        ]);
        setStats({
          problems: problemsRes.data.pagination?.totalProblems || problemsRes.data.count || 0,
          contests: contestsRes.data.contests?.length || contestsRes.data.data?.length || 0,
          users: usersRes.data.leaderboard?.length || 0
        });
      } catch {
        setStats({ problems: 0, contests: 0, users: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleStartSolving = () => {
    navigate('/problems');
  };

  const handleContestPage = () => {
    navigate('/contests');
  };

  return (
    <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-24 flex flex-col items-center text-center space-y-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg text-white">
          Master Your <span className="text-gradient bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">Coding Skills</span>
        </h1>
        <p className="text-lg sm:text-2xl text-indigo-100 max-w-2xl mx-auto font-medium drop-shadow">
          Practice algorithms, compete in contests, and join a vibrant community of passionate programmers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white hover:from-yellow-500 hover:to-indigo-600 font-semibold px-10 py-4 flex items-center justify-center shadow-lg transition cursor-pointer"
            onClick={handleStartSolving}
            disabled={loading}
          >
            <FaPlay className="mr-2" />
            Start Solving
          </Button>
          <Button
            size="lg"
            className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold px-10 py-4 flex items-center justify-center shadow-lg transition cursor-pointer"
            onClick={handleContestPage}
            disabled={loading}
          >
            <FaTrophy className="mr-2" />
            Join Contest
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 w-full">
          <StatCard icon={<FaPlay />} label="Practice Problems" value={stats.problems} loading={loading} />
          <StatCard icon={<FaTrophy />} label="Weekly Contests" value={stats.contests} loading={loading} />
          <StatCard icon={<FaUsers />} label="Active Users" value={stats.users} loading={loading} />
        </div>
      </div>
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
    </section>
  );
}

function StatCard({ icon, label, value, loading }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-xl p-6 shadow-md">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold">{loading ? '...' : value}</div>
      <div className="text-indigo-100 font-medium">{label}</div>
    </div>
  );
}

// Enhanced Problem Card
const ProblemCard = ({ problem, index }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-indigo-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-semibold text-slate-500">#{index + 1}</div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {problem.name}
        </h3>
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {problem.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                {tag}
              </span>
            ))}
            {problem.tags.length > 3 && (
              <span className="text-xs text-slate-400 px-2 py-1">
                +{problem.tags.length - 3}
              </span>
            )}
          </div>
        )}
        <Link
          to={`/problems/${problem.slug}`}
          className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm cursor-pointer transition"
        >
          Solve Problem <FaArrowRight className="ml-2 w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  );
};

// Enhanced Contest Card
const ContestCard = ({ contest }) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  const getStatus = () => {
    if (now < start) return { label: 'Upcoming', color: 'blue', icon: FaClock };
    if (now > end) return { label: 'Ended', color: 'gray', icon: FaTrophy };
    return { label: 'Live', color: 'red', icon: FaFire };
  };

  const status = getStatus();

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
            {contest.title}
          </h3>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            status.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            <status.icon className="w-3 h-3 mr-1" />
            {status.label}
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{contest.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {format(start, 'MMM d, h:mm a')}
          </div>
          <Link to={`/contests/${contest._id}`} className="text-pink-600 hover:text-pink-700 font-medium text-sm cursor-pointer transition">
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Homepage Component
function HomePage() {
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ problems: 0, contests: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [problemsRes, contestsRes, leaderboardRes] = await Promise.all([
          getAllProblems(),
          getAllContests(),
          getLeaderboard()
        ]);
        setProblems(problemsRes.data.problems?.slice(0, 6) || []);
        setContests(contestsRes.data.contests?.slice(0, 3) || contestsRes.data.data?.slice(0, 3) || []);
        setLeaderboard(leaderboardRes.data.leaderboard?.slice(0, 5) || []);
        setStats({
          problems: problemsRes.data.pagination?.totalProblems || problemsRes.data.count || problemsRes.data.problems?.length || 0,
          contests: contestsRes.data.contests?.length || contestsRes.data.data?.length || 0,
          users: leaderboardRes.data.leaderboard?.length || 0
        });
      } catch (error) {
        setStats({ problems: 0, contests: 0, users: 0 });
        setProblems([]);
        setContests([]);
        setLeaderboard([]);
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomeHero />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HomeHero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-16">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Featured Problems</h2>
                  <p className="text-slate-600 mt-2">Start with these carefully selected challenges</p>
                </div>
                <Link to="/problems" className="cursor-pointer">
                  <Button variant="outline" className="transition hover:bg-indigo-50">
                    View All Problems
                    <FaArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {problems.map((problem, index) => (
                  <ProblemCard key={problem._id} problem={problem} index={index} />
                ))}
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Active Contests</h2>
                  <p className="text-slate-600 mt-2">Join live competitions and climb the leaderboard</p>
                </div>
                <Link to="/contests" className="cursor-pointer">
                  <Button variant="outline" className="transition hover:bg-pink-50">
                    View All Contests
                    <FaArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map((contest) => (
                  <ContestCard key={contest._id} contest={contest} />
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:w-[350px] w-full flex flex-col">
            <div className="sticky top-28">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Top Performers</h2>
                  <p className="text-slate-600 mt-2 text-sm">See who's leading the community</p>
                </div>
                <Link to="/leaderboard" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="transition hover:bg-yellow-50">
                    View All
                    <FaArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <Card className="shadow-lg border-2 border-yellow-100">
                <CardContent className="p-0">
                  {leaderboard.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-6 border-b border-slate-100 last:border-b-0 hover:bg-yellow-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-100 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.username}</div>
                          <div className="text-sm text-slate-500">{user.problemsSolved} problems solved</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-slate-900">{user.totalScore}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default HomePage;