import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/clothin_logo.jpg'; // Make sure this path is correct

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const filterProducts = () => {
    let result = products;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.sku?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:9000/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setProducts(products.filter((product) => product._id !== id));
          Swal.fire('Deleted!', 'The product has been deleted.', 'success');
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire('Error', 'Failed to delete product.', 'error');
        }
      }
    });
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
      doc.text('Product Management Report', 14, logoHeight + 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
      
      // Company address
      doc.text('E3, Isurupura, Malabe', 14, logoHeight + 36);
      
      // Product table
      autoTable(doc, {
        startY: logoHeight + 45,
        head: [['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock']],
        body: filteredProducts.map(product => [
          product.name,
          product.sku || 'N/A',
          product.category || 'N/A',
          product.brand || 'N/A',
          `Rs.${product.price?.toFixed(2) || '0.00'}`,
          product.countInStock || 0
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
      doc.save('Product_Management_Report.pdf');
    };

    img.onerror = function() {
      console.error('Failed to load logo');
      // Fallback without logo
      doc.setFontSize(18);
      doc.text('Product Management Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text('E3, Isurupura, Malabe', 14, 36);
      
      autoTable(doc, {
        startY: 45,
        head: [['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock']],
        body: filteredProducts.map(product => [
          product.name,
          product.sku || 'N/A',
          product.category || 'N/A',
          product.brand || 'N/A',
          `Rs.${product.price?.toFixed(2) || '0.00'}`,
          product.countInStock || 0
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
      
      doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
      doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
      doc.save('Product_Management_Report.pdf');
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
            <title>Product Management Report</title>
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
                <h1>Product Management Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>E3, Isurupura, Malabe</p>
              </div>
              <img src="${logoBase64}" alt="Company Logo" class="logo">
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                ${filteredProducts.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>${product.brand || 'N/A'}</td>
                    <td>Rs.${product.price?.toFixed(2) || '0.00'}</td>
                    <td>${product.countInStock || 0}</td>
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
              <title>Product Management Report</title>
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
              <h1>Product Management Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>E3, Isurupura, Malabe</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredProducts.map(product => `
                    <tr>
                      <td>${product.name}</td>
                      <td>${product.sku || 'N/A'}</td>
                      <td>${product.category || 'N/A'}</td>
                      <td>${product.brand || 'N/A'}</td>
                      <td>Rs.${product.price?.toFixed(2) || '0.00'}</td>
                      <td>${product.countInStock || 0}</td>
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
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Product Management</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
          <Link
            to="/admin/products/new"
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition flex items-center justify-center"
          >
            Add New
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-gray-700 rounded-lg">
          <thead className="bg-gray-200 text-md font-semibold text-gray-700 uppercase">
            <tr>
              <th className="py-4 px-6 text-left">Name</th>
              <th className="py-4 px-6 text-left">Price</th>
              <th className="py-4 px-6 text-left">SKU</th>
              <th className="py-4 px-6 text-left">Category</th>
              <th className="py-4 px-6 text-left">Brand</th>
              <th className="py-4 px-6 text-left">Stock</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                  <td className="p-4 font-semibold text-green-600">Rs.{product.price?.toFixed(2)}</td>
                  <td className="p-4">{product.sku || 'N/A'}</td>
                  <td className="p-4">{product.category || 'N/A'}</td>
                  <td className="p-4">{product.brand || 'N/A'}</td>
                  <td className="p-4">{product.countInStock || 0}</td>
                  <td className="p-4 space-x-2">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="inline-block bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="inline-block bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 text-lg font-medium">
                  No Products Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;