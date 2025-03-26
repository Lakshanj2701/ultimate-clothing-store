import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

export const transactionService = {
  async updateStatus(transactionId, newStatus) {
    try {
      await axios.put(`${BASE_URL}/api/checkout/${transactionId}/pay`, {
        paymentStatus: newStatus,
      });

      toast.success(`Transaction status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update transaction status');
    }
  },
};