import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api/userApi';
import { useNotification } from '../context/NotificationContext'; 
import '../index.css'; // Ensure styles are applied

function LoginPage() {
  const { addNotification } = useNotification(); 
  const { setUser } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const payload = { password };
      if (identifier.includes('@')) {
        payload.email = identifier;
      } else {
        payload.username = identifier;
      }

      const res = await loginUser(payload);
      console.log('Login successful:', res.data);

      setUser(res.data.user);
      addNotification(`Welcome back, ${res.data.user.username}!`);

      navigate('/'); 
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      addNotification(message, 'error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Welcome Back!
        </h1>
        <p className="text-lg text-gray-600">
          Log in to continue your coding journey.
        </p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
