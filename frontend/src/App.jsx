import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import Navbar from './components/Navbar';
import AllProblemsPage from './pages/AllProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-4">
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/problems' element={<AllProblemsPage />} />
            <Route path='/problems/:slug' element={<ProblemDetailPage />} />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
