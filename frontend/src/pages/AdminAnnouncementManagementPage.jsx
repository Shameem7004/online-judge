import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button'; // FIX: Changed to default import
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api/announcementApi';

const AdminAnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState({ message: '', type: 'info', isActive: false });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await getAllAnnouncements();
      setAnnouncements(res.data.announcements);
    } catch (error) {
      toast.error('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAnnouncement(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!currentAnnouncement._id;
    try {
      if (isEditing) {
        await updateAnnouncement(currentAnnouncement._id, currentAnnouncement);
        toast.success('Announcement updated!');
      } else {
        await createAnnouncement(currentAnnouncement);
        toast.success('Announcement created!');
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} announcement.`);
    }
  };

  const handleEdit = (announcement) => {
    setCurrentAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        toast.success('Announcement deleted.');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement.');
      }
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      await updateAnnouncement(announcement._id, { ...announcement, isActive: !announcement.isActive });
      toast.success(`Announcement ${!announcement.isActive ? 'activated' : 'deactivated'}.`);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to toggle status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcement Management</h1>
          <p className="text-lg text-slate-600 mt-2">Create and manage site-wide announcements.</p>
        </div>
        <Button onClick={() => { setCurrentAnnouncement({ message: '', type: 'info', isActive: false }); setShowForm(!showForm); }}>
          <FaPlus className="mr-2" /> {showForm ? 'Cancel' : 'Create New'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader><CardTitle>{currentAnnouncement._id ? 'Edit' : 'Create'} Announcement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                  <textarea id="message" name="message" value={currentAnnouncement.message} onChange={handleInputChange} rows="3" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required></textarea>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-slate-700">Type</label>
                  <select id="type" name="type" value={currentAnnouncement.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input id="isActive" name="isActive" type="checkbox" checked={currentAnnouncement.isActive} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-slate-900">Activate this announcement</label>
                </div>
              </div>
              <div className="mt-6">
                <Button type="submit">{currentAnnouncement._id ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {announcements.map((ann) => (
                  <tr key={ann._id}>
                    <td className="px-6 py-4 max-w-md truncate">{ann.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ann.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ann.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button variant="icon" onClick={() => handleToggleActive(ann)}>
                        {ann.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-slate-400" />}
                      </Button>
                      <Button variant="icon" onClick={() => handleEdit(ann)}><FaEdit /></Button>
                      <Button variant="icon" onClick={() => handleDelete(ann._id)}><FaTrash className="text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnnouncementManagementPage;