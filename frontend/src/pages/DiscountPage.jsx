import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DiscountCard from './DiscountCard';
import DiscountForm from './DiscountForm';

const DiscountPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [editingDiscount, setEditingDiscount] = useState(null);

    useEffect(() => {
        // Example static data (replace with API later)
        const sampleDiscounts = [
            { id: 1, title: 'SAVE10', description: 'Save 10% on orders over $50', amount: 10 },
            { id: 2, title: 'FREESHIP', description: 'Free shipping on all orders', amount: 0 },
        ];
        setDiscounts(sampleDiscounts);
    }, []);

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
    };

    const handleDelete = (id) => {
        // Handle delete (just remove from state for now)
        setDiscounts(discounts.filter(discount => discount.id !== id));
    };

    const handleFormSubmit = (newDiscount) => {
        if (editingDiscount) {
            // Update existing discount
            setDiscounts(discounts.map(discount => discount.id === editingDiscount.id ? { ...discount, ...newDiscount } : discount));
        } else {
            // Add new discount
            setDiscounts([...discounts, { ...newDiscount, id: discounts.length + 1 }]);
        }
        setEditingDiscount(null);  // Clear the form after submit
    };

    return (
        <div>
            <h1>Discounts</h1>
            {editingDiscount ? (
                <DiscountForm onSubmit={handleFormSubmit} existingDiscount={editingDiscount} />
            ) : (
                <DiscountForm onSubmit={handleFormSubmit} />
            )}
            <div className="mt-4">
                {discounts.map((discount) => (
                    <DiscountCard 
                        key={discount.id}
                        discount={discount}
                        onEdit={() => handleEdit(discount)}
                        onDelete={() => handleDelete(discount.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DiscountPage;
