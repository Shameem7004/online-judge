import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

// This is a placeholder page. You would fetch and display all submissions here.
const AdminAllSubmissionsPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Submissions Overview</h1>
        <p className="text-lg text-slate-600 mt-2">
          Browse and review all submissions from all users.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            A table of all submissions with filtering and viewing capabilities would be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAllSubmissionsPage;