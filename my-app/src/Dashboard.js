import React, { useState, useEffect } from 'react';
import axios from "axios";

function Dashboard({ token }) {
  const [jobs, setJobs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState("");

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

  // ================= MAIN DASHBOARD VIEW =================
  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p className="page-kicker">AI Resume Builder · Dashboard</p>
          <h1 className="page-header">Recommended Opportunities</h1>
          <p className="page-description" style={{ marginBottom: 0 }}>
            Curated opportunities based on your AI-analyzed resume profile.
          </p>
        </div>

        {/* ⭐ Last Updated Timer */}
        {lastUpdated && (
          <div style={{
            padding: "8px 16px",
            background: "rgba(79, 70, 229, 0.1)",
            border: "1px solid rgba(79, 70, 229, 0.2)",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--layout-primary)",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ fontSize: '16px' }}>⏱️</span> Updated {timeAgo}
          </div>
        )}
      </div>

      {loadingJobs ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--layout-text-muted)' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(79, 70, 229, 0.2)',
            borderTopColor: 'var(--layout-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ margin: 0, fontWeight: 500 }}>Scanning for the best matches...</p>
        </div>
      ) : (
        <>
          {/* Recommended Roles Section */}
          {roles.length > 0 && (
            <div className="premium-card" style={{ marginBottom: "32px", padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span> Recommended Roles
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {roles.map((r, i) => (
                  <span key={i} style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(236, 72, 153, 0.1))",
                    border: "1px solid rgba(79, 70, 229, 0.2)",
                    color: "var(--layout-text-main)",
                    borderRadius: "20px",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {jobs.length === 0 ? (
              <div className="premium-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '18px', color: 'var(--layout-text-muted)', margin: 0 }}>No jobs found for your profile yet.</p>
                <p style={{ fontSize: '14px', color: 'var(--layout-text-muted)', marginTop: '8px' }}>Try updating your location or skills in your profile.</p>
              </div>
            ) : (
              jobs.map((job, i) => (
                <div key={i} className="premium-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '24px'
                }}>
                  {/* Decorative accent top border */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(to right, var(--layout-primary), var(--layout-secondary))'
                  }} />

                  <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'var(--layout-text-main)', lineHeight: 1.4 }}>
                    {job.title}
                  </h4>

                  <div style={{ color: 'var(--layout-text-muted)', fontSize: '14px', marginBottom: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🏢</span>
                      <span style={{ fontWeight: 500, color: 'var(--layout-text-main)' }}>{job.organization}</span>
                    </div>

                    {job.locations_derived?.[0]?.city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>📍</span>
                        <span>{job.locations_derived[0].city}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="premium-btn"
                    style={{ textDecoration: 'none', width: '100%', boxSizing: 'border-box' ,color:'black'}}
                  >
                    Apply Now <span>↗</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;