import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Bookings from "./components/Bookings";
import Menu from "./components/Menu";
import Tables from "./components/Tables";
import Users from "./components/Users";
import CategoriesManagement from "./components/CategoriesManagement";
import TableFoodManagement from "./components/TableFoodManagement";
import BillManagement from "./components/BillManagement";
import Login from "./components/Login";
import Intro from "./components/Intro"; // Import the new Intro component

interface User {
  id: number;
  fullname: string;
  role: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} /> {/* Add the Intro route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {user ? (
          <Route
            path="/*"
            element={
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/tables" element={<Tables />} />
                  <Route
                    path="/users"
                    element={
                      user.role === 1 ? <Users /> : <Navigate to="/dashboard" />
                    }
                  />
                  <Route
                    path="/categories"
                    element={<CategoriesManagement />}
                  />
                  <Route path="/table-food" element={<TableFoodManagement />} />
                  <Route path="/bills" element={<BillManagement />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
