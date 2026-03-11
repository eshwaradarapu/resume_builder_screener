import React, { useState } from "react";
import axios from 'axios';

function ResumeForm({ token, onResumeCreated, initialData, mode, onBack }) {

  const getInitialFormState = () => ({
    name: "", email: "", phone: "", summary: "", linkedin: "", github: "", interests: "", location: "",
    education: {
      school: { name: "", year: "", grade: "" },
      intermediate: { name: "", year: "", grade: "" },
      graduation: { name: "", year: "", grade: "" },
    },
    skills: "",
    experience: [{ title: "", company: "", startYear: "", endYear: "", description: "" }],
    certifications: [{ name: "", link: "" }],
    projects: [{ title: "", description: "" }],
  });

  const prepareInitialData = (data) => {
    if (!data) return getInitialFormState();
    return {
      ...data,
      experience: data.experience?.map(exp => {
        if (exp.structured?.experience_summary?.length) {
          return {
            ...exp,
            description: exp.structured.experience_summary
              .map(b => Array.isArray(b) ? b.join(" ") : b)
              .join("\n")
          };
        }
        return exp;
      }) || [{ title: "", company: "", startYear: "", endYear: "", description: "" }],
      projects: data.projects?.map(proj => {
        if (proj.structured?.project_summary?.length) {
          return {
            ...proj,
            description: proj.structured.project_summary
              .map(b => Array.isArray(b) ? b.join(" ") : b)
              .join("\n")
          };
        }
        return proj;
      }) || [{ title: "", description: "" }]
    };
  };

  const [form, setForm] = useState(prepareInitialData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const linesToBullets = (text) => {
    if (!text) return [];
    return text.split("\n").map(line => line.trim()).filter(line => line.length > 0).map(line => [line]);
  };

  const handleSubmit = async (useAI = true) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let payload = { ...form };

      if (!useAI) {
        payload.projects = payload.projects.map(proj => ({
          ...proj,
          structured: { ...proj.structured, project_summary: linesToBullets(proj.description) }
        }));
        payload.experience = payload.experience.map(exp => ({
          ...exp,
          structured: { ...exp.structured, experience_summary: linesToBullets(exp.description) }
        }));
      }

      const response = await axios.post(
        'http://localhost:5000/api/resume',
        { ...payload, use_ai: useAI },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );

      onResumeCreated(response.data.data);
      if (useAI) {
  setSuccess("✨ AI enhancement completed successfully!");
} else {
  setSuccess("💾 Resume draft saved successfully!");
}

setTimeout(() => {
  setSuccess("");
}, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save your resume.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEducationChange = (level, field, value) => {
    setForm({ ...form, education: { ...form.education, [level]: { ...form.education[level], [field]: value } } });
  };

  // List Handlers
  const handleExperienceChange = (index, e) => {
    const newExp = [...form.experience];
    newExp[index][e.target.name] = e.target.value;
    setForm({ ...form, experience: newExp });
  };
  const addExperience = () => setForm({ ...form, experience: [...form.experience, { title: "", company: "", startYear: "", endYear: "", description: "" }] });
  const removeExperience = (index) => setForm({ ...form, experience: form.experience.filter((_, i) => i !== index) });

  const handleProjectChange = (index, e) => {
    const newProjects = [...form.projects];
    newProjects[index][e.target.name] = e.target.value;
    setForm({ ...form, projects: newProjects });
  };
  const addProject = () => setForm({ ...form, projects: [...form.projects, { title: "", description: "" }] });
  const removeProject = (index) => setForm({ ...form, projects: form.projects.filter((_, i) => i !== index) });

  const handleCertificationChange = (index, e) => {
    const newCerts = [...form.certifications];
    newCerts[index][e.target.name] = e.target.value;
    setForm({ ...form, certifications: newCerts });
  };
  const addCertification = () => setForm({ ...form, certifications: [...form.certifications, { name: "", link: "" }] });
  const removeCertification = (index) => setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== index) });

  const handleClearForm = () => { setForm(getInitialFormState()); };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-header">{mode === "edit" ? "Edit Profile" : "Create Profile"}</h1>
          <p className="page-description" style={{ marginBottom: 0 }}>
            Fill in your details below to build your AI-optimized resume and find perfect job matches.
          </p>
        </div>
       
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{ maxWidth: '900px' }}>

        {/* Basic Info */}
        <div className="form-section">
          <h3>👤 Basic Information</h3>
          <div className="form-group-grid">
            <input placeholder="Full Name" name="name" value={form.name} onChange={handleChange} className="premium-input" required />
            <input placeholder="Email Address" name="email" type="email" value={form.email} onChange={handleChange} className="premium-input" required />
            <input placeholder="Phone Number" name="phone" value={form.phone} onChange={handleChange} className="premium-input" required />
            <input placeholder="Preferred Location (e.g. Remote, City)" name="location" value={form.location} onChange={handleChange} className="premium-input" required />
            <input placeholder="LinkedIn Profile URL" name="linkedin" type="url" value={form.linkedin} onChange={handleChange} className="premium-input" />
            <input placeholder="GitHub Profile URL" name="github" type="url" value={form.github} onChange={handleChange} className="premium-input" />
          </div>
        </div>

        {/* Professional Summary */}
        <div className="form-section">
          <h3>📝 Professional Summary</h3>
          <textarea
            placeholder="Write a brief summary of your professional background, goals, and key strengths..."
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows="4"
            className="premium-input"
          />
        </div>

        {/* Global Competencies */}
        <div className="form-section">
          <h3>🎯 Core Competencies</h3>
          <div className="form-group-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--layout-text-muted)' }}>Professional Skills (Comma separated)</label>
              <input placeholder="e.g. React, Python, Product Management" name="skills" value={form.skills} onChange={handleChange} className="premium-input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--layout-text-muted)' }}>Interests / Hobbies (Comma separated)</label>
              <input placeholder="e.g. Open Source, Reading, Photography" name="interests" value={form.interests} onChange={handleChange} className="premium-input" />
            </div>
          </div>
        </div>

        {/* Education Timeline */}
        <div className="form-section">
          <h3>🎓 Education Timeline</h3>
          {["graduation", "intermediate", "school"].map((level) => (
            <div key={level} style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.7)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--layout-primary)', textTransform: 'capitalize' }}>{level}</h4>
              <div className="form-group-grid" style={{ marginBottom: 0 }}>
                <input placeholder="Institution Name" value={form.education[level]?.name || ""} onChange={(e) => handleEducationChange(level, "name", e.target.value)} className="premium-input" required />
                <input placeholder="Year Completed" value={form.education[level]?.year || ""} onChange={(e) => handleEducationChange(level, "year", e.target.value)} className="premium-input" required />
                <input placeholder="Grade / GPA" value={form.education[level]?.grade || ""} onChange={(e) => handleEducationChange(level, "grade", e.target.value)} className="premium-input" required />
              </div>
            </div>
          ))}
        </div>

        {/* Experience Tracker */}
        <div className="form-section">
          <h3>💼 Work Experience</h3>
          {form.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', position: 'relative' }}>

              {form.experience.length > 1 && (
                <button type="button" onClick={() => removeExperience(i)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>
                  ×
                </button>
              )}

              <div className="form-group-grid">
                <input placeholder="Job Title" name="title" value={exp.title} onChange={(e) => handleExperienceChange(i, e)} className="premium-input" required />
                <input placeholder="Company Name" name="company" value={exp.company} onChange={(e) => handleExperienceChange(i, e)} className="premium-input" required />
                <input placeholder="Start Year" name="startYear" value={exp.startYear} onChange={(e) => handleExperienceChange(i, e)} className="premium-input" required />
                <input placeholder="End Year (or Present)" name="endYear" value={exp.endYear} onChange={(e) => handleExperienceChange(i, e)} className="premium-input" />
              </div>
              <textarea
                placeholder="Describe your responsibilities, impact, and achievements..."
                name="description"
                value={exp.description}
                onChange={(e) => handleExperienceChange(i, e)}
                className="premium-input"
              />
            </div>
          ))}
          <button type="button" onClick={addExperience} className="premium-btn secondary" style={{ width: '100%' }}>
            + Add Another Position
          </button>
        </div>

        {/* Project Portfolio */}
        <div className="form-section">
          <h3>🚀 Project Portfolio</h3>
          {form.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '16px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', position: 'relative' }}>

              {form.projects.length > 1 && (
                <button type="button" onClick={() => removeProject(i)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>
                  ×
                </button>
              )}

              <input placeholder="Project Title" name="title" value={proj.title} onChange={(e) => handleProjectChange(i, e)} className="premium-input" style={{ marginBottom: '16px' }} required />
              <textarea
                placeholder="Describe the project, tools used, and what you accomplished..."
                name="description"
                value={proj.description}
                onChange={(e) => handleProjectChange(i, e)}
                className="premium-input"
                required
              />
            </div>
          ))}
          <button type="button" onClick={addProject} className="premium-btn secondary" style={{ width: '100%' }}>
            + Add Another Project
          </button>
        </div>

        {/* Certifications Vault */}
        <div className="form-section">
          <h3>🏅 Certifications</h3>
          {form.certifications.map((cert, i) => (
            <div key={i} style={{ marginBottom: '16px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', position: 'relative' }}>

              {form.certifications.length > 1 && (
                <button type="button" onClick={() => removeCertification(i)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }}>
                  ×
                </button>
              )}

              <div className="form-group-grid" style={{ marginBottom: 0 }}>
                <input placeholder="Certification Name" name="name" value={cert.name} onChange={(e) => handleCertificationChange(i, e)} className="premium-input" />
                <input placeholder="Credential Link / URL" name="link" type="url" value={cert.link} onChange={(e) => handleCertificationChange(i, e)} className="premium-input" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addCertification} className="premium-btn secondary" style={{ width: '100%' }}>
            + Add Certificate
          </button>
        </div>
{/* Fixed Action Bottom Bar */}
<div
  style={{
    position: "sticky",
    bottom: "20px",
    width: "100%",
    background: "#ffffff",
    padding: "16px 20px",
    borderRadius: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    marginTop: "40px",
    zIndex: 100
  }}
>

  {error && (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
        textAlign: "center",
        marginBottom: "12px"
      }}
    >
      {error}
    </div>
  )}
  {success && (
  <div
    style={{
      background: "#dcfce7",
      color: "#166534",
      padding: "10px",
      borderRadius: "8px",
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "12px",
      fontWeight: "500"
    }}
  >
    {success}
  </div>
)}

  <div
    style={{
      display: "flex",
      gap: "16px",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >

    <button
      type="button"
      onClick={handleClearForm}
      className="premium-btn danger"
      style={{
        flex: 1,
        height: "46px",
        borderRadius: "10px"
      }}
    >
      Clear Form
    </button>

    <button
      type="button"
      onClick={() => handleSubmit(false)}
      disabled={isSubmitting}
      className="premium-btn secondary"
      style={{
        flex: 1,
        height: "46px",
        borderRadius: "10px"
      }}
    >
      💾 Save Draft
    </button>

    <button
      type="button"
      onClick={() => handleSubmit(true)}
      disabled={isSubmitting}
      className="premium-btn"
      style={{
        flex: 1,
        height: "46px",
        borderRadius: "10px",
        background: "linear-gradient(135deg,#6366f1,#4f46e5)",
        color: "white"
      }}
    >
      {isSubmitting ? (
        <>
          <span
            style={{
              display: "inline-block",
              animation: "spin 1s linear infinite",
              marginRight: "6px"
            }}
          >
            ↻
          </span>
          Enhancing...
        </>
      ) : (
        <>✨ Enhance with AI</>
      )}
    </button>

  </div>

  <style>
    {`
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    `}
  </style>

</div>   {/* END FLOATING BAR */}

</form>

</div>
);
}

export default ResumeForm;