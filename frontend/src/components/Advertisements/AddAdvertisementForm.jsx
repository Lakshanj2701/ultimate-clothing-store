
import React, { useState, useEffect } from 'react';

const AddAdvertisementForm = ({ onAddAdvertisement, editingAd, editingIndex, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Set form values when editing an existing advertisement
  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title || '');
      setDescription(editingAd.description || '');
      setAmount(editingAd.amount || '');
      setImagePreview(editingAd.imageUrl || null);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [editingAd]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !amount) {
      alert('Please fill in all required fields');
      return;
    }

    // Determine image URL (either from new file or existing)
    const imageUrl = imageFile 
      ? URL.createObjectURL(imageFile) 
      : (imagePreview || '');

    const adData = { title, description, amount, imageUrl };

    // If editing, update the existing advertisement
    if (isEditing && editingIndex !== null) {
      const existingAds = JSON.parse(localStorage.getItem('advertisements')) || [];
      existingAds[editingIndex] = adData;
      localStorage.setItem('advertisements', JSON.stringify(existingAds));
      
      if (onCancelEdit) onCancelEdit();
      alert('Advertisement updated successfully!');
    } 
    // Otherwise add a new advertisement
    else {
      const existingAds = JSON.parse(localStorage.getItem('advertisements')) || [];
      existingAds.push(adData);
      localStorage.setItem('advertisements', JSON.stringify(existingAds));
      alert('Advertisement added successfully!');
    }

    // Clear form fields
    resetForm();

    // Notify parent component
    if (onAddAdvertisement) onAddAdvertisement();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    if (onCancelEdit) onCancelEdit();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Advertisement' : 'Add New Advertisement'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-gray-700">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Discount Amount (%) <span className="text-red-500">*</span></label>
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
        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-32 h-32 object-cover border rounded"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {isEditing ? 'Update Advertisement' : 'Add Advertisement'}
        </button>
        
        {isEditing && (
          <button 
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddAdvertisementForm;