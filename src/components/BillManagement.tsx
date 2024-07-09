import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";

interface Bill {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  createdTime: string;
  createdStaffId: number;
  createdStaffName: string;
  paidTime: string | null;
  updatedStaffId: number | null;
  updatedStaffName: string | null;
  status: number;
}

const BillManagement: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  // Lấy thông tin người dùng từ localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user ? user.id : null;

  useEffect(() => {
    if (userId) {
      fetchBills();
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [userId]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7048/api/Bills/getall",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("API Response:", response.data);

      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        setBills(response.data.$values);
      } else if (Array.isArray(response.data)) {
        setBills(response.data);
      } else {
        console.error("Unexpected data structure:", response.data);
        throw new Error("Unexpected data structure from API");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to fetch bills. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (customerPhone: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://localhost:7048/api/Bills/create?customerPhone=${customerPhone}&user_id=${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Create Bill Response:", response.data);
      setSuccessMessage("Bill created successfully!");
      fetchBills();
    } catch (error) {
      console.error("Error creating bill:", error);
      setError("Failed to create bill. Please try again.");
    }
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://localhost:7048/api/Bills/update?id=${id}&status=${status}&user_id=${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Update Status Response:", response.data);
      setSuccessMessage("Bill status updated successfully!");
      fetchBills();
    } catch (error) {
      console.error("Error updating bill status:", error);
      setError("Failed to update bill status. Please try again.");
    }
  };

  const pageCount = Math.ceil(bills.length / itemsPerPage);

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  if (!userId)
    return (
      <div className="text-red-500 text-center py-4">
        Please log in to access this page.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bill Management</h1>

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

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Bill</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Customer Phone"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
            id="customerPhone"
          />
          <button
            onClick={() =>
              handleCreateBill(
                (document.getElementById("customerPhone") as HTMLInputElement)
                  .value
              )
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Bill
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created Time
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
            {bills
              .slice(pagesVisited, pagesVisited + itemsPerPage)
              .map((bill) => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bill.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bill.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bill.customerPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${bill.totalPrice.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(bill.createdTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bill.status === 0 ? "Unpaid" : "Paid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {bill.status === 0 && (
                      <button
                        onClick={() => handleUpdateStatus(bill.id, 1)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {bills.length > itemsPerPage && (
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

export default BillManagement;
