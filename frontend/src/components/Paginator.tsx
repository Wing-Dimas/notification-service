import { useCallback } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import { PaginatorType } from "../types/paginator";

interface IPaginator {
  paginator: PaginatorType;
  onPageChange: (page: number) => void;
}

const Paginator: React.FC<IPaginator> = ({ paginator, onPageChange }) => {
  const { total, lastPage, currentPage, prev, next } = paginator;

  // Fungsi untuk menghitung halaman mana yang ditampilkan
  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const totalPagesToShow = 4; // Jumlah maksimal tombol halaman yang ditampilkan

    // Logika untuk menentukan rentang halaman yang ditampilkan
    let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
    let endPage = startPage + totalPagesToShow - 1;

    if (endPage > lastPage) {
      endPage = lastPage;
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }, [currentPage, lastPage]);

  // Handler untuk navigasi halaman
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= lastPage) {
      onPageChange(page);
    }
  };

  // Jika tidak ada data untuk pagination
  if (total === 0 || lastPage <= 1) {
    return null;
  }

  return (
    <div className="join mt-8 justify-end w-full">
      {/* Tombol Previous */}
      <button
        className={`join-item btn ${prev === null ? "btn-disabled" : ""}`}
        onClick={() => prev !== null && handlePageChange(prev)}
      >
        <HiOutlineChevronLeft />
      </button>

      {/* Tombol halaman */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          className={`join-item btn ${page === currentPage ? "btn-active" : ""}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* Tombol Next */}
      <button
        className={`join-item btn ${next === null ? "btn-disabled" : ""}`}
        onClick={() => next !== null && handlePageChange(next)}
      >
        <HiOutlineChevronRight />
      </button>
    </div>
  );
};

export default Paginator;
