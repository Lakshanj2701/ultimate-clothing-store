import React from 'react';
import { useState } from 'react';

const UserManagement = () => {

    const users = [
        {
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
        },
      ];
    
      const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer", // Default role
      });
    


    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            
            {/* Add New User Form */}
            <div className="p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4">Add New User</h3>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        {/* Form fields will go here */}
                    </div>
                </form>
            </div>
        </div>

  );
};

export default UserManagement;
