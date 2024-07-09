import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  totalBookings: number;
  totalTables: number;
  totalUsers: number;
  bookingsByDay: { name: string; value: number }[];
  usersByRole: { name: string; value: number }[];
  popularDishes: { name: string; value: number }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from API
        const bookingsResponse = await axios.get(
          "https://localhost:7048/api/Booking/getall"
        );
        const tablesResponse = await axios.post(
          "https://localhost:7048/api/Tables/getall"
        );
        const usersResponse = await axios.post(
          "https://localhost:7048/api/Users/getall?user_id=1"
        );

        // Process data for charts
        const bookingsByDay = processBookingsByDay(
          bookingsResponse.data.$values
        );
        const usersByRole = processUsersByRole(usersResponse.data.$values);
        const popularDishes = generateMockPopularDishes(); // Replace with actual data when available

        setData({
          totalBookings: bookingsResponse.data.$values.length,
          totalTables: tablesResponse.data.$values.length,
          totalUsers: usersResponse.data.$values.length,
          bookingsByDay,
          usersByRole,
          popularDishes,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Unable to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const processBookingsByDay = (
    bookings: any[]
  ): { name: string; value: number }[] => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const bookingCounts = days.map((day) => ({ name: day, value: 0 }));

    bookings.forEach((booking) => {
      const dayIndex = new Date(booking.eatingTime).getDay();
      bookingCounts[dayIndex].value += 1;
    });

    return bookingCounts;
  };

  const processUsersByRole = (
    users: any[]
  ): { name: string; value: number }[] => {
    const roleCounts = [
      { name: "Staff", value: 0 },
      { name: "Manager", value: 0 },
      { name: "Customer", value: 0 },
    ];

    users.forEach((user) => {
      if (user.role === 0) roleCounts[0].value += 1;
      else if (user.role === 1) roleCounts[1].value += 1;
      else roleCounts[2].value += 1;
    });

    return roleCounts;
  };

  const generateMockPopularDishes = (): { name: string; value: number }[] => {
    return [
      { name: "Pizza", value: 30 },
      { name: "Burger", value: 25 },
      { name: "Pasta", value: 20 },
      { name: "Salad", value: 15 },
      { name: "Steak", value: 10 },
    ];
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading dashboard...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Bookings"
          value={data.totalBookings}
          description="Number of reservations made"
        />
        <DashboardCard
          title="Available Tables"
          value={data.totalTables}
          description="Current number of tables"
        />
        <DashboardCard
          title="Registered Users"
          value={data.totalUsers}
          description="Total number of users in the system"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard
          title="Bookings by Day of Week"
          description="Shows which days are busiest"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.bookingsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Number of Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="User Types"
          description="Breakdown of user roles in the system"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.usersByRole}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.usersByRole.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Popular Dishes"
          description="Top 5 most ordered items"
          className="md:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.popularDishes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Number of Orders" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );
};

export default Dashboard;
