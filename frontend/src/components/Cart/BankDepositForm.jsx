import React, { useState, useRef } from 'react';

const BankDepositForm = () => {
  const [bankName, setBankName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!description) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount))) {
      newErrors.amount = 'Amount must be a number';
    }
    
    if (!imageFile) {
      newErrors.imageFile = 'Bank slip image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const resetForm = () => {
    setBankName('');
    setDescription('');
    setAmount('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const imageUrl = URL.createObjectURL(imageFile);
    const newDeposit = { 
      bankName, 
      description, 
      amount, 
      imageUrl 
    };

    // Save to localStorage
    const existingDeposits = JSON.parse(localStorage.getItem('bankDeposits')) || [];
    existingDeposits.push(newDeposit);
    localStorage.setItem('bankDeposits', JSON.stringify(existingDeposits));

    alert('Bank deposit added successfully!');
    resetForm();
  };

  return (
    <div>
      {isFormVisible && (
        <form onSubmit={handleFormSubmit} className="p-6 bg-white shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Add Bank Deposit</h3>
            <button
              type="button"
              onClick={() => setIsFormVisible(false)}
              className="text-xl font-bold text-gray-600 hover:text-gray-900"
            >
              &minus;
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={`w-full p-2 border rounded ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-2 border rounded ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Upload Bank Slip <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`w-full p-2 border rounded ${errors.imageFile ? 'border-red-500' : 'border-gray-300'}`}
              ref={fileInputRef}
              required
            />
            {errors.imageFile && <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>}
            
            {/* Simple image preview */}
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Bank slip preview" 
                className="max-h-40 mt-2" 
              />
            )}
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
              Submit Deposit
            </button>
            
            <button 
              type="button" 
              onClick={resetForm}
              className="border border-gray-300 text-gray-700 py-2 px-4 rounded"
            >
              Reset
            </button>
          </div>
        </form>
      )}
      
      {!isFormVisible && (
        <button
          type="button"
          onClick={() => setIsFormVisible(true)}
          className="bg-blue-600 text-white w-full py-3 px-4 rounded font-semibold"
        >
          Bank Deposit
        </button>
      )}
    </div>
  );
};

export default BankDepositForm;