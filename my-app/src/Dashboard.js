import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ResumePreview from './ResumePreview';

function Dashboard({ resumeData, onEdit, token }) {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState("");

  const componentRef = useRef();

  //effect for top scroll when we open the template previw 
  useEffect(() => {
    if (selectedTemplate) {
      window.scrollTo(0, 0);  // 🔥 instant scroll
    }
  }, [selectedTemplate]);
  // ================= FETCH JOBS =================
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/jobs",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setJobs(res.data.jobs || []);
        setRoles(res.data.roles || []);
        setLastUpdated(res.data.last_updated);

      } catch (err) {
        console.error("Job fetch failed:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [token]);

  // ================= TIME AGO HELPER =================
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / (60000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute(s) ago`;
    return `${hours} hour(s) ago`;
  };

  // ================= LIVE TIMER =================
  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimer = () => {
      setTimeAgo(getTimeAgo(lastUpdated));
    };

    updateTimer(); // initial call

    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // ================= PDF DOWNLOAD =================
  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;

    const html = componentRef.current.outerHTML;

    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map(el => el.outerHTML)
      .join("\n");

    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          ${styles}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    try {
      const res = await fetch("http://localhost:5000/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: fullHTML })
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  // ================= TEMPLATE RENDER =================
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 'Custom':
        return <ResumePreview ref={componentRef} data={resumeData} />;
      default:
        return <div>Please select a template.</div>;
    }
  };

  // ================= TEMPLATE VIEW MODE =================
  if (selectedTemplate) {
    return (
      <div>
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => setSelectedTemplate(null)}>← Back to Templates</button>
          <button onClick={handleDownloadPDF}>📄 Download as PDF</button>
        </div>
        {renderSelectedTemplate()}
      </div>
    );
  }

  // ================= MAIN DASHBOARD VIEW =================
 return (
  <div>

    {/* ===== ANALYZER BUTTON ===== */}
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => navigate("/analyzer")}
        style={{
          padding: "10px 16px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        🔎 Resume Job Analyzer
      </button>
    </div>

      {/* ===== JOB SECTION ===== */}
      <h2>Jobs For You</h2>

      {/* ⭐ Last Updated Timer */}
   {lastUpdated && (
  <div style={{
    marginBottom: "15px",
    padding: "10px 15px",
    background: "#f0f8ff",
    borderLeft: "4px solid #007bff",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    fontWeight: "bold",
    display: "inline-block"
  }}>
    ⏳ Last updated: <span style={{ color: "#007bff" }}>{timeAgo}</span>
  </div>
)}

      {loadingJobs ? (
        <p>Loading jobs...</p>
      ) : (
        <>
          {/* Recommended Roles */}
          {roles.length > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <strong>Recommended Roles:</strong><br/>
              {roles.map((r, i) => (
                <span key={i} style={{
                  padding: "6px 12px",
                  margin: "5px",
                  background: "#e6f2ff",
                  borderRadius: "20px",
                  display: "inline-block"
                }}>
                  {r}
                </span>
              ))}
            </div>
          )}

          {/* Job Cards */}
          {jobs.length === 0 ? (
            <p>No jobs available yet.</p>
          ) : (
            jobs.map((job, i) => (
              <div key={i} style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "6px"
              }}>
                <strong>{job.title}</strong><br/>
                {job.organization}<br/>
                {job.locations_derived?.[0]?.city || ""}<br/>

                <a href={job.url} target="_blank" rel="noreferrer">
                  Apply
                </a>
              </div>
            ))
          )}
        </>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* ===== TEMPLATE SECTION ===== */}
      <h2>Choose a Template</h2>
      <p>Select a template to view your resume.</p>

      <button onClick={onEdit}>✏️ Edit Resume Data</button>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div
          onClick={() => setSelectedTemplate('Custom')}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            width: '200px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <h3 style={{ marginTop: '10px' }}>Modern Template</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;