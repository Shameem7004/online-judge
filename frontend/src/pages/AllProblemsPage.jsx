import { useEffect, useState, useContext } from "react";
import { getAllProblems } from "../api/problemApi";
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import ProblemListSkeleton from "../components/ProblemListSkeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { FaPlus, FaTimes, FaSearch, FaFilter, FaCheckCircle, FaClock, FaCode } from 'react-icons/fa';

// Enhanced Filter Component
const FilterSidebar = ({ filters, onFilterChange, onClearFilters, availableTags }) => {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statuses = ['Solved', 'Attempted', 'Todo'];

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <FaFilter className="mr-2" />
          Filters
        </Button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <Card className="sticky top-24">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900">Filters</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search || ''}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Difficulty</label>
              <div className="space-y-2">
                {difficulties.map(difficulty => (
                  <label key={difficulty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.difficulty?.includes(difficulty) || false}
                      onChange={(e) => {
                        const current = filters.difficulty || [];
                        const updated = e.target.checked 
                          ? [...current, difficulty]
                          : current.filter(d => d !== difficulty);
                        onFilterChange('difficulty', updated);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                    />
                    <span className={`ml-2 text-sm ${
                      difficulty === 'Easy' ? 'text-emerald-600' :
                      difficulty === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {difficulty}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Status</label>
              <div className="space-y-2">
                {statuses.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const current = filters.status || [];
                        const updated = e.target.checked 
                          ? [...current, status]
                          : current.filter(s => s !== status);
                        onFilterChange('status', updated);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Topics</label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableTags.slice(0, 20).map(tag => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={(e) => {
                          const current = filters.tags || [];
                          const updated = e.target.checked 
                            ? [...current, tag]
                            : current.filter(t => t !== tag);
                          onFilterChange('tags', updated);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="ml-2 text-sm text-slate-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Enhanced Problem Row Component
const ProblemRow = ({ problem, index, userSolutions = {} }) => {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <Link
            to={`/problems/${problem.slug}`}
            className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
          >
            {problem.name}
          </Link>
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {problem.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-xs text-slate-400 px-2 py-1">
                  +{problem.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyClass(problem.difficulty)}`}>
          {problem.difficulty}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        {problem.points || 'N/A'}
      </td>
    </tr>
  );
};

// Main Component
function AllProblemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    total: 0
  }); // FIX: Initialize with default values
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [availableTags, setAvailableTags] = useState([]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 10,
        search: searchParams.get('search') || '',
        difficulty: searchParams.getAll('difficulty'),
        tags: searchParams.getAll('tags'),
        status: searchParams.getAll('status')
      };

      const res = await getAllProblems(queryParams);
      setProblems(res.data.problems || []); // FIX: Provide fallback
      setPagination(res.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        total: 0
      }); // FIX: Provide fallback for pagination
      
      // Extract unique tags
      const tags = res.data.problems?.flatMap(problem => problem.tags || []) || [];
      setAvailableTags([...new Set(tags)]);
      
    } catch (err) {
      console.error('Fetch problems error:', err);
      setError('Failed to fetch problems. Please try again.');
      setProblems([]); // FIX: Reset to empty array on error
      setPagination({
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        total: 0
      }); // FIX: Reset pagination on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value && (Array.isArray(value) ? value.length > 0 : value)) {
      newParams.set(key, Array.isArray(value) ? value.join(',') : value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchParams({});
  };

  const currentTag = searchParams.get('tag');
  const currentSearch = searchParams.get('search');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            Problem Set
          </h1>
          <p className="text-lg text-slate-600">
            Challenge yourself with our collection of problems.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin/create-problem">
            <Button className="mt-4 md:mt-0 w-full md:w-auto">
              <FaPlus className="mr-2" /> Create Problem
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            availableTags={availableTags}
          />
        </div>

        {/* Problems Table */}
        <div className="lg:col-span-3">
          {loading ? (
            <ProblemListSkeleton />
          ) : error ? (
            <EmptyState title="Error" message={error} />
          ) : problems.length > 0 ? (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th className="px-6 py-3">Title</th>
                          <th className="px-6 py-3">Difficulty</th>
                          <th className="px-6 py-3">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problems.map((problem, index) => (
                          <ProblemRow 
                            key={problem._id} 
                            problem={problem} 
                            index={((pagination?.currentPage || 1) - 1) * (pagination?.limit || 10) + index} 
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.currentPage || 1}
                    totalPages={pagination.totalPages || 1}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState title="No Problems Found" message="Try adjusting your filters or check back later." />
          )}
        </div>
      </div>
    </div>
  );
}

export default AllProblemsPage;