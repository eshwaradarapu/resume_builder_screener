import React, { useState, useEffect } from "react";
import axios from 'axios';

function ResumeForm({ token, onResumeCreated, initialData, mode, onBack }) {

  const getInitialFormState = () => ({
    name: "", email: "", phone: "", summary: "", linkedin: "", github: "", interests: "",
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
            .join("\n")   // ⭐ line by line
        };
      }
      return exp;
    }) || [{ title:"", company:"", startYear:"", endYear:"", description:"" }],

    projects: data.projects?.map(proj => {
      if (proj.structured?.project_summary?.length) {
        return {
          ...proj,
          description: proj.structured.project_summary
            .map(b => Array.isArray(b) ? b.join(" ") : b)
            .join("\n")   // ⭐ line by line
        };
      }
      return proj;
    }) || [{ title:"", description:"" }]
  };
};

const [form, setForm] = useState(prepareInitialData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const linesToBullets = (text) => {
  if (!text) return [];

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => [line]);
};
const handleSubmit = async (useAI = true) => {
  setIsSubmitting(true);
  setError('');

  try {

    let payload = { ...form };

    // ⭐ ONLY convert when saving draft (useAI = false)
    if (!useAI) {

      payload.projects = payload.projects.map(proj => ({
        ...proj,
        structured: {
          ...proj.structured,
          project_summary: linesToBullets(proj.description)
        }
      }));

      payload.experience = payload.experience.map(exp => ({
        ...exp,
        structured: {
          ...exp.structured,
          experience_summary: linesToBullets(exp.description)
        }
      }));
    }

    const response = await axios.post(
      'http://localhost:5000/api/resume',
      { ...payload, use_ai: useAI },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    onResumeCreated(response.data.data);

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

  const handleExperienceChange = (index, e) => {
    const newExp = [...form.experience];
    newExp[index][e.target.name] = e.target.value;
    setForm({ ...form, experience: newExp });
  };

  const addExperience = () =>
    setForm({
      ...form,
      experience: [
        ...form.experience,
        { title: "", company: "", startYear: "", endYear: "", description: "" }
      ]
    });

  const removeExperience = (index) =>
    setForm({ ...form, experience: form.experience.filter((_, i) => i !== index) });

  const handleProjectChange = (index, e) => {
    const newProjects = [...form.projects];
    newProjects[index][e.target.name] = e.target.value;
    setForm({ ...form, projects: newProjects });
  };

  const addProject = () =>
    setForm({ ...form, projects: [...form.projects, { title: "", description: "" }] });

  const removeProject = (index) =>
    setForm({ ...form, projects: form.projects.filter((_, i) => i !== index) });

  const handleCertificationChange = (index, e) => {
    const newCerts = [...form.certifications];
    newCerts[index][e.target.name] = e.target.value;
    setForm({ ...form, certifications: newCerts });
  };

  const addCertification = () =>
    setForm({ ...form, certifications: [...form.certifications, { name: "", link: "" }] });

  const removeCertification = (index) =>
    setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== index) });

  const handleClearForm = () => { setForm(getInitialFormState()); };

  return (
    <>
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Basic Info</h3>
      <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required /><br />
      <input placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required /><br />
      <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} required /><br />
      <input placeholder="LinkedIn URL" name="linkedin" type="url" value={form.linkedin} onChange={handleChange} /><br />
      <input placeholder="GitHub URL" name="github" type="url" value={form.github} onChange={handleChange} /><br />

      <h3>Profile / Bio</h3>
      <textarea name="summary" value={form.summary} onChange={handleChange} rows="4" /><br />
      
      <h3>Education</h3>
      {["school", "intermediate", "graduation"].map((level) => (
        <div key={level}>
          <h4>{level.charAt(0).toUpperCase() + level.slice(1)}</h4>
          <input placeholder="Institute Name" value={form.education[level]?.name || ""} onChange={(e) => handleEducationChange(level, "name", e.target.value)} required /><br />
          <input placeholder="Year of Completion" value={form.education[level]?.year || ""} onChange={(e) => handleEducationChange(level, "year", e.target.value)} required /><br />
          <input placeholder="Grade / Percentage" value={form.education[level]?.grade || ""} onChange={(e) => handleEducationChange(level, "grade", e.target.value)} required /><br />
        </div>
      ))}

      <h3>Skills</h3>
      <input name="skills" value={form.skills} onChange={handleChange} required /><br />
      
      <h3>Interests</h3>
      <input name="interests" value={form.interests} onChange={handleChange} /><br />

      <h3>Experience</h3>
      {form.experience.map((exp, i) => (
        <div key={i}>
          <input name="title" value={exp.title} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <input name="company" value={exp.company} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <input name="startYear" value={exp.startYear} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <input name="endYear" value={exp.endYear} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(i, e)} /><br />
          {form.experience.length > 1 && <button type="button" onClick={() => removeExperience(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addExperience}>+ Add Experience</button><br />

      <h3>Projects</h3>
      {form.projects.map((proj, i) => (
        <div key={i}>
          <input name="title" value={proj.title} onChange={(e) => handleProjectChange(i, e)} required /><br />
          <textarea name="description" value={proj.description} onChange={(e) => handleProjectChange(i, e)} required /><br />
          {form.projects.length > 1 && <button type="button" onClick={() => removeProject(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addProject}>+ Add Project</button><br /><br />

      <h3>Certifications</h3>
      {form.certifications.map((cert, i) => (
        <div key={i}>
          <input name="name" value={cert.name} onChange={(e) => handleCertificationChange(i, e)} /><br />
          <input name="link" type="url" value={cert.link} onChange={(e) => handleCertificationChange(i, e)} /><br />
          {form.certifications.length > 1 && <button type="button" onClick={() => removeCertification(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addCertification}>+ Add Certification</button><br /><br />

      {/* ✅ UPDATED BUTTONS */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {error && <p style={{color: 'red'}}>{error}</p>}

        <button type="button" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
          Save Draft
        </button>

        <button type="button" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Enhancing with AI...' : 'Enhance with AI'}
        </button>

        <button type="button" onClick={handleClearForm} style={{ background: '#6c757d', color: 'white' }}>
          Clear Form
        </button>
      </div>
    </form>

    {mode === "edit" && (
      <div style={{ marginBottom: "15px" }}>
        <button type="button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>
    )}
    </>
  );
}

export default ResumeForm;