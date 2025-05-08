import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { adService } from '../../services/api2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/clothin_logo.jpg';

const AdvertisementList = ({ onEdit, onDelete }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const ads = await adService.getAll();
        setAdvertisements(ads);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch advertisements:', error);
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await adService.delete(id);
        setAdvertisements((prev) => prev.filter((ad) => ad._id !== id));
        if (onDelete) onDelete();
        Swal.fire('Deleted!', 'Your advertisement has been deleted.', 'success');
      } catch (error) {
        console.error('Failed to delete advertisement:', error);
        Swal.fire('Error!', 'Failed to delete advertisement.', 'error');
      }
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
      doc.text('Advertisement Management Report', 14, logoHeight + 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
      
      // Company address
      doc.text('E3, Isurupura, Malabe', 14, logoHeight + 36);
      
      // Advertisement table
      autoTable(doc, {
        startY: logoHeight + 45,
        head: [['Title', 'Description', 'Discount', 'Status']],
        body: advertisements.map(ad => [
          ad.title || 'N/A',
          ad.description || 'N/A',
          ad.discountAmount ? `${ad.discountAmount}%` : 'N/A',
          'Active' // You can add status logic if needed
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
      doc.save('Advertisement_Management_Report.pdf');
    };

    img.onerror = function() {
      console.error('Failed to load logo');
      // Fallback without logo
      doc.setFontSize(18);
      doc.text('Advertisement Management Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text('E3, Isurupura, Malabe', 14, 36);
      
      autoTable(doc, {
        startY: 45,
        head: [['Title', 'Description', 'Discount', 'Status']],
        body: advertisements.map(ad => [
          ad.title || 'N/A',
          ad.description || 'N/A',
          ad.discountAmount ? `${ad.discountAmount}%` : 'N/A',
          'Active'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
      doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
      doc.save('Advertisement_Management_Report.pdf');
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
            <title>Advertisement Management Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .logo { height: 50px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #2980b9; color: white; }
              .footer { margin-top: 40px; display: flex; justify-content: space-between; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Advertisement Management Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>E3, Isurupura, Malabe</p>
              </div>
              <img src="${logoBase64}" alt="Company Logo" class="logo">
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${advertisements.map(ad => `
                  <tr>
                    <td>${ad.title || 'N/A'}</td>
                    <td>${ad.description || 'N/A'}</td>
                    <td>${ad.discountAmount ? `${ad.discountAmount}%` : 'N/A'}</td>
                    <td>Active</td>
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
              <title>Advertisement Management Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #2980b9; color: white; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>Advertisement Management Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>E3, Isurupura, Malabe</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${advertisements.map(ad => `
                    <tr>
                      <td>${ad.title || 'N/A'}</td>
                      <td>${ad.description || 'N/A'}</td>
                      <td>${ad.discountAmount ? `${ad.discountAmount}%` : 'N/A'}</td>
                      <td>Active</td>
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

  if (loading) {
    return <div className="text-center py-10">Loading advertisements...</div>;
  }

  if (advertisements.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Current Advertisements</h3>
          <div className="flex gap-2">
            <button
              onClick={generatePDFReport}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              disabled
            >
              PDF Report
            </button>
            <button
              onClick={printReport}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              disabled
            >
              Print Report
            </button>
          </div>
        </div>
        <div className="text-center py-4">No advertisements found</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Current Advertisements</h3>
        <div className="flex gap-2">
          <button
            onClick={generatePDFReport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            PDF Report
          </button>
          <button
            onClick={printReport}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Print Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {advertisements.map((ad) => (
          <div key={ad._id} className="border rounded-lg p-4 bg-white shadow-md">
            <div className="flex flex-col md:flex-row">
              {ad.image && (
                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                  <img 
                    src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}${ad.image}`} 
                    alt={ad.title} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="w-full md:w-3/4 md:pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold">{ad.title}</h4>
                    <p className="text-gray-600 mb-2">{ad.description}</p>
                    {ad.discountAmount && (
                      <div className="bg-red-600 text-white inline-block px-2 py-1 rounded-full text-sm font-bold mb-2">
                        {ad.discountAmount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(ad)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(ad._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvertisementList;