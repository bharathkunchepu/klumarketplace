import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Pagination as PaginationType } from '../types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages, hasNext, hasPrevious } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (hasPrevious) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) {
      onPageChange(pageNum);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(0);

      // Calculate start and end
      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      // Adjust if near start
      if (page <= 2) {
        end = 3;
      }

      // Adjust if near end
      if (page >= totalPages - 3) {
        start = totalPages - 4;
      }

      // Add ellipsis if needed
      if (start > 1) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className={`px-4 py-2 rounded-md font-heading font-semibold text-button transition-all duration-200 ${
          hasPrevious
            ? 'bg-royal-blue text-white hover:bg-royal-blue-600 hover:shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400 font-body">
                ...
              </span>
            );
          }

          const pageNumber = pageNum as number;
          const isActive = pageNumber === page;

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`w-10 h-10 rounded-md font-heading font-semibold text-button transition-all duration-200 ${
                isActive
                  ? 'bg-royal-blue text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-royal-blue-50 hover:text-royal-blue border border-gray-200'
              }`}
            >
              {pageNumber + 1}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className={`px-4 py-2 rounded-md font-heading font-semibold text-button transition-all duration-200 ${
          hasNext
            ? 'bg-royal-blue text-white hover:bg-royal-blue-600 hover:shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Next
        <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
      </button>
    </div>
  );
};

export default Pagination;

