// src/components/AdList.jsx
import React, { useEffect, useState } from 'react';
import { adService } from '../services/api';  // Import adService

const AdList = () => {
  const [ads, setAds] = useState([]);  // State to store ads
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    // Fetch ads when the component mounts
    const fetchAds = async () => {
      try {
        const data = await adService.getAll();  // Get all ads from the backend
        setAds(data);
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);  // Empty dependency array means this effect runs only once on mount

  if (loading) return <div>Loading...</div>;  // Show loading message while fetching

  return (
    <div>
      <h2>Advertisements</h2>
      <ul>
        {ads.map(ad => (
          <li key={ad._id}>
            <h3>{ad.title}</h3>
            <p>{ad.description}</p>
            {/* You can display more ad details here */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdList;
