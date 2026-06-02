import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../../services/userApi';
import type { UserOption } from '../../services/userApi';

interface UserSearchInputProps {
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  onChange,
  placeholder = 'Cari karyawan...',
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users when search term changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setFilteredUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        // Use the centralized userApi service
        const response = await userApi.searchUsers(searchTerm.trim(), 1);

        // Parse response - use extractUsers helper to handle different response formats
        const userList: UserOption[] = userApi.extractUsers(response);

        setFilteredUsers(userList);
        setShowDropdown(true);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync selected user display with searchTerm
  useEffect(() => {
    if (selectedUser && searchTerm !== selectedUser.name) {
      // If searchTerm changed but doesn't match selected user, clear selection
      if (!searchTerm.trim()) {
        setSelectedUser(null);
        onChange('');
      }
    }
  }, [searchTerm, selectedUser, onChange]);

  const handleSelectUser = (user: UserOption) => {
    setSelectedUser(user);
    onChange(user.id);
    setSearchTerm(user.name); // Display user name after selection
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    if (!value.trim()) {
      setSelectedUser(null);
      onChange('');
      setFilteredUsers([]);
    }
    // Don't filter locally - let the useEffect handle API call
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() && !selectedUser) {
      setShowDropdown(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    onChange('');
    setFilteredUsers([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        {selectedUser && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Hapus pilihan"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-gray-400 mt-1">
                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                  {user.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchTerm.trim() && filteredUsers.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Tidak ada karyawan ditemukan
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
