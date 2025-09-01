import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core Components
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import FlaggedUserRoute from './components/FlaggedUserRoute';

// Page Imports (Organized and de-duplicated)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AllProblemsPage from './pages/AllProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import SubmissionsPage from './pages/SubmissionsPage';
import IndividualSubmissionPage from './pages/IndividualSubmissionPage';
import LeaderboardPage from './pages/LeaderBoardPage';
import ContestsListingPage from './pages/ContestsListingPage';
import ContestDetailPage from './pages/ContestDetailPage';
import ContestLeaderboardPage from './pages/ContestLeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import AccountStatusPage from './pages/AccountStatusPage'; // FIX: Ensure this is imported only once
import SolvedProblemsPage from './pages/SolvedProblemsPage';
import AttendedContestsPage from './pages/AttendedContestsPage';

// Admin Page Imports
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminProblemManagementPage from './pages/AdminProblemManagementPage';
import AdminContestManagementPage from './pages/AdminContestManagementPage';
import AdminAllSubmissionsPage from './pages/AdminAllSubmissionsPage';
import CreateProblemPage from './pages/CreateProblemPage';
import EditProblemPage from './pages/EditProblemPage';
import TestcaseManagementPage from './pages/TestcaseManagementPage';
import CreateContestPage from './pages/CreateContestPage';
import EditContestPage from './pages/EditContestPage';

function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-slate-50 min-h-screen transition-colors duration-300">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users/:username" element={<PublicProfilePage />} />
          <Route path="/account-status" element={<AccountStatusPage />} />

          {/* Always accessible to logged-in users */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="/profile/solved-problems" element={<SolvedProblemsPage />} />
          <Route path="/profile/contests" element={<AttendedContestsPage />} />

          {/* Restricted (blocked for flagged users) */}
          <Route element={<FlaggedUserRoute />}>
            <Route path="/submissions/:id" element={<IndividualSubmissionPage />} />
            <Route path="/problems" element={<AllProblemsPage />} />
            <Route path="/problems/:slug" element={<ProblemDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/contests" element={<ContestsListingPage />} />
            <Route path="/contests/:id" element={<ContestDetailPage />} />
            <Route path="/contests/:id/leaderboard" element={<ContestLeaderboardPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserManagementPage />} />
            <Route path="problems" element={<AdminProblemManagementPage />} />
            <Route path="problems/:problemId/testcases" element={<TestcaseManagementPage />} />
            <Route path="contests" element={<AdminContestManagementPage />} />
            <Route path="create-problem" element={<CreateProblemPage />} />
            <Route path="edit-problem/:id" element={<EditProblemPage />} />
            <Route path="create-contest" element={<CreateContestPage />} />
            <Route path="edit-contest/:id" element={<EditContestPage />} />
            <Route path="submissions" element={<AdminAllSubmissionsPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;