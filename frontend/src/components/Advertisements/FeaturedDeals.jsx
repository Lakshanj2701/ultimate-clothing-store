// src/components/Advertisements/FeaturedDeals.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedDeals = () => {
  const deals = [
    {
      id: 1,
      title: "Summer Collection",
      discount: 30,
      imageUrl: "https://picsum.photos/400/200?random=30",
      linkTo: "/collections/summer"
    },
    {
      id: 2,
      title: "Accessories",
      discount: 15,
      imageUrl: "https://picsum.photos/400/200?random=31",
      linkTo: "/collections/accessories"
    },
    {
      id: 3,
      title: "New Arrivals",
      discount: null,
      imageUrl: "https://picsum.photos/400/200?random=32",
      linkTo: "/collections/new"
    }
  ];

  return (
    <div className="container mx-auto px-4 my-12">
      <h2 className="text-3xl text-center font-bold mb-8">Special Deals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map(deal => (
          <Link key={deal.id} to={deal.linkTo} className="block group">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img 
                src={deal.imageUrl} 
                alt={deal.title} 
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                <h3 className="text-white text-xl font-bold mb-1">{deal.title}</h3>
                {deal.discount ? (
                  <p className="text-white">Save {deal.discount}%</p>
                ) : (
                  <p className="text-white">Shop Now</p>
                )}
              </div>
              {deal.discount && (
                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  {deal.discount}%
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedDeals;