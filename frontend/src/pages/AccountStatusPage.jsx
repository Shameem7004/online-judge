// Ensure page exists and contains appeal link / form (simplified if already added)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAppeal, getMyAppealStatus } from '../api/appealApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AccountStatusPage = () => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [hasPendingAppeal, setHasPendingAppeal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.isFlagged) {
      (async () => {
        try {
          const res = await getMyAppealStatus();
            setHasPendingAppeal(res.data.hasPendingAppeal);
        } catch {
          toast.error('Failed to check appeal status');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      toast.error('Reason must be at least 20 characters');
      return;
    }
    try {
      await createAppeal({ reason: reason.trim() });
      toast.success('Appeal submitted');
      setHasPendingAppeal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appeal');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading account status...</div>;
  }

  if (!user || !user.isFlagged) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-yellow-700">
            <FaExclamationTriangle className="mr-3 h-8 w-8" />
            Account Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg text-slate-700">
              Hello, <span className="font-bold">{user.username}</span>. Your account is currently flagged.
            </p>
            <p className="text-slate-600 mt-2">
              You can view your <Link to="/profile" className="text-indigo-600 hover:underline">profile</Link> and{" "}
              <Link to="/submissions" className="text-indigo-600 hover:underline">submission history</Link>. All other features are disabled.
            </p>
          </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-slate-800">Reason (if provided):</h4>
              <p className="text-slate-700 mt-1 italic">
                {user.flagReason || 'No reason supplied.'}
              </p>
            </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Appeal This Decision</h3>
            {hasPendingAppeal ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
                Your appeal is pending review. You will be notified after an admin decision.
              </div>
            ) : (
              <form onSubmit={handleSubmitAppeal} className="space-y-4">
                <p className="text-sm text-slate-600">If you believe this is a mistake, please explain why below. Your message will be sent to the administrators for review.</p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why the flag should be removed (min 20 characters)..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  rows="5"
                  required
                />
                <Button type="submit" disabled={reason.trim().length < 20}>
                  <FaPaperPlane className="mr-2" />
                  Submit Appeal
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStatusPage;