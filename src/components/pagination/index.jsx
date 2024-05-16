import React from "react";

const Pagination = ({ currentPage, totalPages, paginate }) => {
    let startPage = currentPage - 1;
    if (startPage <= 1) startPage = 1;
    let endPage = startPage + 2;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = endPage - 2;
        if (startPage < 1) startPage = 1;
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center mt-4 items-center">
            <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`m-2 p-2 w-10 h-10 flex justify-center items-center rounded-full ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-customGreen text-white cursor-pointer'}`}
                aria-label="Previous Page"
            >
                &laquo;
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`m-1 p-2 w-8 h-8 flex items-center justify-center rounded-full font-medium ${currentPage === number ? 'bg-customGreen text-white' : 'bg-gray-200 text-gray-800'}`}
                    aria-label={`Page ${number}`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`m-2 p-2 w-10 h-10 flex justify-center items-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-customGreen text-white cursor-pointer'}`}
                aria-label="Next Page"
            >
                &raquo;
            </button>
        </div>
    );
};

export default Pagination;
