import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/clothin_logo.jpg';

const AdminReturnRefundPage = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch return/refund requests from the server
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/return-refund?status=${statusFilter}`);
      // Make sure we're accessing response.data if the API wraps the response
      const requests = response.data || response || [];
      setRefundRequests(Array.isArray(requests) ? requests : []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load return/refund requests');
      setLoading(false);
      setRefundRequests([]);
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.put(`/api/admin/return-refund/approve/${requestId}`);
      // Optimistically update the UI
      setRefundRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: 'Approved' } 
            : request
        )
      );
      toast.success('Request approved successfully');
      // Refresh data after a short delay
      setTimeout(fetchRequests, 500);
    } catch (error) {
      toast.error('Failed to approve the request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/api/admin/return-refund/reject/${requestId}`);
      // Optimistically update the UI
      setRefundRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: 'Rejected' } 
            : request
        )
      );
      toast.success('Request rejected successfully');
      // Refresh data after a short delay
      setTimeout(fetchRequests, 500);
    } catch (error) {
      toast.error('Failed to reject the request');
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Create a canvas to process the logo
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = logo;
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const logoDataURL = canvas.toDataURL('image/jpeg');
      
      // Add logo to PDF (30mm width, maintain aspect ratio)
      const logoWidth = 30;
      const logoHeight = (img.height * logoWidth) / img.width;
      doc.addImage(logoDataURL, 'JPEG', 15, 10, logoWidth, logoHeight);
      
      // Report title and date
      doc.setFontSize(18);
      doc.text('Return/Refund Requests Report', 14, logoHeight + 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
      doc.text(`Filter: ${statusFilter === 'all' ? 'All Requests' : statusFilter}`, 14, logoHeight + 36);
      
      // Company address
      doc.text('E3, Isurupura, Malabe', 14, logoHeight + 44);
      
      // Requests table
      autoTable(doc, {
        startY: logoHeight + 55,
        head: [['Order ID', 'Reason', 'Status', 'Request Date']],
        body: refundRequests.map(request => [
          request.orderId?._id || 'N/A',
          request.reason || 'N/A',
          request.status || 'N/A',
          request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      // Signing area
      doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
      doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
      
      // Save the PDF
      doc.save('Return_Refund_Requests_Report.pdf');
      toast.success('PDF report generated successfully');
    };

    img.onerror = function() {
      console.error('Failed to load logo');
      // Fallback without logo
      doc.setFontSize(18);
      doc.text('Return/Refund Requests Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Filter: ${statusFilter === 'all' ? 'All Requests' : statusFilter}`, 14, 36);
      doc.text('E3, Isurupura, Malabe', 14, 44);
      
      autoTable(doc, {
        startY: 55,
        head: [['Order ID', 'Reason', 'Status', 'Request Date']],
        body: refundRequests.map(request => [
          request.orderId?._id || 'N/A',
          request.reason || 'N/A',
          request.status || 'N/A',
          request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
      doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
      doc.save('Return_Refund_Requests_Report.pdf');
      toast.success('PDF report generated successfully');
    };
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    
    // Convert logo to base64 for the print window
    const reader = new FileReader();
    reader.onload = function() {
      const logoBase64 = reader.result;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Return/Refund Requests Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .logo { height: 50px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #2980b9; color: white; }
              .footer { margin-top: 40px; display: flex; justify-content: space-between; }
              .filter-info { margin: 10px 0; font-weight: bold; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Return/Refund Requests Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p class="filter-info">Filter: ${statusFilter === 'all' ? 'All Requests' : statusFilter}</p>
                <p>E3, Isurupura, Malabe</p>
              </div>
              <img src="${logoBase64}" alt="Company Logo" class="logo">
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                ${refundRequests.map(request => `
                  <tr>
                    <td>${request.orderId?._id || 'N/A'}</td>
                    <td>${request.reason || 'N/A'}</td>
                    <td>${request.status || 'N/A'}</td>
                    <td>${request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <div>
                <p>Manager Signature: ___________________</p>
              </div>
              <div>
                <p>Date: ___________________</p>
              </div>
            </div>
            
            <button onclick="window.print()">Print Report</button>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    };
    
    // Fetch the logo and convert to base64
    fetch(logo)
      .then(res => res.blob())
      .then(blob => reader.readAsDataURL(blob))
      .catch(error => {
        console.error('Error loading logo:', error);
        // Fallback without logo
        printWindow.document.write(`
          <html>
            <head>
              <title>Return/Refund Requests Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #2980b9; color: white; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                .filter-info { margin: 10px 0; font-weight: bold; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>Return/Refund Requests Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p class="filter-info">Filter: ${statusFilter === 'all' ? 'All Requests' : statusFilter}</p>
              <p>E3, Isurupura, Malabe</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${refundRequests.map(request => `
                    <tr>
                      <td>${request.orderId?._id || 'N/A'}</td>
                      <td>${request.reason || 'N/A'}</td>
                      <td>${request.status || 'N/A'}</td>
                      <td>${request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                <div>
                  <p>Manager Signature: ___________________</p>
                </div>
                <div>
                  <p>Date: ___________________</p>
                </div>
              </div>
              
              <button onclick="window.print()">Print Report</button>
              <button onclick="window.close()">Close</button>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Return/Refund Requests</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={generatePDFReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            PDF Report
          </button>
          <button
            onClick={printReport}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading return/refund requests...</p>
      ) : refundRequests.length > 0 ? (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-gray-700 rounded-lg">
            <thead className="bg-gray-200 text-md font-semibold text-gray-700 uppercase">
              <tr>
                <th className="py-4 px-6 text-left">Order ID</th>
                <th className="py-4 px-6 text-left">Reason</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Request Date</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {refundRequests.map((request) => (
                <tr key={request._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                    {request.orderId?._id || 'N/A'}
                  </td>
                  <td className="p-4">{request.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 space-x-2">
                    {request.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="inline-block bg-green-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="inline-block bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-10 text-gray-500 text-lg font-medium">
          No return/refund requests found.
        </p>
      )}
    </div>
  );
};

export default AdminReturnRefundPage;