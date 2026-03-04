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
    <div style={{ maxWidth: "900px", margin: "auto" }}>

      <h2>Resume Job Match Analyzer</h2>

      <p>Paste any job description to see how well your resume matches.</p>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        rows="10"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <br /><br />

      <button
        onClick={analyzeMatch}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Analyze Match
      </button>

      {loading && (
        <p style={{ marginTop: "15px" }}>
          Analyzing resume match...
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#f9f9f9"
          }}
        >

          <h3>Match Scores</h3>

      <p><strong>Final Match:</strong> {result?.["final_match_%"]}%</p>
<p><strong>Skill Score:</strong> {result?.["skill_score_%"]}%</p>
<p><strong>Project Score:</strong> {result?.["project_score_%"]}%</p>
<p><strong>Embedding Score:</strong> {result?.["embedding_score_%"]}%</p>

          <hr />

          <h3>AI Analysis</h3>

          <div style={{ whiteSpace: "pre-line" }}>
            {result.analysis}
          </div>

        </div>
      )}

    </div>
  );
}

export default AnalyzerPage;