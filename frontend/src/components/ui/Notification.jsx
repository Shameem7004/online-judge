import { useEffect, useState } from 'react';

function Notification({ message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); 
    }, 3000); // Notification stays for 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  // This function now returns professional gradient styles
  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        // Greenish gradient for success (Login/Register)
        return 'bg-gradient-to-br from-green-500 to-teal-500';
      case 'error':
        // A more intense red for errors
        return 'bg-gradient-to-br from-red-500 to-orange-500';
      case 'info':
        // Reddish gradient for info (Logout)
        return 'bg-gradient-to-br from-rose-500 to-red-600';
      default:
        return 'bg-gray-800';
    }
  };

  const baseStyle = "fixed top-20 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold transition-all duration-500 z-50";
  const visibilityStyle = visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12';

  return (
    <div className={`${baseStyle} ${getTypeStyle()} ${visibilityStyle}`}>
      {message}
    </div>
  );
}

export default Notification;