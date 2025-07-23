import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom'; 
import { registerUser } from "../api/userApi";

function RegisterPage() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        password: '',
    });
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => { 
        e.preventDefault(); 
        try {
            const res = await registerUser(formData);
            console.log('Registration Successful:', res.data);
            alert('Registration successful! Please log in.');
            // Navigate to login page
            navigate('/login'); 
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-extrabold text-center text-gray-900">Create Your Account</h2>
                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="flex space-x-4">
                        <input name="firstname" type="text" placeholder="First Name" value={formData.firstname} onChange={handleChange} required className="w-1/2 px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input name="lastname" type="text" placeholder="Last Name" value={formData.lastname} onChange={handleChange} required className="w-1/2 px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 text-gray-900 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Register
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;