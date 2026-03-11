import React, { useState } from "react";
import axios from "axios";

function AnalyzerPage({ token }) {

  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMatch = async () => {

    if (!jobDescription.trim()) {
      alert("Please paste a job description first.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/analyze-job-match",
        {
          job_description: jobDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", animation: "fadeIn 0.4s ease-out" }}>

      <h1 className="page-header">Resume Job Analyzer</h1>
      <p className="page-description">
        Paste a job description below to see how well your AI-generated resume profile matches the role.
      </p>

      <div className="premium-card" style={{ marginBottom: '32px' }}>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="premium-input"
          style={{ minHeight: '200px', marginBottom: '20px' }}
        />

     <button
  onClick={analyzeMatch}
  className="premium-btn"
  disabled={loading || !jobDescription.trim()}
  style={{
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    color: "black",          // 👈 IMPORTANT
    fontWeight: "600"
  }}
>
  {loading ? (
    <>
      <span className="spinner">↻</span>
      <span>Analyzing Profile Match...</span>
    </>
  ) : (
    <>
      <span>✨</span>
      <span>Run AI Analysis</span>
    </>
  )}
</button>
        <style>{`@keyframes spin-slow { 100% { transform: rotate(360deg); } } .spinner { display: inline-block; animation: spin-slow 1.5s linear infinite; }`}</style>
      </div>

      {result && (
        <div style={{ animation: "fadeIn 0.6s ease-out" }}>

          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--layout-text-main)' }}>Analysis Results</h2>

          {/* Scores Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>

            <div className="premium-card" style={{ textAlign: 'center', borderTop: '4px solid var(--layout-primary)', padding: '24px 16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--layout-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Final Match
              </div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--layout-primary)', lineHeight: 1 }}>
                {result?.scores?.["final_match_%"]}<span style={{ fontSize: '24px', opacity: 0.5 }}>%</span>
              </div>
            </div>

            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', gap: '16px' }}>
              <ScoreRow label="Skill Match" value={result?.scores?.["skill_score_%"]} />
              <ScoreRow label="LLM Analysis" value={result?.scores?.["llm_score_%"] ?? "N/A"} />
              <ScoreRow label="Project Match" value={result?.scores?.["project_score_%"]} />
              <ScoreRow label="Semantic Match" value={result?.scores?.["embedding_score_%"]} />
            </div>

          </div>

          {/* AI Detailed Feedback */}
          <div className="premium-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--layout-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧠</span> AI Feedback
            </h3>
            <div style={{
              whiteSpace: "pre-line",
              lineHeight: 1.8,
              color: '#334155',
              fontSize: '15px'
            }}>
              {result.analysis}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Helper component for small score rows
function ScoreRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: 'var(--layout-text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--layout-text-main)' }}>
        {value === "N/A" ? value : `${value}%`}
      </span>
    </div>
  );
}

export default AnalyzerPage;