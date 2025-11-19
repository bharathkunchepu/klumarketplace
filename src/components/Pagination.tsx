import { Pagination as PaginationType } from '../types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages, hasNext, hasPrevious } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page < 3) {
        for (let i = 0; i < 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (page > totalPages - 4) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        className="pagination-button"
        style={{
          padding: '0.5rem 1rem',
          background: hasPrevious ? 'var(--glass-bg)' : 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${hasPrevious ? 'var(--glass-border)' : 'transparent'}`,
          borderRadius: '8px',
          color: hasPrevious ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: hasPrevious ? 'pointer' : 'not-allowed',
          fontSize: '0.9rem',
          transition: 'all 0.3s ease',
        }}
      >
        Previous
      </button>

      {getPageNumbers().map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <span key={`ellipsis-${index}`} style={{ color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
              ...
            </span>
          );
        }

        const pageIndex = pageNum as number;
        const isActive = pageIndex === page;

        return (
          <button
            key={pageIndex}
            onClick={() => onPageChange(pageIndex)}
            className={`pagination-button ${isActive ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              background: isActive ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'var(--glass-bg)',
              border: `1px solid ${isActive ? 'transparent' : 'var(--glass-border)'}`,
              borderRadius: '8px',
              color: isActive ? 'var(--dark-bg)' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.3s ease',
              minWidth: '40px',
            }}
          >
            {pageIndex + 1}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="pagination-button"
        style={{
          padding: '0.5rem 1rem',
          background: hasNext ? 'var(--glass-bg)' : 'rgba(0, 0, 0, 0.2)',
          border: `1px solid ${hasNext ? 'var(--glass-border)' : 'transparent'}`,
          borderRadius: '8px',
          color: hasNext ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          fontSize: '0.9rem',
          transition: 'all 0.3s ease',
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

