import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";


const AdminJobSeekerHistory = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/jobseekers/history");
    setHistory(res.data);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="admin-page">
      <CommonHeader showProfileButton={false} />
      <div className="admin-card">
        <div className="page-header">
          <h2>JobSeeker Change Audit Log</h2>
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
              <th>Changed By</th>
              <th>Field</th>
              <th>Old</th>
              <th>New</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.changedBy}</td>
                <td>{h.fieldName}</td>
                <td>{h.oldValue}</td>
                <td>{h.newValue}</td>
                <td>{new Date(h.changedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && <p>No history found</p>}
      </div>
    </div>
  );
};

export default AdminJobSeekerHistory;
