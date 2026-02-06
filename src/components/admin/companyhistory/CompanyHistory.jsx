import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";


const CompanyHistory = () => {
  const { id } = useParams(); // companyId
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [id]);

  const loadHistory = async () => {
    try {
      const res = await api.get(`/company/${id}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="admin-page">
      <CommonHeader showProfileButton={false} />
      <div className="admin-card">
        <div className="page-header">
          <h2>Company Change History</h2>
          <button 
            className="btn-back-dashboard" 
            onClick={handleBackToDashboard}
            title="Back to Admin Dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
        {history.length === 0 ? (
          <p>No changes recorded</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Changed By</th>
                <th>Approved By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.fieldName}</td>
                  <td>{h.oldValue}</td>
                  <td>{h.newValue}</td>
                  <td>{h.requestedBy}</td>
                  <td>{h.approvedBy}</td>
                  <td>{new Date(h.changedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompanyHistory;