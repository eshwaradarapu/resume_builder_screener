

import React from "react";
import styles from './ResumePreview.module.css';

const ResumePreview = React.forwardRef(({ data }, ref) => {
  const skillsArray = data.skills ? data.skills.split(',').map(skill => skill.trim()) : [];
  const interestsArray = data.interests ? data.interests.split(',').map(interest => interest.trim()) : [];
  
  const validExperiences = data.experience ? data.experience.filter(exp => exp.title && exp.title.trim() !== "") : [];
  const validCertifications = data.certifications ? data.certifications.filter(cert => cert.name && cert.name.trim() !== "") : [];

  return (
    <div ref={ref} className={styles.container}>
      <aside className={styles.sidebar}>
        <h1>{data.name}</h1>
        
        <section className={styles.contactInfo}>
            <h2>Contact</h2>
            <p>{data.email}</p>
            <p>{data.phone}</p>
            {data.linkedin && <p><a href={data.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
            {data.github && <p><a href={data.github} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
        </section>

        {/* --- THIS SECTION IS NOW CORRECTED --- */}
        <section>
          <h2>Education</h2>
          <div className={styles.educationItem}>
              <p><b>{data.education.graduation.name}</b></p>
              <p>{data.education.graduation.year} | {data.education.graduation.grade}</p>
          </div>
          <div className={styles.educationItem}>
              <p><b>{data.education.intermediate.name}</b></p>
              <p>{data.education.intermediate.year} | {data.education.intermediate.grade}</p>
          </div>
          <div className={styles.educationItem}>
              <p><b>{data.education.school.name}</b></p>
              <p>{data.education.school.year} | {data.education.school.grade}</p>
          </div>
        </section>
        {/* ------------------------------------ */}


        {skillsArray.length > 0 && (
          <section>
            <h2>Skills</h2>
            <ul className={styles.skillsList}>
                {skillsArray.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
          </section>
        )}
        {interestsArray.length > 0 && (
          <section>
            <h2>Interests</h2>
            <ul className={styles.interestsList}>
                {interestsArray.map((interest, index) => <li key={index}>{interest}</li>)}
            </ul>
          </section>
        )}
      </aside>

      <main className={styles.mainContent}>
        
        {data.summary && (
          <section>
              <h2>Profile</h2>
              <p className={styles.itemDescription}>{data.summary}</p>
          </section>
        )}

        {validExperiences.length > 0 && (
          <section>
            <h2>Experience</h2>
            {validExperiences.map((exp, index) => (
              <div key={index} className={styles.experienceItem}>
                  <div className={styles.itemHeader}>
                      <h3>{exp.title}</h3>
                      <span>{exp.company}</span>
                  </div>
                  <p className={styles.itemDescription}>{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        {data.projects && data.projects.filter(p => p.title).length > 0 && (
          <section>
            <h2>Projects</h2>
            {data.projects.map((proj, index) => (
              proj.title && (
                <div key={index} className={styles.projectItem}>
                    <div className={styles.itemHeader}>
                        <h3>{proj.title}</h3>
                    </div>
                    <p className={styles.itemDescription}>{proj.description}</p>
                </div>
              )
            ))}
          </section>
        )}

        {validCertifications.length > 0 && (
          <section>
            <h2>Certifications</h2>
            {validCertifications.map((cert, index) => (
              <div key={index} className={styles.certificationItem}>
                {cert.link ? (
                  <p><a href={cert.link} target="_blank" rel="noopener noreferrer">{cert.name}</a></p>
                ) : (
                  <p>{cert.name}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
});

export default ResumePreview;

