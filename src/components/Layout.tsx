import React from "react";
import { Link, useLocation } from "react-router-dom";

interface User {
  id: number;
  fullname: string;
  role: number;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-indigo-800 text-white"
      : "text-gray-300 hover:bg-indigo-700 hover:text-white";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-indigo-900 text-white">
        <div className="px-4 py-5">
          <h1 className="text-xl font-semibold">Restaurant Manager</h1>
        </div>
        <div className="px-4 py-3 border-t border-indigo-800">
          <p className="text-sm">Welcome, {user.fullname}</p>
          <p className="text-xs text-gray-400">
            {user.role === 0
              ? "Staff"
              : user.role === 1
              ? "Manager"
              : "Customer"}
          </p>
        </div>
        <ul className="mt-6">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 ${isActive(
                "/dashboard"
              )}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/bookings"
              className={`flex items-center px-4 py-2 ${isActive("/bookings")}`}
            >
              Bookings
            </Link>
          </li>
          <li>
            <Link
              to="/menu"
              className={`flex items-center px-4 py-2 ${isActive("/menu")}`}
            >
              Menu
            </Link>
          </li>
          <li>
            <Link
              to="/tables"
              className={`flex items-center px-4 py-2 ${isActive("/tables")}`}
            >
              Tables
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              className={`flex items-center px-4 py-2 ${isActive(
                "/categories"
              )}`}
            >
              Categories
            </Link>
          </li>
          <li>
            <Link
              to="/table-food"
              className={`flex items-center px-4 py-2 ${isActive(
                "/table-food"
              )}`}
            >
              Table Food
            </Link>
          </li>
          <li>
            <Link
              to="/bills"
              className={`flex items-center px-4 py-2 ${isActive("/bills")}`}
            >
              Bills
            </Link>
          </li>
          {user.role === 1 && (
            <li>
              <Link
                to="/users"
                className={`flex items-center px-4 py-2 ${isActive("/users")}`}
              >
                Users
              </Link>
            </li>
          )}
        </ul>
        <div className="mt-auto p-4">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
