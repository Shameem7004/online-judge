import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getAllAppeals, updateAppeal } from '../api/appealApi';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaUserShield } from 'react-icons/fa';

const AdminAppealsPage = () => {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppeals();
    }, []);

    const fetchAppeals = async () => {
        try {
            const res = await getAllAppeals();
            setAppeals(res.data.appeals);
        } catch (error) {
            toast.error("Failed to fetch appeals.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, unflagUser = false) => {
        try {
            await updateAppeal(id, { status, unflagUser });
            toast.success(`Appeal has been ${status}.`);
            fetchAppeals(); // Refresh the list
        } catch (error) {
            toast.error("Failed to update appeal.");
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    if (loading) return <p>Loading appeals...</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Flag Appeals Management</h1>
            {appeals.length === 0 ? (
                <p>No pending appeals.</p>
            ) : (
                appeals.map(appeal => (
                    <Card key={appeal._id} className={appeal.status !== 'pending' ? 'bg-slate-50 opacity-70' : ''}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <FaUserShield /> Appeal from: {appeal.user.username}
                                </CardTitle>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    appeal.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>{appeal.status}</span>
                            </div>
                            <p className="text-sm text-slate-500 pt-1">Submitted on: {formatDate(appeal.createdAt)}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-slate-800">User's Reason:</p>
                            <p className="bg-slate-100 p-4 rounded-md mt-2 whitespace-pre-wrap">{appeal.reason}</p>
                            {appeal.status === 'pending' && (
                                <div className="flex gap-4 mt-4 pt-4 border-t">
                                    <Button variant="success" onClick={() => handleUpdateStatus(appeal._id, 'resolved', true)}>
                                        <FaCheck className="mr-2" /> Approve & Unflag User
                                    </Button>
                                    <Button variant="danger" onClick={() => handleUpdateStatus(appeal._id, 'dismissed')}>
                                        <FaTimes className="mr-2" /> Dismiss Appeal
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

export default AdminAppealsPage;