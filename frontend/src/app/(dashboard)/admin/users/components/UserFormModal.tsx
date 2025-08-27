import React, { useState, useEffect } from 'react';
import Button from '../../../../../../components/ui/Button';
import { X } from 'lucide-react';
import { User } from '../../../../../../services/userService';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  users: User[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  users
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'technician',
    status: 'pending', // New users start as pending until they complete profile
    department: '',
    employee_id: '',
    phone_number: '',
    site_location: '',
    supervisor: '',
    bio: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status || 'active',
        department: user.department || '',
        employee_id: user.employee_id || '',
        phone_number: user.phone_number || '',
        site_location: user.site_location || '',
        supervisor: user.supervisor || '',
        bio: user.bio || '',
        is_active: user.status === 'active'
      });
    } else {
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'technician',
        status: 'pending', // New users start as pending
        department: '',
        employee_id: '',
        phone_number: '',
        site_location: '',
        supervisor: '',
        bio: '',
        is_active: true
      });
    }
  }, [user, isOpen]);

  const handleSave = () => {
    // For new users, only validate essential fields
    if (!user) {
      const requiredFields = ['first_name', 'last_name', 'email', 'role'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        return typeof value === 'string' ? !value.trim() : !value;
      });
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}`);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Check for duplicate email (only when creating new user)
      const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (emailExists) {
        alert('Email already exists. Please use a different email address.');
        return;
      }

      // Auto-generate username from email (ensure it's unique)
      const baseUsername = formData.email.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (users.some(u => u.username.toLowerCase() === username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Generate a secure temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase() + '!';
      
      // Prepare simplified user data for new user creation
      // Supervisor assignment will be handled later through allocation system
      const newUserData: any = {
        username: username,
        email: formData.email.toLowerCase(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: tempPassword,
        confirm_password: tempPassword,
        role: formData.role,
      };

      // Console notification for temporary password (MVP simulation)
      console.log('\n' + '='.repeat(70));
      console.log('📧 NEW USER CREATED - EMAIL NOTIFICATION (Console Simulation)');
      console.log('='.repeat(70));
      console.log(`To: ${formData.email}`);
      console.log(`Name: ${formData.first_name} ${formData.last_name}`);
      console.log(`Username: ${username}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log(`Role: ${formData.role}`);
      console.log('');
      console.log('Welcome to TexPro AI! Please log in with the credentials above.');
      console.log('You will be required to change your password and complete your');
      console.log('profile information on your first login.');
      console.log('NOTE: Supervisor assignment will be handled through the Allocation system.');
      console.log('='.repeat(70) + '\n');

      const savedUser: User = {
        ...newUserData,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: formData.role as 'admin' | 'supervisor' | 'technician' | 'inspector' | 'analyst',
        status: 'pending' as const,
        department: '',
        employee_id: '',
        phone_number: '',
        site_location: '',
        supervisor: '', // Will be assigned later through allocation
        bio: ''
      };

      // For API call, only send the required backend fields
      const apiData = {
        username: newUserData.username,
        email: newUserData.email,
        first_name: newUserData.first_name,
        last_name: newUserData.last_name,
        password: newUserData.password,
        confirm_password: newUserData.confirm_password,
        role: newUserData.role,
        ...(newUserData.supervisor && { supervisor: newUserData.supervisor })
      };

      onSave(savedUser);
    } else {
      // For existing users, validate all fields they're trying to update
      const requiredFields = ['first_name', 'last_name', 'email'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        return typeof value === 'string' ? !value.trim() : !value;
      });
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}`);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Employee ID validation (optional but if provided, must match format)
      if (formData.employee_id) {
        const employeeIdRegex = /^[A-Z]{2}\d{4,6}$/;
        if (!employeeIdRegex.test(formData.employee_id.toUpperCase())) {
          alert('Employee ID must be format: AB1234 (2 letters + 4-6 digits)');
          return;
        }
      }

      // Phone number validation (optional but if provided, must match Mali format)
      if (formData.phone_number) {
        const phoneRegex = /^\+?223\d{8}$/;
        if (!phoneRegex.test(formData.phone_number)) {
          alert('Phone number must be Mali format: +223XXXXXXXX');
          return;
        }
      }

      // Check for duplicate email (only if email changed)
      if (user.email !== formData.email) {
        const emailExists = users.some(u => u.id !== user.id && u.email.toLowerCase() === formData.email.toLowerCase());
        if (emailExists) {
          alert('Email already exists. Please use a different email address.');
          return;
        }
      }

      // Prepare user data for update
      const updatedUserData = {
        email: formData.email.toLowerCase(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role as 'admin' | 'supervisor' | 'technician' | 'inspector' | 'analyst',
        status: formData.status as 'active' | 'inactive' | 'suspended' | 'pending',
        department: formData.department || undefined,
        employee_id: formData.employee_id ? formData.employee_id.toUpperCase() : undefined,
        phone_number: formData.phone_number || undefined,
        site_location: formData.site_location || undefined,
        supervisor: formData.supervisor || undefined,
        bio: formData.bio || undefined,
        is_active: formData.is_active,
      };

      const savedUser: User = {
        ...user,
        ...updatedUserData,
        updated_at: new Date().toISOString()
      };

      onSave(savedUser);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Simplified form for new users - only essential fields */}
          {!user ? (
            <>
              {/* Essential Fields Only for New Users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="technician">Technician</option>
                  <option value="inspector">Inspector</option>
                  <option value="analyst">Analyst</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Auto-generation notification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Automatic Account Setup
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Username will be auto-generated from email</li>
                        <li>Employee ID will be auto-generated based on role</li>
                        <li>Temporary password will be created and sent via email</li>
                        <li>User must change password and complete profile on first login</li>
                        <li><strong>Supervisor assignment</strong> will be handled through the Allocation system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Full form for editing existing users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="technician">Technician</option>
                    <option value="inspector">Inspector</option>
                    <option value="analyst">Analyst</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Production, Maintenance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Location</label>
                  <input
                    type="text"
                    value={formData.site_location}
                    onChange={(e) => setFormData({...formData, site_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Sikasso, Koutiala"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                    <span className="text-xs text-gray-500 ml-1">(Format: AB1234)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., TC001, AD001"
                    pattern="[A-Z]{2}\d{4,6}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                    <span className="text-xs text-gray-500 ml-1">(Mali: +223XXXXXXXX)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="+22312345678"
                    pattern="\+?223\d{8}"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                <select
                  value={formData.supervisor}
                  onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Supervisor (Optional)</option>
                  {users.filter(u => u.role === 'admin' || u.role === 'supervisor').map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.first_name} {supervisor.last_name} ({supervisor.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  maxLength={500}
                  placeholder="Short description or notes about the user..."
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} className="flex-1">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;