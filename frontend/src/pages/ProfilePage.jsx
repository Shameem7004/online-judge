import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMySubmissions } from '../api/submissionApi';
import { updateUserProfile } from '../api/userApi';
import { useNotification } from '../context/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaCode, FaTrophy, FaCalendarAlt, FaGithub, FaLinkedin, FaEdit, FaSave, FaTimes, FaCheckCircle, FaTimesCircle, FaCamera } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces, SiCodechef } from 'react-icons/si';
import { Link } from 'react-router-dom';

// Social Links Display Component
const SocialLinks = ({ links }) => {
  const socialPlatforms = [
    { key: 'github', icon: FaGithub, base_url: 'https://github.com/' },
    { key: 'linkedin', icon: FaLinkedin, base_url: 'https://linkedin.com/in/' },
    { key: 'leetcode', icon: SiLeetcode, base_url: 'https://leetcode.com/' },
    { key: 'codeforces', icon: SiCodeforces, base_url: 'https://codeforces.com/profile/' },
    { key: 'codechef', icon: SiCodechef, base_url: 'https://www.codechef.com/users/' },
  ];

  if (!links || Object.values(links).every(link => !link)) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {socialPlatforms.map(platform =>
        links[platform.key] && (
          <a
            key={platform.key}
            href={links[platform.key].startsWith('http') ? links[platform.key] : `${platform.base_url}${links[platform.key]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-600 transition-colors"
            title={platform.key.charAt(0).toUpperCase() + platform.key.slice(1)}
          >
            <platform.icon className="w-6 h-6" />
          </a>
        )
      )}
    </div>
  );
};

// Editable Profile Info Component
const EditableProfileInfo = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    socialLinks: {
      github: user.socialLinks?.github || '',
      linkedin: user.socialLinks?.linkedin || '',
      leetcode: user.socialLinks?.leetcode || '',
      codeforces: user.socialLinks?.codeforces || '',
      codechef: user.socialLinks?.codechef || '',
    },
  });

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      socialLinks: user.socialLinks || {},
    });
    setIsEditing(false);
  };

  const socialInputs = [
    { key: 'github', label: 'GitHub Username', icon: FaGithub },
    { key: 'linkedin', label: 'LinkedIn Profile URL', icon: FaLinkedin },
    { key: 'leetcode', label: 'LeetCode Username', icon: SiLeetcode },
    { key: 'codeforces', label: 'Codeforces Handle', icon: SiCodeforces },
    { key: 'codechef', label: 'CodeChef Username', icon: SiCodechef },
  ];

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dummy Image Upload Section */}
          <div className="flex flex-col items-center pt-2 pb-6 border-b border-slate-200">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {formData.firstname?.charAt(0)}{formData.lastname?.charAt(0)}
              </div>
              <label htmlFor="profile-picture-upload" className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-100 transition-colors">
                <FaCamera className="text-slate-600" />
                <input id="profile-picture-upload" name="profile-picture-upload" type="file" className="sr-only" accept="image/*" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input type="text" value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input type="text" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-3">Social & Coding Profiles</h4>
            <div className="space-y-4">
              {socialInputs.map(input => (
                <div key={input.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{input.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <input.icon className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={input.key === 'linkedin' ? 'https://linkedin.com/in/...' : 'your-username'}
                      value={formData.socialLinks[input.key] || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [input.key]: e.target.value } })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={handleCancel}><FaTimes className="mr-2" />Cancel</Button>
            <Button onClick={handleSave}><FaSave className="mr-2" />Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
          {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
        </div>
        <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{user.firstname} {user.lastname}</h2>
            {user.isFlagged && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                Flagged
                </span>
            )}
        </div>
        <p className="text-slate-600">@{user.username}</p>
        <SocialLinks links={user.socialLinks} />
        {!user.isFlagged && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="mt-6">
            <FaEdit className="mr-2" /> Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced Profile Stats Component
const ProfileStats = ({ user, submissions }) => {
  // Calculate real-time statistics from submission data
  const allSubmissions = submissions || [];
  
  // 1. Total Submissions (all submissions by the user)
  const totalSubmissions = allSubmissions.length;
  
  // 2. Problems Attempted (unique problems with at least one submission)
  const attemptedProblemsMap = new Map();
  allSubmissions.forEach(sub => {
    if (sub.problem?._id) {
      attemptedProblemsMap.set(sub.problem._id, sub.problem);
    }
  });
  const problemsAttempted = attemptedProblemsMap.size;

  // 3. Problems Solved (unique problems with at least one accepted submission)
  const acceptedSubmissions = allSubmissions.filter(sub => sub.verdict === 'Accepted');
  const solvedProblemsMap = new Map();
  acceptedSubmissions.forEach(sub => {
    if (sub.problem?._id) {
      solvedProblemsMap.set(sub.problem._id, sub.problem);
    }
  });
  const problemsSolved = solvedProblemsMap.size;

  // 4. Total Points (from backend user object - real-time calculated)
  const totalPoints = user?.totalPoints || 0;

  // 5. Contests Attended (unique contests from submissions)
  const attendedContestIds = new Set();
  allSubmissions.forEach(sub => {
    if (sub.contest) {
      attendedContestIds.add(sub.contest);
    }
  });
  const contestsAttended = attendedContestIds.size;

  const stats = [
    { 
      icon: FaCode, 
      label: 'Problems Solved', 
      value: problemsSolved, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      link: '/profile/solved-problems',
      subtitle: `${problemsAttempted} attempted`
    },
    { 
      icon: FaTrophy, 
      label: 'Total Points', 
      value: totalPoints, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-100', 
      link: '/leaderboard' 
    },
    { 
      icon: FaCalendarAlt, 
      label: 'Contests Attended', 
      value: contestsAttended, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100', 
      link: '/profile/contests' 
    },
    { 
      icon: FaCode, 
      label: 'Total Submissions', 
      value: totalSubmissions, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      link: '/submissions',
      subtitle: `${acceptedSubmissions.length} accepted`
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Link to={stat.link} key={index} className="block hover:no-underline">
          <Card className="text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.subtitle && (
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

// Activity Heatmap Component
const ActivityHeatmap = ({ submissions }) => {
  const [heatmapData, setHeatmapData] = useState({});

  useEffect(() => {
    const data = submissions.reduce((acc, sub) => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    setHeatmapData(data);
  }, [submissions]);

  const getLastYear = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates.reverse();
  };

  const getIntensity = (count) => {
    if (count >= 10) return 'bg-indigo-700';
    if (count >= 7) return 'bg-indigo-600';
    if (count >= 4) return 'bg-indigo-500';
    if (count >= 1) return 'bg-indigo-400';
    return 'bg-slate-200';
  };

  const dates = getLastYear();
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto p-2">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map(day => {
            const count = heatmapData[day] || 0;
            return (
              <div
                key={day}
                className={`w-4 h-4 rounded-sm ${getIntensity(count)}`}
                title={`${count} submissions on ${day}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ submissions }) => {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent><p className="text-slate-500">No recent submissions.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {submissions.map(sub => (
            <li key={sub._id} className="flex items-center justify-between">
              <div className="flex-1">
                <Link to={`/problems/${sub.problem.slug}`} className="font-medium text-slate-800 hover:text-indigo-600 hover:underline">
                  {sub.problem.name}
                </Link>
                <p className="text-sm text-slate-500">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`flex items-center text-sm font-semibold ${sub.verdict === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                {sub.verdict === 'Accepted' ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
                {sub.verdict}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Main Profile Component
function ProfilePage() {
  const { user, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const res = await getMySubmissions();
        
        // FIX: Correctly process the API response and remove console logs
        let flatSubmissions = [];
        if (res.data.groupedSubmissions) {
          // Handle the case where data is grouped by problem
          flatSubmissions = res.data.groupedSubmissions.flatMap(group => group.submissions || []);
        } else if (Array.isArray(res.data.submissions)) {
          // Handle the case where data is a flat array in a 'submissions' property
          flatSubmissions = res.data.submissions;
        }
        
        setSubmissions(flatSubmissions);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
        addNotification('Could not load submission history.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user, addNotification]);

  const handleSaveProfile = async (formData) => {
    try {
      const res = await updateUserProfile(formData);
      setUser(res.data.user);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  if (loading || !user) {
    return <div className="text-center p-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <EditableProfileInfo user={user} onSave={handleSaveProfile} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileStats user={user} submissions={submissions} />
          <RecentActivity submissions={submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)} />
          <Card>
            <CardHeader>
              <CardTitle>Submission Activity (Last Year)</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap submissions={submissions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;