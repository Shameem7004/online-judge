import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getAllUsers, deleteUser, toggleUserFlag } from '../api/adminApi';
import { FaFlag, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const isViewOnly = new URLSearchParams(location.search).get('view') === 'true';

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAllUsers({ signal: controller.signal });
        if (!controller.signal.aborted) setUsers(response.data.users || []);
      } catch (err) {
        if (err.name !== 'CanceledError') setError('Failed to fetch users.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchUsers();
    return () => controller.abort();
  }, []);

  const handleToggleFlag = async (userId) => {
    try {
      const res = await toggleUserFlag(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isFlagged: res.data.isFlagged } : u));
      toast.success(`User ${res.data.isFlagged ? 'flagged' : 'unflagged'}.`);
    } catch (err) {
      toast.error('Failed to update user flag status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete user.');
      }
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-lg text-slate-600 mt-2">
          View and manage all registered users on the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Joined On
                    </th>
                    {!isViewOnly && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user._id} className={`hover:bg-slate-50 ${user.isFlagged ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      {!isViewOnly && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleToggleFlag(user._id)} className={`p-2 rounded-full ${user.isFlagged ? 'bg-yellow-500 text-white' : 'bg-slate-200 text-slate-600'} hover:opacity-80`}>
                            {user.isFlagged ? <FaCheck /> : <FaFlag />}
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagementPage;