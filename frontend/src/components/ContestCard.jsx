import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusMeta = (start, end) => {
  const now = new Date();
  if (now < start) return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-800' };
  if (now > end) return { label: 'Past', cls: 'bg-gray-100 text-gray-800' };
  return { label: 'Live', cls: 'bg-red-100 text-red-800 animate-pulse' };
};

export default function ContestCard({ contest }) {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const { label, cls } = statusMeta(start, end);

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{contest.title}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>{label}</span>
        </div>
        {contest.description ? (
          <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>
        ) : null}
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Starts: {isNaN(start) ? 'TBA' : format(start, "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Duration: {isNaN(start) || isNaN(end) ? 'TBA' : `${Math.max(1, Math.round((end - start) / (1000 * 60))) } min`}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-2 6h8l-2 6" />
            </svg>
            <span>Problems: {Array.isArray(contest.problems) ? contest.problems.length : 0}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <Link
          to={`/contests/${contest._id}`}
          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Contest →
        </Link>
      </div>
    </div>
  );
}

export const ContestCardSkeleton = () => {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
         <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="h-4 bg-indigo-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};