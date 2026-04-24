import { useEffect, useState } from "react";
import API from "../api/axios";
import MainLayout from "../layout/MainLayout";

export default function Dashboard() {
  const [data, setData] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      let url = "/dashboard/employee";

      if (user.role === "manager") url = "/dashboard/manager";
      if (user.role === "admin") url = "/dashboard/admin";

      const res = await API.get(url);
      setData(res.data.summary);
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="grid grid-cols-4 gap-4">
        
        <Card title="Total Hours" value={data.totalHours} />
        <Card title="Days" value={data.totalDays} />
        <Card title="Overtime" value={data.overtimeCount} />
        <Card title="Leaves" value={data.totalLeaves} />

      </div>
    </MainLayout>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value || 0}</p>
    </div>
  );
}