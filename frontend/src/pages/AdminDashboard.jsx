import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FaUsers, FaCode, FaTrophy, FaChartLine, FaListAlt } from 'react-icons/fa';

const StatsOverview = ({ stats, loading }) => {
  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-blue-600', bgColor: 'bg-blue-100', link: '/admin/users?view=true' },
    { title: 'Total Problems', value: stats.totalProblems, icon: FaCode, color: 'text-green-600', bgColor: 'bg-green-100', link: '/admin/problems?view=true' },
    { title: 'Active Contests', value: stats.activeContests, icon: FaTrophy, color: 'text-purple-600', bgColor: 'bg-purple-100', link: '/admin/contests?view=true' },
    { title: 'Total Submissions', value: stats.totalSubmissions, icon: FaChartLine, color: 'text-orange-600', bgColor: 'bg-orange-100', link: '/admin/submissions?view=true' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Link to={stat.link} key={index} className="block hover:no-underline">
          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stat.value ?? 0}</p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const QuickActions = () => {
  const actions = [
    { title: 'Manage Problems', description: 'Create, edit, and manage problems', icon: FaListAlt, color: 'bg-green-600 hover:bg-green-700', link: '/admin/problems' },
    { title: 'Manage Contests', description: 'Set up, monitor, and manage contests', icon: FaTrophy, color: 'bg-purple-600 hover:bg-purple-700', link: '/admin/contests' },
    { title: 'Manage Users', description: 'View and manage all platform users', icon: FaUsers, color: 'bg-blue-600 hover:bg-blue-700', link: '/admin/users' },
    { title: 'Manage Submissions', description: 'Review and moderate all submissions', icon: FaChartLine, color: 'bg-orange-600 hover:bg-orange-700', link: '/admin/submissions' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Management Actions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link key={index} to={action.link}>
              <div className={`${action.color} text-white p-6 rounded-lg text-center hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col justify-center`}>
                <action.icon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getDashboardStats({ signal: controller.signal });
        if (!controller.signal.aborted) setStats(response.data.stats);
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Could not load dashboard data.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchStats();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-lg text-slate-600 mt-1">Welcome back, Admin! Here's an overview of your platform.</p>
      </div>
      {error ? <div className="text-center p-8 text-red-500">{error}</div> : <StatsOverview stats={stats} loading={loading} />}
      <QuickActions />
    </div>
  );
}

export default AdminDashboard;