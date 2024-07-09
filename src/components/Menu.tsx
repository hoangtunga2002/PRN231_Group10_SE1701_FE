import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number | null;
  categoryId: number;
  categoryName: string;
  status: number;
}

interface Category {
  id: number;
  name: string;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const itemsPerPage = 5;
  const pagesVisited = pageNumber * itemsPerPage;

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://localhost:7048/api/Foods/getall"
      );
      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setMenuItems(response.data.$values);
      } else {
        throw new Error("Unexpected data structure from API");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setError("Failed to fetch menu items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.post(
        "https://localhost:7048/api/Categories/getall"
      );
      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setCategories(response.data.$values);
      } else {
        throw new Error("Unexpected data structure from API");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please try again later.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "categoryId") {
      setNewItem({ ...newItem, categoryId: Number(value) });
    } else if (name === "price") {
      setNewItem({ ...newItem, [name]: value === "" ? null : Number(value) });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(
        "https://localhost:7048/api/Foods/create?user_id=1",
        newItem
      );
      console.log("Server response:", response.data);
      setSuccessMessage("Menu item added successfully!");
      fetchMenuItems();
      setNewItem({});
    } catch (error) {
      console.error("Error creating menu item:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(`Failed to create menu item: ${error.response.data}`);
      } else {
        setError("Failed to create menu item. Please try again.");
      }
    }
  };

  const pageCount = Math.ceil(menuItems.length / itemsPerPage);

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>

      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newItem.name || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newItem.description || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newItem.price || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            step="0.01"
          />
          <select
            name="categoryId"
            value={newItem.categoryId || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Item
        </button>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuItems
              .slice(pagesVisited, pagesVisited + itemsPerPage)
              .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {item.price != null ? `$${item.price.toFixed(2)}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {item.categoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {menuItems.length > itemsPerPage && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={"flex justify-center items-center my-4"}
          previousLinkClassName={
            "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          }
          nextLinkClassName={
            "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          }
          disabledClassName={"bg-gray-100 text-gray-400 cursor-not-allowed"}
          pageClassName={
            "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          }
          activeClassName={
            "bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          }
        />
      )}
    </div>
  );
};

export default Menu;
