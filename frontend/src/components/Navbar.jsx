import { useContext } from 'react';
import { useNavigate , Link} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logoutUser } from '../api/userApi';


function Navbar() {
    const navigate = useNavigate();
    const { user, setUser} = useContext(AuthContext);

    const handleLogout = async () => {
        try{
            await logoutUser();
            setUser(null);
            navigate('/login');

        } catch(error){
            console.log('Logout error', error.response?.data || error.message);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side: Logo and Main Links */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            Online Judge
                        </Link>
                        <div className="hidden md:flex space-x-6">
                            <Link to="/problems" className="text-gray-600 hover:text-indigo-600 font-medium">
                                Problems
                            </Link>
                            <Link to="/leaderboard" className="text-gray-600 hover:text-indigo-600 font-medium">
                                Leaderboard
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Auth buttons or User Info */}
                    <div className="flex items-center">
                        {user ? (
                            // Show if user is logged in
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-700">Welcome, {user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // Show if user is logged out
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-600 hover:text-indigo-600 font-semibold py-2 px-4 rounded-md"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors"
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;