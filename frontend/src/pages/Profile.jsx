import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import MyOrdersPage from './MyOrdersPage';
import api from '../services/api'; // Ensure you have the correct API instance

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatedReason, setUpdatedReason] = useState('');

  // Fetch return/refund requests for the logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchRefundRequests = async () => {
      try {
        const response = await api.get('/api/return-refund/my-requests');
        setRefundRequests(response); // Set the fetched requests
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load return/refund requests');
        setLoading(false);
      }
    };

    fetchRefundRequests();
  }, [user]);

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  // Helper function to handle delete request
  const handleDeleteRequest = async (requestId) => {
    try {
      await api.delete(`/api/return-refund/delete/${requestId}`);
      setRefundRequests(refundRequests.filter((request) => request._id !== requestId));
      toast.success('Return/Refund request deleted successfully');
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  // Helper function to handle update request
  const handleUpdateRequest = (requestId, currentReason) => {
    setSelectedRequest(requestId);
    setUpdatedReason(currentReason);
    setIsModalOpen(true);
  };

  // Submit the updated reason
  const handleSubmitUpdate = async () => {
    try {
      const response = await api.put(`/api/return-refund/update/${selectedRequest}`, { reason: updatedReason });
      setRefundRequests(refundRequests.map((request) => (request._id === selectedRequest ? response : request)));
      toast.success('Return/Refund request updated successfully');
      setIsModalOpen(false); // Close modal
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to view your profile</h1>
          <Link
            to="/login"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left section - Profile info */}
          <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{user.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{user.email}</p>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4 text-center"
              >
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mb-4"
            >
              Logout
            </button>

            {/* Added Forgot Password Link */}
            <p className="text-center text-sm mt-2">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-blue-500 hover:underline">
                Reset it here
              </Link>
            </p>
          </div>

          {/* Right section - Orders & Return/Refund Requests */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Return/Refund Requests</h2>
              {loading ? (
                <p>Loading return/refund requests...</p>
              ) : refundRequests.length > 0 ? (
                <div className="shadow-md rounded-lg p-4 mb-6">
                  <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                      <tr>
                        <th className="py-2 px-4">Order ID</th>
                        <th className="py-2 px-4">Reason</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundRequests.map((request) => (
                        <tr key={request._id} className="border-b">
                          {/* Update the rendering for orderId */}
                          <td className="py-2 px-4">{request.orderId ? request.orderId._id : 'N/A'}</td>
                          <td className="py-2 px-4">{request.reason}</td>
                          <td className="py-2 px-4">{request.status}</td>
                          <td className="py-2 px-4">
                            {request.status === 'Pending' && (
                              <div className="flex space-x-4">
                                <button
                                  onClick={() => handleDeleteRequest(request._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => handleUpdateRequest(request._id, request.reason)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Update
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>You have no return/refund requests.</p>
              )}
            </div>
            {/* Orders */}
            <MyOrdersPage />
          </div>
        </div>
      </div>

      {/* Modal for updating reason */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Update Reason</h3>
            <textarea
              value={updatedReason}
              onChange={(e) => setUpdatedReason(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter updated reason for return/refund"
              rows="4"
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleSubmitUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;