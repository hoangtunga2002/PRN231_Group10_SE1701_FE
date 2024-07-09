import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";

interface Category {
  id: number;
  name: string;
  description: string;
  status: number;
}

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://localhost:7048/api/Categories/getall?user_id=1"
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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.post(
        "https://localhost:7048/api/Categories/create?user_id=1",
        newCategory
      );
      setSuccessMessage("Category created successfully!");
      fetchCategories();
      setNewCategory({});
    } catch (error) {
      console.error("Error creating category:", error);
      setError("Failed to create category. Please try again.");
    }
  };

  const handleUpdate = async (
    id: number,
    updatedCategory: Partial<Category>
  ) => {
    try {
      await axios.put(
        `https://localhost:7048/api/Categories/update?user_id=1`,
        { ...updatedCategory, id }
      );
      setSuccessMessage("Category updated successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      setError("Failed to update category. Please try again.");
    }
  };

  const handleChangeStatus = async (id: number) => {
    try {
      await axios.put(
        `https://localhost:7048/api/Categories/changestatus?id=${id}&user_id=1`
      );
      setSuccessMessage("Category status changed successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error changing category status:", error);
      setError("Failed to change category status. Please try again.");
    }
  };

  const pageCount = Math.ceil(categories.length / itemsPerPage);

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Categories Management</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={newCategory.name || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newCategory.description || ""}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Category
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
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories
              .slice(pagesVisited, pagesVisited + itemsPerPage)
              .map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleChangeStatus(category.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Change Status
                    </button>
                    <button
                      onClick={() => {
                        // Here you would typically open a modal or form for editing
                        // For simplicity, we'll just update the name
                        const newName = prompt(
                          "Enter new name for category:",
                          category.name
                        );
                        if (newName) {
                          handleUpdate(category.id, {
                            ...category,
                            name: newName,
                          });
                        }
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {categories.length > itemsPerPage && (
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

export default CategoriesManagement;
