import React, { useEffect, useRef, useState } from 'react';
import {FaFilter} from "react-icons/fa";
import FilterSidebar from '../components/Products/FilterSidebar';
import SortOptions from '../components/Products/SortOptions';
import ProductGrid from '../components/Products/ProductGrid';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageHelpers';

const CollectionPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const sidebarRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { collection } = useParams();
    const [searchParams] = useSearchParams();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleClickOutside = (e) => {
        if(sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setIsSidebarOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products`;
                
                if (collection === 'men' || collection === 'women') {
                    url += `?gender=${collection.charAt(0).toUpperCase() + collection.slice(1)}`;
                } else if (collection === 'top-wear') {
                    url += '?category=Top Wear';
                } else if (collection === 'bottom-wear') {
                    url += '?category=Bottom Wear';
                } else if (collection === 'all') {
                    // No additional filters for 'all' collection
                }

                const response = await axios.get(url);
                const productsWithUrls = response.data.map(product => ({
                    ...product,
                    images: product.images.map(image => ({
                        ...image,
                        url: getFullImageUrl(image.url)
                    }))
                }));
                
                setProducts(productsWithUrls);
                setFilteredProducts(productsWithUrls);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load products");
                setLoading(false);
            }
        };

        fetchProducts();
    }, [collection]);

    const applySorting = (products, sortBy) => {
        if (!sortBy) return [...products];
        
        switch(sortBy) {
            case 'priceAsc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'priceDesc':
                return [...products].sort((a, b) => b.price - a.price);
            case 'ratingDesc':
                return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'newest':
                return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            default:
                return [...products];
        }
    };

    const applyFilters = (filters) => {
        let filtered = [...products];
        
        if (filters.gender) {
            filtered = filtered.filter(p => p.gender === filters.gender);
        }
        
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }
        
        if (filters.color) {
            filtered = filtered.filter(p => p.color === filters.color);
        }
        
        if (filters.size?.length > 0) {
            filtered = filtered.filter(p => 
                filters.size.some(size => p.sizes?.includes(size))
            );
        }
        
        if (filters.material?.length > 0) {
            filtered = filtered.filter(p => 
                filters.material.some(material => p.materials?.includes(material))
            );
        }
        
        if (filters.brand?.length > 0) {
            filtered = filtered.filter(p => 
                filters.brand.includes(p.brand)
            );
        }
        
        filtered = filtered.filter(p => 
            p.price >= filters.minPrice && p.price <= filters.maxPrice
        );

        // Apply sorting after filtering
        const sortBy = searchParams.get("sortBy");
        filtered = applySorting(filtered, sortBy);
        
        setFilteredProducts(filtered);
    };

    const handleSortChange = (sortBy) => {
        const filtered = applySorting(filteredProducts, sortBy);
        setFilteredProducts(filtered);
    };

    const getCollectionTitle = () => {
        switch(collection) {
            case 'men':
                return 'Men\'s Collection';
            case 'women':
                return 'Women\'s Collection';
            case 'top-wear':
                return 'Top Wear';
            case 'bottom-wear':
                return 'Bottom Wear';
            case 'all':
                return 'All Products';
            default:
                return 'Collection';
        }
    };

    return (
        <div className="flex flex-col lg:flex-row">
            <button onClick={toggleSidebar}
             className="lg:hidden border p-2 flex justify-center items-center">
                <FaFilter className="mr-2"/> Filters
            </button>
            
            <div ref={sidebarRef} className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 z-50
            left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}>
                <FilterSidebar onFilterChange={applyFilters} collection={collection} />
            </div>
            
            <div className="flex-grow p-4">
                <h2 className="text-2xl uppercase mb-4">{getCollectionTitle()}</h2>

                <SortOptions onSortChange={handleSortChange} />

                {loading ? (
                    <div className="text-center py-8">Loading products...</div>
                ) : filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <div className="text-center py-8">No products found matching your filters</div>
                )}
            </div>
        </div>
    );
};

export default CollectionPage;