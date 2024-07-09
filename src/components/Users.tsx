import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

interface User {
  id: number;
  fullname: string;
  phone: string;
  gmail: string;
  password: string;
  address: string;
  role: number;
  status: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7048/api/Users/getall?user_id=1",
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetch Users API Response:", response.data);

      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setUsers(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        throw new Error("Unexpected data structure from API");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to fetch users: ${error.response?.data || error.message}`
        );
      } else {
        setError("An unexpected error occurred while fetching users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://localhost:7048/api/Users/search?gmail=${searchTerm}&phone=${searchTerm}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Search API Response:", response.data);

      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setUsers(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        throw new Error("Unexpected data structure from API");
      }

      // Reset current page to 1 after search
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching users:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to search users: ${error.response?.data || error.message}`
        );
      } else {
        setError("An unexpected error occurred while searching users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (
        !newUser.fullname ||
        !newUser.gmail ||
        !newUser.phone ||
        !newUser.address ||
        newUser.role === undefined ||
        !newUser.password
      ) {
        throw new Error("Please fill in all required fields");
      }

      const response = await axios.post(
        "https://localhost:7048/api/Users/create?user_id=1",
        {
          ...newUser,
          role: Number(newUser.role),
          status: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Add User API Response:", response.data);
      fetchUsers();
      setNewUser({});
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding user:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to add user: ${error.response?.data || error.message}`
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while adding user.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://localhost:7048/api/Users/changestatus?id=${id}&user_id=1`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Change Status API Response:", response.data);
      fetchUsers();
    } catch (error) {
      console.error("Error changing user status:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to change user status: ${
            error.response?.data || error.message
          }`
        );
      } else {
        setError("An unexpected error occurred while changing user status.");
      }
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Users Management
      </h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out flex items-center"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          Search
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 ease-in-out flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddUser}
          className="mb-6 bg-white shadow-md rounded px-8 pt-6 pb-8"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.fullname || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, fullname: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={newUser.gmail || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, gmail: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={newUser.password || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="tel"
              placeholder="Phone"
              value={newUser.phone || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Address"
              value={newUser.address || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <select
              value={newUser.role === undefined ? "" : newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: Number(e.target.value) })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Role</option>
              <option value="0">Staff</option>
              <option value="1">Manager</option>
              <option value="2">Customer</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add User
          </button>
        </form>
      )}

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              {[
                "ID",
                "Full Name",
                "Phone",
                "Email",
                "Address",
                "Role",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() =>
                    handleSort(
                      header.toLowerCase().replace(" ", "") as keyof User
                    )
                  }
                >
                  <div className="flex items-center">
                    {header}
                    {sortConfig?.key ===
                      header.toLowerCase().replace(" ", "") &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.fullname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.gmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 0
                    ? "Staff"
                    : user.role === 1
                    ? "Manager"
                    : "Customer"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleChangeStatus(user.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-4 text-gray-500">No users found.</div>
      )}

      {users.length > itemsPerPage && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, sortedUsers.length)}
              </span>{" "}
              of <span className="font-medium">{sortedUsers.length}</span>{" "}
              results
            </p>
          </div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </button>
            {[...Array(Math.ceil(sortedUsers.length / itemsPerPage))].map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === index + 1
                      ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === Math.ceil(sortedUsers.length / itemsPerPage)
              }
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Users;
