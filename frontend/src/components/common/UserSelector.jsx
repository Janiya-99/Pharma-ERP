import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { getUsers } from "../../api/controlApi";

const UserSelector = ({ onSelect, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState(selectedUser?.name || selectedUser?.full_name || "");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (selectedUser) {
      setSearchTerm(selectedUser.name || selectedUser.full_name || "");
    } else {
      setSearchTerm("");
    }
  }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen && !searchTerm) return;
      
      setIsLoading(true);
      try {
        const res = await getUsers({ 
          page: 1, 
          limit: 10, 
          search: searchTerm 
        });
        if (res.success) {
          setUsers(res.data.items || res.data || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (isOpen) {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  const handleSelect = (user) => {
    setSearchTerm(user.name || user.full_name || "");
    setIsOpen(false);
    onSelect(user);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onSelect(null);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search users by name, email, or code..."
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {users.length === 0 && !isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">No users found.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                onClick={() => handleSelect(user)}
              >
                <div className="flex items-center">
                  <span className="font-normal block truncate">
                    {user.name || user.full_name} ({user.employee_code || "N/A"})
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
