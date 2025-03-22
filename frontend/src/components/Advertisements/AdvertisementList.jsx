
import React, { useState, useEffect } from 'react';

const AdvertisementList = ({ onEdit, onDelete }) => {
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    // Load advertisements from localStorage
    const loadedAds = JSON.parse(localStorage.getItem('advertisements')) || [];
    setAdvertisements(loadedAds);
  }, []);

  const handleDelete = (index) => {
    // Create a copy of advertisements without the deleted one
    const updatedAds = [...advertisements];
    updatedAds.splice(index, 1);
    
    // Update state and localStorage
    setAdvertisements(updatedAds);
    localStorage.setItem('advertisements', JSON.stringify(updatedAds));
    
    // Call external handler if provided
    if (onDelete) onDelete(index);
  };

  const handleEdit = (advertisement, index) => {
    if (onEdit) onEdit(advertisement, index);
  };

  if (advertisements.length === 0) {
    return <div className="text-center py-4">No advertisements found</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Current Advertisements</h3>
      <div className="grid grid-cols-1 gap-4">
        {advertisements.map((ad, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-md">
            <div className="flex flex-col md:flex-row">
              {ad.imageUrl && (
                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="w-full md:w-3/4 md:pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold">{ad.title}</h4>
                    <p className="text-gray-600 mb-2">{ad.description}</p>
                    {ad.amount && (
                      <div className="bg-red-600 text-white inline-block px-2 py-1 rounded-full text-sm font-bold mb-2">
                        {ad.amount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(ad, index)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementList;