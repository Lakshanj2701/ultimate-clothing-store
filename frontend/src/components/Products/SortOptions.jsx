import React from 'react';
import { useSearchParams } from 'react-router-dom';

const SortOptions = ({ onSortChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSortChange = (e) => {
        const sortBy = e.target.value;
        searchParams.set("sortBy", sortBy);
        setSearchParams(searchParams);
        if (onSortChange) {
            onSortChange(sortBy);
        }
    };

    return (
        <div className="mb-4 flex items-center justify-end">
            <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
            <select
                id="sort" 
                onChange={handleSortChange}
                value={searchParams.get("sortBy") || ""}
                className="border p-2 rounded-md focus:outline-none text-sm"
            >
                <option value="">Default</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratingDesc">Rating: High to Low</option>
                <option value="newest">Newest Arrivals</option>
            </select>
        </div>
    );
};

export default SortOptions;