import { useState, useEffect } from 'react';
import { FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// Mock API call - replace with your actual API call
const getActiveAnnouncements = async () => {
    // In a real app, you would fetch from your backend:
    // const response = await apiClient.get('/announcements/active');
    // return response.data.announcements;
    return Promise.resolve([]); // Default to no announcements
};

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await getActiveAnnouncements();
                setAnnouncements(data);
                if (data.length > 0) {
                    setVisible(true);
                }
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            }
        };
        fetchAnnouncements();
    }, []);

    if (!announcements.length || !visible) {
        return null;
    }

    const getStyles = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500 border-yellow-600';
            case 'critical': return 'bg-red-600 border-red-700';
            default: return 'bg-indigo-600 border-indigo-700';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning':
            case 'critical':
                return <FaExclamationTriangle className="h-5 w-5" />;
            default:
                return <FaInfoCircle className="h-5 w-5" />;
        }
    };
    
    const announcement = announcements[0]; // Display one at a time

    return (
        <div className={`relative text-white p-3 text-center text-sm border-b ${getStyles(announcement.type)}`}>
            <div className="container mx-auto flex items-center justify-center gap-3">
                {getIcon(announcement.type)}
                <span>{announcement.message}</span>
            </div>
            <button onClick={() => setVisible(false)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white">
                <FaTimes />
            </button>
        </div>
    );
};

export default AnnouncementBanner;