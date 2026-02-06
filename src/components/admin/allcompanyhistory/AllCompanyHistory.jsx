import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";

export default function AllCompanyHistory() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await api.get("/company/history/all");
        if (isMounted) {
          setData(res.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch company history:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const filtered = data.filter(
    (x) =>
      x.companyName.toLowerCase().includes(search.toLowerCase()) ||
      x.fieldName.toLowerCase().includes(search.toLowerCase()) ||
      x.changedBy.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-page">
      <CommonHeader showProfileButton={false} />
      <div className="admin-card">
        <div className="page-header">
          <h2>Employer Change Audit Log</h2>
          <button
            className="btn-back-dashboard"
            onClick={handleBackToDashboard}
            title="Back to Admin Dashboard"
          >
            Back
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
              <th>Requested By</th>
              <th>Approved By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <tr key={i}>
                <td>{h.companyName}</td>
                <td>{h.fieldName}</td>
                <td className="old-value">{h.oldValue || "-"}</td>
                <td className="new-value">{h.newValue || "-"}</td>
                <td>{h.requestedBy}</td>
                <td>{h.approvedBy}</td>
                <td>{new Date(h.changedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: "20px", textAlign: "center" }}>
            No matching history found
          </p>
        )}
      </div>
    </div>
  );
}
