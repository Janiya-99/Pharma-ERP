import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { getUsers } from "../../api/controlApi";

const UserSelector = ({
  onSelect,
  selectedUser,
}: {
  onSelect?: (user: any) => void;
  selectedUser?: any;
}) => {
  const [searchTerm, setSearchTerm] = useState(
    selectedUser?.name || selectedUser?.full_name || ""
  );
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
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
          search: searchTerm,
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

  const handleSelect = (user: any) => {
    setSearchTerm(user?.name || user?.full_name || "");
    setIsOpen(false);
    onSelect?.(user);
  };

  const handleInputChange = (e: any) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onSelect?.(null);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          placeholder="Search users by name, email, or code..."
          value={searchTerm}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
        {isLoading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {users.length === 0 && !isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No users found.
            </div>
          ) : (
            users.map((user: any) => (
              <div
                key={user.id}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                onClick={() => handleSelect(user)}
              >
                <div className="flex items-center">
                  <span className="block truncate font-normal">
                    {user.name || user.full_name} ({user.employee_code || "N/A"}
                    )
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{user.email}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
