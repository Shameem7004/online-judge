import { FaInbox } from 'react-icons/fa';

const EmptyState = ({
    icon: Icon = FaInbox,
    title = "Nothing to see here",
    message = "There is no data to display at the moment.",
    action = null
}) => {
    return (
        <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;