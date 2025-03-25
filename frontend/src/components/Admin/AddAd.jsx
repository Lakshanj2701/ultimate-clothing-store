// src/components/AddAd.jsx
import React, { useState } from 'react';
import { adService } from '../services/api';  // Import adService

const AddAd = ({ onAdAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newAd = { title, description };

    try {
      // Call the backend to create a new ad
      const createdAd = await adService.create(newAd);
      onAdAdded(createdAd);  // Notify the parent component about the new ad
      setTitle('');  // Clear the form fields
      setDescription('');
    } catch (error) {
      console.error('Failed to add ad:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Advertisement</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Advertisement'}
        </button>
      </form>
    </div>
  );
};

export default AddAd;
