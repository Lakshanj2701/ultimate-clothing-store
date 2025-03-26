// src/components/DiscountCard.jsx
import React from 'react';

const DiscountCard = ({ discount, onEdit, onDelete }) => {
    return (
        <div className="border rounded p-4 shadow-md">
            <h2 className="text-xl font-bold">{discount.title}</h2>
            <p>Descriptionnnnn: {discount.description}</p>
            <p>Amount: {discount.amount}%</p>
            <div className="flex space-x-2 mt-2">
                <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={onEdit}>Edit</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={onDelete}>Delete</button>
            </div>
        </div>
        
    );
};
export default DiscountCard;
