import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-8">
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                </button>
                <div className="hidden sm:flex items-center mx-4">
                    <span className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </span>
                </div>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <FaChevronRight className="h-5 w-5 ml-2" />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;