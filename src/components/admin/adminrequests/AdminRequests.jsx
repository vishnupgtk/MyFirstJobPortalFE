import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import Toast from "../../shared/Toast/Toast";
import "../admindashboard/AdminDashboard.css";

export default function AdminRequests() {
  const [list, setList] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/company/pending").then((res) => setList(res.data));
  }, []);

  const approve = async (id) => {
    try {
      await api.post("/company/approve", { requestId: id });
      setList((prev) => prev.filter((x) => x.requestId !== id));
      setToast({ show: true, message: "Request approved", type: "success" });
    } catch (error) {
      setToast({ show: true, message: "Failed to approve request", type: "error" });
    }
  };

  const reject = async (id) => {
    try {
      await api.post("/company/reject", { requestId: id });
      setList((prev) => prev.filter((x) => x.requestId !== id));
      setToast({ show: true, message: "Request rejected", type: "success" });
    } catch (error) {
      setToast({ show: true, message: "Failed to reject request", type: "error" });
    }
  };

  return (
    <div className="admin-page">
      <CommonHeader showProfileButton={false} />

      <div className="admin-card">
        <div className="page-header">
          <h2>Pending Employer Change Requests</h2>
          <button
            className="btn-back-dashboard"
            onClick={() => navigate("/admin/dashboard")}
            title="Back to Admin Dashboard"
          >
            Back
          </button>
        </div>

        {list.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Field</th>
                <th>Old</th>
                <th>New</th>
                <th>Requested By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.requestId}>
                  <td
                    style={{
                      cursor: "pointer",
                      color: "#4f46e5",
                      textDecoration: "underline",
                    }}
                    onClick={() =>
                      r.companyId && navigate(`/company/${r.companyId}/history`)
                    }
                  >
                    {r.companyName}
                  </td>
                  <td>{r.fieldName}</td>
                  <td>{r.oldValue}</td>
                  <td>{r.newValue}</td>
                  <td>{r.requestedBy}</td>
                  <td>
                    <div className="action-group">
                      <button
                        className="btn-approve"
                        onClick={() => approve(r.requestId)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => reject(r.requestId)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}
