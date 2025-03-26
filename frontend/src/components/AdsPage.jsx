// src/components/AdsPage.jsx
import React, { useState } from 'react';
import AddAd from './AddAd';  // Import AddAd component
import AdList from './AdList';  // Import AdList component

const AdsPage = () => {
  const [ads, setAds] = useState([]);  // State to store ads

  const handleAdAdded = (newAd) => {
    setAds((prevAds) => [...prevAds, newAd]);  // Add the new ad to the state
  };

  return (
    <div>
      <AddAd onAdAdded={handleAdAdded} />  {/* Render the AddAd form */}
      <AdList ads={ads} />  {/* Render the list of ads */}
    </div>
  );
};

export default AdsPage;
