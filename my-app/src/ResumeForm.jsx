

// import React, { useState, useEffect } from "react";
// import { rephraseText } from './aiService.js';

// function ResumeForm({ onSubmit }) {
//   const initialFormState = () => {
//     // Define the default, complete structure of the form
//     const defaultState = {
//       name: "",
//       email: "",
//       phone: "",
//       summary: "",
//       linkedin: "",
//       github: "",
//       interests: "",
//       education: {
//         school: { name: "", year: "", grade: "" },
//         intermediate: { name: "", year: "", grade: "" },
//         graduation: { name: "", year: "", grade: "" },
//       },
//       skills: "",
//       experience: [{ title: "", company: "", description: "" }],
//       certifications: [{ name: "", link: "" }],
//       projects: [{ title: "", description: "" }],
//     };

//     const savedData = localStorage.getItem('resumeFormData');
    
//     if (savedData) {
//       // If saved data exists, merge it with the default state.
//       // This ensures that new fields (like 'certifications') are added if they were missing from the saved data.
//       return { ...defaultState, ...JSON.parse(savedData) };
//     }
    
//     // If no data is saved, return the clean default state.
//     return defaultState;
//   };

//   const [form, setForm] = useState(initialFormState);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     localStorage.setItem('resumeFormData', JSON.stringify(form));
//   }, [form]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleEducationChange = (level, field, value) => {
//     setForm({
//       ...form,
//       education: {
//         ...form.education,
//         [level]: { ...form.education[level], [field]: value },
//       },
//     });
//   };

//   const handleExperienceChange = (index, e) => {
//     const newExp = [...form.experience];
//     newExp[index][e.target.name] = e.target.value;
//     setForm({ ...form, experience: newExp });
//   };

//   const addExperience = () =>
//     setForm({
//       ...form,
//       experience: [...form.experience, { title: "", company: "", description: "" }],
//     });

//   const removeExperience = (index) =>
//     setForm({ ...form, experience: form.experience.filter((_, i) => i !== index) });

//   const handleProjectChange = (index, e) => {
//     const newProjects = [...form.projects];
//     newProjects[index][e.target.name] = e.target.value;
//     setForm({ ...form, projects: newProjects });
//   };

//   const addProject = () =>
//     setForm({
//       ...form,
//       projects: [...form.projects, { title: "", description: "" }],
//     });

//   const removeProject = (index) =>
//     setForm({ ...form, projects: form.projects.filter((_, i) => i !== index) });
    
//   const handleCertificationChange = (index, e) => {
//     const newCerts = [...form.certifications];
//     newCerts[index][e.target.name] = e.target.value;
//     setForm({ ...form, certifications: newCerts });
//   };

//   const addCertification = () =>
//     setForm({ ...form, certifications: [...form.certifications, { name: "", link: "" }] });

//   const removeCertification = (index) =>
//     setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== index) });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     const formDataCopy = JSON.parse(JSON.stringify(form));
//     try {
//       const experiencePromises = formDataCopy.experience.map(exp => rephraseText(exp.description, exp.title));
//       const projectPromises = formDataCopy.projects.map(proj => rephraseText(proj.description, proj.title));
//       const [rephrasedExperiences, rephrasedProjects] = await Promise.all([
//         Promise.all(experiencePromises),
//         Promise.all(projectPromises)
//       ]);
//       formDataCopy.experience.forEach((exp, i) => { exp.description = rephrasedExperiences[i]; });
//       formDataCopy.projects.forEach((proj, i) => { proj.description = rephrasedProjects[i]; });
//       onSubmit(formDataCopy);
//     } catch (error) {
//       console.error("Failed to rephrase content:", error);
//       onSubmit(form);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  
//   const handleClearForm = () => {
//     localStorage.removeItem('resumeFormData');
//     setForm(initialFormState()); 
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>Basic Info</h3>
//       <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required /><br />
//       <input placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required /><br />
//       <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} required /><br />
//       <input placeholder="LinkedIn URL" name="linkedin" type="url" value={form.linkedin} onChange={handleChange} /><br />
//       <input placeholder="GitHub URL" name="github" type="url" value={form.github} onChange={handleChange} /><br />

//       <h3>Profile / Bio</h3>
//       <textarea placeholder="Write a short, 2-3 sentence summary about yourself..." name="summary" value={form.summary} onChange={handleChange} rows="4" /><br />
      
//       <h3>Education</h3>
//       {["school", "intermediate", "graduation"].map((level) => (
//         <div key={level}>
//           <h4>{level.charAt(0).toUpperCase() + level.slice(1)}</h4>
//           <input placeholder="Institute Name" value={form.education[level]?.name || ""} onChange={(e) => handleEducationChange(level, "name", e.target.value)} required /><br />
//           <input placeholder="Year of Completion" value={form.education[level]?.year || ""} onChange={(e) => handleEducationChange(level, "year", e.target.value)} required /><br />
//           <input placeholder="Grade / Percentage" value={form.education[level]?.grade || ""} onChange={(e) => handleEducationChange(level, "grade", e.target.value)} required /><br />
//         </div>
//       ))}

//       <h3>Skills</h3>
//       <input placeholder="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} required /><br />
      
//       <h3>Interests</h3>
//       <input placeholder="Interests (comma separated)" name="interests" value={form.interests} onChange={handleChange} /><br />

