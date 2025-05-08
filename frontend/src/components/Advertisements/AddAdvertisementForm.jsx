import React, { useState, useEffect } from 'react';
import { adService } from '../../services/api2';

const AddAdvertisementForm = ({ onAddAdvertisement, editingAd, editingIndex, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title || '');
      setDescription(editingAd.description || '');
      setAmount(editingAd.discountAmount || '');
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [editingAd]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    const adData = {
      title,
      description,
      discountAmount: amount,
      image: imageFile,
    };

    try {
      if (isEditing && editingAd._id) {
        await adService.update(editingAd._id, adData);
        alert('Advertisement updated successfully!');
      } else {
        await adService.create(adData);
        alert('Advertisement added successfully!');
      }

      onAddAdvertisement();
      resetForm();
    } catch (error) {
      console.error('Failed to save advertisement:', error);
      alert('Failed to save advertisement. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setImageFile(null);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Advertisement' : 'Add New Advertisement'}
      </h3>
      <div className="mb-4">
        <label className="block text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Discount Amount (%)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
        {isEditing ? 'Update Advertisement' : 'Add Advertisement'}
      </button>
    </form>
  );
};

export default AddAdvertisementForm;