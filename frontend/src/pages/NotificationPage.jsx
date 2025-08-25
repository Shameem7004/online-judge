import { useEffect, useState } from 'react';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setNotifications([
        { id: 1, message: 'Your submission was Accepted!', time: '2 min ago' },
        { id: 2, message: 'Contest "Monthly Mayhem" starts in 1 hour.', time: '1 hour ago' },
        { id: 3, message: 'Leaderboard updated.', time: 'Yesterday' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        Notifications
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Latest updates about your activity
      </p>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No notifications yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map(n => (
            <li
              key={n.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center"
            >
              <span className="text-gray-800">{n.message}</span>
              <span className="text-xs text-gray-400">{n.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationPage;