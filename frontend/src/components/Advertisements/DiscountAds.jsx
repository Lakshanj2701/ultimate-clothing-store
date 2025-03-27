
import React, { useState, useEffect } from 'react';
import { adService } from '../../services/api';
import Advertisement from './Advertisement';

const DiscountAds = () => {
  const [activeDiscounts, setActiveDiscounts] = useState([]);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const ads = await adService.getAll();
        setActiveDiscounts(ads.map((ad, index) => ({
          id: ad._id,
          title: ad.title,
          description: ad.description,
          amount: ad.discountAmount,
          imageUrl: ad.image, // Assuming the API returns the image URL
          linkTo: '/collections/custom',
          bgColor: 'bg-green-600'
        })));
      } catch (error) {
        console.error('Failed to fetch advertisements:', error);
      }
    };

    fetchAdvertisements();
  }, []);

  if (activeDiscounts.length === 0) return null;

  return (
    <div className="container mx-auto px-4 my-10">
      {activeDiscounts.map(discount => (
        <Advertisement 
          key={discount.id}
          title={discount.title}
          description={discount.description}
          linkTo={discount.linkTo}
          discount={discount.amount}
          bgColor={discount.bgColor}
          imageUrl={discount.imageUrl}
        />
      ))}
    </div>
  );
};

export default DiscountAds;
