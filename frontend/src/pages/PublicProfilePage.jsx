import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FaUser, FaCode, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe, FaClock } from 'react-icons/fa';

// Public Profile Stats Component
const PublicProfileStats = ({ user, submissions }) => {
  const stats = [
    {
      icon: FaCode,
      label: 'Problems Solved',
      value: user.problemsSolved || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: FaTrophy,
      label: 'Total Points',
      value: user.totalPoints || 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: FaCalendarAlt,
      label: 'Contests Attended',
      value: user.contestsAttended || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: FaClock,
      label: 'Member Since',
      value: new Date(user.createdAt).getFullYear(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-6">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Submission Stats Component
const SubmissionStats = ({ submissions }) => {
  const stats = submissions.reduce((acc, submission) => {
    acc.total++;
    if (submission.status === 'Accepted') acc.accepted++;
    else if (submission.status === 'Wrong Answer') acc.wrongAnswer++;
    else acc.other++;
    return acc;
  }, { total: 0, accepted: 0, wrongAnswer: 0, other: 0 });

  const acceptanceRate = stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{acceptanceRate}%</div>
            <div className="text-sm text-gray-600">Acceptance Rate</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accepted</span>
              <span className="font-medium text-green-600">{stats.accepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Wrong Answer</span>
              <span className="font-medium text-red-600">{stats.wrongAnswer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Other</span>
              <span className="font-medium text-gray-600">{stats.other}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Submissions</span>
              <span className="font-bold text-gray-900">{stats.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Public Profile Component
function PublicProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data
        setUser({
          _id: '1',
          username: username,
          firstname: 'John',
          lastname: 'Doe',
          bio: 'Passionate software developer with 5+ years of experience. Love solving algorithmic problems and participating in competitive programming.',
          location: 'San Francisco, CA',
          website: 'https://johndoe.dev',
          github: 'johndoe',
          linkedin: 'johndoe',
          problemsSolved: 150,
          totalPoints: 2850,
          contestsAttended: 12,
          createdAt: '2023-01-15T00:00:00.000Z'
        });

        // Mock submissions data
        setSubmissions([
          { status: 'Accepted', problem: 'Two Sum', submittedAt: '2024-01-01' },
          { status: 'Wrong Answer', problem: 'Binary Search', submittedAt: '2024-01-02' },
          { status: 'Accepted', problem: 'Merge Sort', submittedAt: '2024-01-03' },
          // Add more mock data as needed
        ]);
      } catch (err) {
        setError('Failed to load user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600">{error || 'The requested user profile could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.firstname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.username}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center space-x-4 mt-4">
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    <FaGlobe className="w-5 h-5" />
                  </a>
                )}
                {user.github && (
                  <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    <FaGithub className="w-5 h-5" />
                  </a>
                )}
                {user.linkedin && (
                  <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Stats */}
      <div className="mb-8">
        <PublicProfileStats user={user} submissions={submissions} />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SubmissionStats submissions={submissions} />
        
        {/* Recent Activity would go here */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FaCode className="mx-auto h-8 w-8 mb-2" />
              <p>Recent activity data not available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example for headings and text in any page */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        My Submissions
      </h1>
      <p className="text-lg text-gray-600">
        Your submission history, grouped by problem
      </p>
    </div>
  );
}

export default PublicProfilePage;