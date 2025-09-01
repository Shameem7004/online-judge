import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile } from '../api/userApi';
import { getMySubmissions } from '../api/submissionApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaUser, FaCode, FaTrophy, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaGithub, FaLinkedin, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Enhanced Profile Stats Component
const ProfileStats = ({ submissions }) => {
  // Only accepted submissions
  const acceptedSubs = submissions.filter(sub => sub.verdict === 'Accepted');

  // Map to store first accepted submission per problem
  const firstAcceptedMap = new Map();
  acceptedSubs.forEach(sub => {
    const problemId = sub.problem?._id || sub.problem;
    // Only add if not already present (first accepted only)
    if (!firstAcceptedMap.has(problemId)) {
      firstAcceptedMap.set(problemId, sub);
    }
  });

  // Problems solved is the number of unique problems with accepted submission
  const problemsSolved = firstAcceptedMap.size;

  // Total points: sum points for first accepted submission per problem
  const totalPoints = Array.from(firstAcceptedMap.values()).reduce(
    (sum, sub) => sum + (sub.problem?.points || 0),
    0
  );

  // Contests attended: count unique contest IDs from accepted submissions
  const contestsAttended = new Set(
    Array.from(firstAcceptedMap.values())
      .filter(sub => sub.contest)
      .map(sub => sub.contest)
  ).size;

  const stats = [
    {
      icon: FaCode,
      label: 'Problems Solved',
      value: problemsSolved,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: FaTrophy,
      label: 'Total Points',
      value: totalPoints,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: FaCalendarAlt,
      label: 'Contests Attended',
      value: contestsAttended,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: FaCode,
      label: 'Total Submissions',
      value: submissions.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center hover:shadow-md transition-shadow">
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

// Activity Heatmap Component
const ActivityHeatmap = ({ submissions }) => {
  const [heatmapData, setHeatmapData] = useState({});

  useEffect(() => {
    if (submissions) {
      const data = {};
      submissions.forEach(submission => {
        const date = new Date(submission.createdAt).toDateString();
        data[date] = (data[date] || 0) + 1;
      });
      setHeatmapData(data);
    }
  }, [submissions]);

  const getLastYear = () => {
    const dates = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const getIntensity = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 4) return 'bg-green-300';
    if (count <= 6) return 'bg-green-400';
    return 'bg-green-500';
  };

  const dates = getLastYear();
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FaCalendarAlt className="mr-2" />
          Activity in the last year
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-53 gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((date, dayIndex) => {
                  const dateStr = date.toDateString();
                  const count = heatmapData[dateStr] || 0;
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getIntensity(count)} hover:ring-2 hover:ring-indigo-300 transition-all cursor-pointer`}
                      title={`${date.toLocaleDateString()}: ${count} submissions`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Less</span>
            <div className="flex space-x-1">
              {['bg-gray-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500'].map((color, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
const RecentActivity = ({ submissions }) => {
  const recentSubmissions = submissions?.slice(0, 5) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSubmissions.length > 0 ? (
          <div className="space-y-4">
            {recentSubmissions.map((submission, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  submission.verdict === 'Accepted' ? 'bg-green-500' :
                  submission.verdict === 'Wrong Answer' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{submission.problem?.name}</div>
                  <div className="text-sm text-gray-600">
                    {submission.verdict} • {new Date(submission.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaCode className="mx-auto h-8 w-8 mb-2" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Editable Profile Info Component
const EditableProfileInfo = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    github: user.github || '',
    linkedin: user.linkedin || ''
  });

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      github: user.github || '',
      linkedin: user.linkedin || ''
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FaUser className="mr-2" />
            Profile Information
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={user.isFlagged}>
              <FaEdit className="mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <FaSave className="mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <FaTimes className="mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.firstname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstname}
                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastname}
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">{user.firstname} {user.lastname}</h2>
                      {/* FIX: Add the "Flagged" badge if the user is flagged */}
                      {user.isFlagged && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{user.username}</p>
                  </div>
                  {/* FIX: Disable the edit button if the user is flagged */}
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={user.isFlagged}>
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{user.bio || 'No bio available'}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            {isEditing ? (
              <input
                type="text"
                placeholder="Your location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                {user.location || 'Location not specified'}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                user.website ? (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800">
                    <FaGlobe className="mr-2" />
                    Website
                  </a>
                ) : (
                  <span className="text-gray-500">No website</span>
                )
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="github-username"
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                user.github ? (
                  <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800">
                    <FaGithub className="mr-2" />
                    {user.github}
                  </a>
                ) : (
                  <span className="text-gray-500">No GitHub</span>
                )
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="linkedin-username"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                user.linkedin ? (
                  <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800">
                    <FaLinkedin className="mr-2" />
                    {user.linkedin}
                  </a>
                ) : (
                  <span className="text-gray-500">No LinkedIn</span>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Profile Component
function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user submissions
        const subRes = await getMySubmissions();
        setSubmissions(subRes.data.submissions || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const res = await updateUserProfile(updatedData);
      setUser({ ...user, ...res.data.user });
    } catch (error) {
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          My Submissions
        </h1>
        <p className="text-lg text-gray-600">
          Your submission history, grouped by problem
        </p>
      </div>

      {/* Profile Stats */}
      <div className="mb-8">
        <ProfileStats submissions={submissions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <EditableProfileInfo user={user} onSave={handleProfileUpdate} />
          <RecentActivity submissions={submissions} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <ActivityHeatmap submissions={submissions} />
          
          {/* Achievement Cards (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaTrophy className="mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FaTrophy className="mx-auto h-8 w-8 mb-2" />
                <p>Achievements coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;