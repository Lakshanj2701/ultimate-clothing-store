import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiscountForm from '../components/Admin/DiscountForm';

const EditDiscountPage = () => {
    const { id } = useParams();  // Get the discount ID from the URL params
    const navigate = useNavigate();  // To navigate back to the list after save
    const [discount, setDiscount] = useState(null);

    useEffect(() => {
        // Fetch the discount details based on the ID (replace with API later)
        const fetchDiscount = () => {
            // Example static data (replace with API later)
            const sampleDiscounts = [
                { id: 1, title: 'SAVE10', description: 'Save 10% on orders over $50', amount: 10 },
                { id: 2, title: 'FREESHIP', description: 'Free shipping on all orders', amount: 0 },
            ];
            const discountToEdit = sampleDiscounts.find(discount => discount.id === parseInt(id));
            if (discountToEdit) {
                setDiscount(discountToEdit);
            } else {
                // Handle error if discount not found
                console.error('Discount not found');
            }
        };

        fetchDiscount();
    }, [id]);

    const handleFormSubmit = (updatedDiscount) => {
        // Update the discount in the list (API call would be used here)
        console.log('Updated discount:', updatedDiscount);
        // After submitting, navigate to the discount list or wherever needed
        navigate('/admin/discounts/list');
    };

    if (!discount) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Edit Discount</h1>
            <DiscountForm onSubmit={handleFormSubmit} existingDiscount={discount} />
        </div>
    );
};

export default EditDiscountPage;
