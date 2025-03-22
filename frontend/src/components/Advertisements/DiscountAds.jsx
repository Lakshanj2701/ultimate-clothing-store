import React, { useState, useEffect } from 'react';
import Advertisement from './Advertisement';

const DiscountAds = () => {
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    const savedAds = JSON.parse(localStorage.getItem('advertisements')) || [];
    console.log('Advertisements retrieved from localStorage:', savedAds);
    setActiveDiscounts(savedAds.map((ad, index) => ({
      id: index + 1,
      title: ad.title,
      description: ad.description,
      amount: ad.amount,
      imageUrl: ad.imageUrl,
      linkTo: '/collections/custom',
      bgColor: 'bg-green-600'
    })));
  }, []);

  const handleImageChange = (file, adId) => {
    setUploadedImages((prev) => ({
      ...prev,
      [adId]: URL.createObjectURL(file)
    }));
  };

  if (activeDiscounts.length === 0) return null;

  return (
    <div className="container mx-auto px-4 my-10">
      {activeDiscounts.map(discount => (
        <Advertisement 
          key={discount.id}
          title={discount.title}
          description={discount.description}
          linkTo={discount.linkTo}
          discount={discount.amount > 0 ? discount.amount : null}
          bgColor={discount.bgColor}
          onImageChange={(file) => handleImageChange(file, discount.id)}
          imageUrl={uploadedImages[discount.id] || discount.imageUrl}
        />
      ))}
    </div>
  );
};

export default DiscountAds;