//       <h3>Experience</h3>
//       {form.experience.map((exp, i) => (
//         <div key={i}>
//           <input placeholder="Title" name="title" value={exp.title} onChange={(e) => handleExperienceChange(i, e)} /><br />
//           <input placeholder="Company" name="company" value={exp.company} onChange={(e) => handleExperienceChange(i, e)} /><br />
//           <textarea placeholder="Description" name="description" value={exp.description} onChange={(e) => handleExperienceChange(i, e)} /><br />
//           {form.experience.length > 1 && <button type="button" onClick={() => removeExperience(i)}>Remove</button>}
//         </div>
//       ))}
//       <button type="button" onClick={addExperience}>+ Add Experience</button><br />

//       <h3>Projects</h3>
//       {form.projects.map((proj, i) => (
//         <div key={i}>
//           <input placeholder="Title" name="title" value={proj.title} onChange={(e) => handleProjectChange(i, e)} required /><br />
//       <textarea placeholder="Description" name="description" value={proj.description} onChange={(e) => handleProjectChange(i, e)} required /><br />
//           {form.projects.length > 1 && <button type="button" onClick={() => removeProject(i)}>Remove</button>}
//         </div>
//       ))}
//       <button type="button" onClick={addProject}>+ Add Project</button><br /><br />

//       <h3>Certifications</h3>
//       {form.certifications.map((cert, i) => (
//         <div key={i}>
//           <input placeholder="Certificate Name" name="name" value={cert.name} onChange={(e) => handleCertificationChange(i, e)} /><br />
//           <input placeholder="Certificate Link (Optional)" name="link" type="url" value={cert.link} onChange={(e) => handleCertificationChange(i, e)} /><br />
//           {form.certifications.length > 1 && <button type="button" onClick={() => removeCertification(i)}>Remove</button>}
//         </div>
//       ))}
//       <button type="button" onClick={addCertification}>+ Add Certification</button><br /><br />

//       <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
//         <button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? 'Polishing with AI...' : 'Generate Resume'}
//         </button>
//         <button type="button" onClick={handleClearForm} style={{ background: '#6c757d', color: 'white' }}>
//           Clear Form
//         </button>
//       </div>
//     </form>
//   );
// }

// export default ResumeForm;


import React, { useState, useEffect } from "react";
import axios from 'axios';

function ResumeForm({ token, onResumeCreated, initialData, mode, onBack }) {

  // 1. MOVED this function to the top of the component.
  // This ensures it is defined before being used by useState.
  const getInitialFormState = () => ({
    name: "", email: "", phone: "", summary: "", linkedin: "", github: "", interests: "",
    education: {
      school: { name: "", year: "", grade: "" },
      intermediate: { name: "", year: "", grade: "" },
      graduation: { name: "", year: "", grade: "" },
    },
    skills: "",
    experience: [{ title: "", company: "", description: "" }],
    certifications: [{ name: "", link: "" }],
    projects: [{ title: "", description: "" }],
  });

  // 2. NOW, this line can safely call the function.
  const [form, setForm] = useState(initialData || getInitialFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // The rest of your code does not need to change.
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/resume', form, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  const addExperience = () => setForm({ ...form, experience: [...form.experience, { title: "", company: "", description: "" }] });
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
    <>
    <form onSubmit={handleSubmit}>
      <h3>Basic Info</h3>
      <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required /><br />
      <input placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required /><br />
      <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} required /><br />
      <input placeholder="LinkedIn URL" name="linkedin" type="url" value={form.linkedin} onChange={handleChange} /><br />
      <input placeholder="GitHub URL" name="github" type="url" value={form.github} onChange={handleChange} /><br />

      <h3>Profile / Bio</h3>
      <textarea placeholder="Write a short, 2-3 sentence summary about yourself..." name="summary" value={form.summary} onChange={handleChange} rows="4" /><br />
      
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
      <input placeholder="Skills (comma separated)" name="skills" value={form.skills} onChange={handleChange} required /><br />
      
      <h3>Interests</h3>
      <input placeholder="Interests (comma separated)" name="interests" value={form.interests} onChange={handleChange} /><br />

      <h3>Experience</h3>
      {form.experience.map((exp, i) => (
        <div key={i}>
          <input placeholder="Title" name="title" value={exp.title} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <input placeholder="Company" name="company" value={exp.company} onChange={(e) => handleExperienceChange(i, e)} /><br />
          <textarea placeholder="Description" name="description" value={exp.description} onChange={(e) => handleExperienceChange(i, e)} /><br />
          {form.experience.length > 1 && <button type="button" onClick={() => removeExperience(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addExperience}>+ Add Experience</button><br />

      <h3>Projects</h3>
      {form.projects.map((proj, i) => (
        <div key={i}>
          <input placeholder="Title" name="title" value={proj.title} onChange={(e) => handleProjectChange(i, e)} required /><br />
          <textarea placeholder="Description" name="description" value={proj.description} onChange={(e) => handleProjectChange(i, e)} required /><br />
          {form.projects.length > 1 && <button type="button" onClick={() => removeProject(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addProject}>+ Add Project</button><br /><br />

      <h3>Certifications</h3>
      {form.certifications.map((cert, i) => (
        <div key={i}>
          <input placeholder="Certificate Name" name="name" value={cert.name} onChange={(e) => handleCertificationChange(i, e)} /><br />
          <input placeholder="Certificate Link (Optional)" name="link" type="url" value={cert.link} onChange={(e) => handleCertificationChange(i, e)} /><br />
          {form.certifications.length > 1 && <button type="button" onClick={() => removeCertification(i)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addCertification}>+ Add Certification</button><br /><br />

      <div style={{ marginTop: ' twentieth', display: 'flex', gap: '10px' }}>
        {error && <p style={{color: 'red', marginRight: '20px'}}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Polishing with AI & Saving...' : 'Save Resume'}
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

