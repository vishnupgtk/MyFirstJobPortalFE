import { useState } from "react";

const CompanyProfileEdit = ({ profile, onCancel, onSave }) => {
  const [form, setForm] = useState(profile);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="em-modal-overlay" onClick={onCancel}>
      <div className="em-modal" onClick={(e) => e.stopPropagation()}>
        <div className="em-modal-header">
          <h2>Edit Company Profile</h2>
          <button
            className="em-modal-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="em-modal-body">
          <input
            name="companyName"
            value={form.companyName || ""}
            onChange={handleChange}
            placeholder="Company Name"
          />
          <input
            name="industry"
            value={form.industry || ""}
            onChange={handleChange}
            placeholder="Industry"
          />
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="What We Do"
          />
          <input
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="locations"
            value={form.locations || ""}
            onChange={handleChange}
            placeholder="Locations"
          />
        </div>

        <div className="em-modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-save" onClick={() => onSave(form)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileEdit;
