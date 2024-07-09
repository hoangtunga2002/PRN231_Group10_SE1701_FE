import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

interface TableFood {
  id: number;
  tableId: number;
  tableNumber: number;
  bookingId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  foodId: number;
  foodName: string;
  status: number;
}

interface Food {
  id: number;
  name: string;
}

const TableFoodManagement: React.FC = () => {
  const [tableFoods, setTableFoods] = useState<TableFood[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [newTableFood, setNewTableFood] = useState<Partial<TableFood>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableFood;
    direction: "asc" | "desc";
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTableFoods();
    fetchFoods();
  }, []);

  const fetchTableFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7048/api/TableFood/getall",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Table Foods API Response:", response.data);

      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setTableFoods(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setTableFoods(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        throw new Error("Unexpected data structure from API");
      }
    } catch (error) {
      console.error("Error fetching table foods:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to fetch table foods: ${
            error.response?.data || error.message
          }`
        );
      } else {
        setError("An unexpected error occurred while fetching table foods.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7048/api/Foods/getall",
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Foods API Response:", response.data);

      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setFoods(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setFoods(response.data);
      } else {
        console.error("Unexpected food data structure:", response.data);
        throw new Error("Unexpected food data structure from API");
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      setError("Failed to fetch foods. Please try again later.");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7048/api/TableFood/search?customerPhone=${searchTerm}&foodId=${searchTerm}`,
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
        setTableFoods(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setTableFoods(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        throw new Error("Unexpected data structure from API");
      }

      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching table foods:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to search table foods: ${
            error.response?.data || error.message
          }`
        );
      } else {
        setError("An unexpected error occurred while searching table foods.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTableFood({
      ...newTableFood,
      [name]: name === "tableId" || name === "foodId" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7048/api/TableFood/create",
        {
          tableId: newTableFood.tableId,
          foodId: [newTableFood.foodId],
          bookingId: newTableFood.bookingId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: 1 },
        }
      );
      console.log("Create Table Food Response:", response.data);
      fetchTableFoods();
      setNewTableFood({});
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating table food:", error);
      if (axios.isAxiosError(error)) {
        setError(
          `Failed to create table food: ${
            error.response?.data || error.message
          }`
        );
      } else {
        setError("An unexpected error occurred while creating table food.");
      }
    }
  };

  const handleChangeStatus = async (id: number, newStatus: number) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const requestData = {
        id: id,
        status: newStatus,
        user_id: 1,
      };
      console.log("Change Status Request Data:", requestData);

      const response = await axios.put(
        "https://localhost:7048/api/TableFood/changestatus",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Change Status Response:", response.data);
      fetchTableFoods();
    } catch (error) {
      console.error("Error changing table food status:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || error.message;
        console.error("Detailed error:", errorMessage);
        if (typeof errorMessage === "object") {
          console.error("Error object:", JSON.stringify(errorMessage, null, 2));
          setError(
            `Failed to change table food status: ${JSON.stringify(
              errorMessage
            )}`
          );
        } else {
          setError(`Failed to change table food status: ${errorMessage}`);
        }
      } else {
        setError(
          "An unexpected error occurred while changing table food status."
        );
      }
    }
  };

  const handleSort = (key: keyof TableFood) => {
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

  const sortedTableFoods = React.useMemo(() => {
    let sortableItems = [...tableFoods];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tableFoods, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTableFoods.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Table Food Management</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer phone or food ID"
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
          Add Table Food
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
          onSubmit={handleSubmit}
          className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Add New Table Food</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="tableId"
              placeholder="Table ID"
              value={newTableFood.tableId || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <select
              name="foodId"
              value={newTableFood.foodId || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Food</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="bookingId"
              placeholder="Booking ID"
              value={newTableFood.bookingId || ""}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Table Food
          </button>
        </form>
      )}

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              {["Table", "Customer", "Food", "Status", "Actions"].map(
                (header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      handleSort(header.toLowerCase() as keyof TableFood)
                    }
                  >
                    <div className="flex items-center">
                      {header}
                      {sortConfig?.key === header.toLowerCase() &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 ml-1" />
                        ))}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((tableFood) => (
              <tr key={tableFood.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Table {tableFood.tableNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {tableFood.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tableFood.customerPhone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {tableFood.foodName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tableFood.status === 0
                        ? "bg-red-100 text-red-800"
                        : tableFood.status === 1
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {tableFood.status === 0
                      ? "Cancelled"
                      : tableFood.status === 1
                      ? "Ordered"
                      : "Served"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {tableFood.status === 1 && (
                    <button
                      onClick={() => handleChangeStatus(tableFood.id, 2)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Mark as Served
                    </button>
                  )}
                  {tableFood.status !== 0 && (
                    <button
                      onClick={() => handleChangeStatus(tableFood.id, 0)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tableFoods.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No table foods found.
        </div>
      )}

      {tableFoods.length > itemsPerPage && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, sortedTableFoods.length)}
              </span>{" "}
              of <span className="font-medium">{sortedTableFoods.length}</span>{" "}
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
            {[...Array(Math.ceil(sortedTableFoods.length / itemsPerPage))].map(
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
                currentPage ===
                Math.ceil(sortedTableFoods.length / itemsPerPage)
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

export default TableFoodManagement;
