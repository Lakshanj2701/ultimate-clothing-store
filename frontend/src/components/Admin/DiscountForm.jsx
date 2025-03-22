
import React, { useState } from 'react';
import AddAdvertisementForm from '../Advertisements/AddAdvertisementForm';
import AdvertisementList from '../Advertisements/AdvertisementList';

const DiscountForm = () => {
  const [editingAd, setEditingAd] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleAddAdvertisement = () => {
    // Force refresh of the advertisement list
    setRefreshList(prev => prev + 1);
  };

  const handleEditAd = (advertisement, index) => {
    setEditingAd(advertisement);
    setEditingIndex(index);
    // Scroll to top of form
    window.scrollTo(0, 0);
  };

  const handleDeleteAd = () => {
    // Force refresh of the advertisement list
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Discount & Advertisement Management</h1>
      
      <div className="border p-4 mb-4 rounded bg-gray-50">
        {/* AddAdvertisementForm for adding/editing advertisements */}
        <AddAdvertisementForm 
          onAddAdvertisement={handleAddAdvertisement} 
          editingAd={editingAd}
          editingIndex={editingIndex}
          onCancelEdit={() => {
            setEditingAd(null);
            setEditingIndex(null);
          }}
        />
      </div>

      {/* Advertisement List with key based on refreshList for forcing re-render */}
      <AdvertisementList 
        key={refreshList}
        onEdit={handleEditAd} 
        onDelete={handleDeleteAd} 
      />
    </div>
  );
};

export default DiscountForm;