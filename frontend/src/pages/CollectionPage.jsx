import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from "react-icons/fa";
import axios from 'axios';
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';
import { useSearchParams } from 'react-router-dom';

const CollectionPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sidebarRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        collection: searchParams.get('collection') || 'all',
        size: searchParams.get('size') || '',
        color: searchParams.get('color') || '',
        gender: searchParams.get('gender') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        category: searchParams.get('category') || '',
        material: searchParams.get('material') || '',
        brand: searchParams.get('brand') || '',
        sortBy: searchParams.get('sortBy') || 'newest'
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutside = (e) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setIsSidebarOpen(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            // Add all non-empty filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products?${queryParams.toString()}`
            );
            
            setProducts(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        // Update URL search params
        const newSearchParams = new URLSearchParams();
        Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
            if (value && value !== 'all') {
                newSearchParams.append(key, value);
            }
        });
        setSearchParams(newSearchParams);
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row">
            {/* Mobile filter button */}
            <button 
                onClick={toggleSidebar}
                className="lg:hidden border p-2 flex justify-center items-center"
            >
                <FaFilter className="mr-2"/> Filters
            </button>

            {/* Filter SideBar */}
            <div 
                ref={sidebarRef} 
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 z-50
                left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}
            >
                <FilterSidebar 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <div className="flex-grow p-4">
                <h2 className="text-2xl uppercase mb-4">All Collection</h2>

                {/* Sort option */}
                <SortOptions 
                    currentSort={filters.sortBy}
                    onSortChange={(sortBy) => handleFilterChange({ sortBy })}
                />

                {/* Product grid */}
                <ProductGrid products={products} />
            </div>
        </div>
    );
};

export default CollectionPage;