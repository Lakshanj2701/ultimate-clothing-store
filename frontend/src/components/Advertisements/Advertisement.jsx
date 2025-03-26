import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Advertisement = ({ title, description, linkTo, discount, bgColor = "bg-indigo-600", onImageChange, isAdmin = false }) => {
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(URL.createObjectURL(file)); // Preview the image
      if (onImageChange) onImageChange(file); // Notify parent component if needed
    }
  };

  return (
    <div className={`${bgColor} text-white rounded-lg shadow-lg p-6 mb-8`}>
      <div className="flex flex-col md:flex-row items-center">
        {imageFile && (
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <img src={imageFile} alt={title} className="rounded-md w-full h-auto object-cover" />
          </div>
        )}
        <div className="w-full md:w-2/3">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          {discount && (
            <div className="bg-red-600 text-white inline-block px-3 py-1 rounded-full font-bold mb-2">
              {discount}% OFF
            </div>
          )}
          <p className="mb-4 text-lg">{description}</p>
          <Link 
            to={linkTo} 
            className="inline-block bg-white text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300"
          >
            Shop Now
          </Link>

          {/* Conditionally render image upload input only for Admin */}
          {isAdmin && (
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="mt-4 text-black"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
