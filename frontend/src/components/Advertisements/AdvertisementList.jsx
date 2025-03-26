import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { adService } from '../../services/api';

const AdvertisementList = ({ onEdit, onDelete }) => {
  const [advertisements, setAdvertisements] = useState([]);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const ads = await adService.getAll();
        setAdvertisements(ads);
      } catch (error) {
        console.error('Failed to fetch advertisements:', error);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await adService.delete(id);
        setAdvertisements((prev) => prev.filter((ad) => ad._id !== id));
        if (onDelete) onDelete();
        Swal.fire('Deleted!', 'Your advertisement has been deleted.', 'success');
      } catch (error) {
        console.error('Failed to delete advertisement:', error);
        Swal.fire('Error!', 'Failed to delete advertisement.', 'error');
      }
    }
  };

  if (advertisements.length === 0) {
    return <div className="text-center py-4">No advertisements found</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Current Advertisements</h3>
      <div className="grid grid-cols-1 gap-4">
        {advertisements.map((ad) => (
          <div key={ad._id} className="border rounded-lg p-4 bg-white shadow-md">
            <div className="flex flex-col md:flex-row">
              {ad.image && (
                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                  <img 
                    src={ad.image} 
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
                    {ad.discountAmount && (
                      <div className="bg-red-600 text-white inline-block px-2 py-1 rounded-full text-sm font-bold mb-2">
                        {ad.discountAmount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(ad)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(ad._id)}
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
