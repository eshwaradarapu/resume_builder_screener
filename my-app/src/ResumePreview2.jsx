import React from "react";
import styles from "./ResumePreview2.module.css";

const ResumePreview2 = React.forwardRef(({ data }, ref) => {

  const skillsArray = data.skills ? data.skills.split(",").map(s => s.trim()) : [];
  const validExperiences = data.experience ? data.experience.filter(e => e.title) : [];
  const validProjects = data.projects ? data.projects.filter(p => p.title) : [];
  const validCertifications = data.certifications ? data.certifications.filter(c => c.name) : [];

  return (
    <div ref={ref} className={styles.container}>

      {/* HEADER */}
      <header className={styles.header}>
        <h1>{data.name}</h1>

      <div className={styles.contact}>

  <span>• {data.email}</span>

  <span>• {data.phone}</span>

  {data.linkedin && (
    <a href={data.linkedin}>• LinkedIn</a>
  )}

  {data.github && (
    <a href={data.github}>• GitHub</a>
  )}

</div>
      </header>

      {/* PROFILE */}
      {data.summary && (
        <section>
          <h2>Profile</h2>
          <p>{data.summary}</p>
        </section>
      )}

      {/* EDUCATION */}
      {/* EDUCATION */}
<section>
  <h2>Education</h2>

  {/* Graduation */}
  <div className={styles.eduBlock}>
    <div className={styles.eduItem}>
      <b>{data.education.graduation.name}</b>
      <span>{data.education.graduation.year}</span>
    </div>

    <p>B.Tech in Computer Science and Engineering</p>
    <p>GPA: {data.education.graduation.grade}</p>
  </div>

  {/* Intermediate */}
  <div className={styles.eduBlock}>
    <div className={styles.eduItem}>
      <b>{data.education.intermediate.name}</b>
      <span>{data.education.intermediate.year}</span>
    </div>

    <p>Intermediate</p>
    <p>Percentage: {data.education.intermediate.grade}</p>
  </div>

  {/* School */}
  <div className={styles.eduBlock}>
    <div className={styles.eduItem}>
      <b>{data.education.school.name}</b>
      <span>{data.education.school.year}</span>
    </div>

    <p>SSC</p>
    <p>GPA: {data.education.school.grade}</p>
  </div>

</section>
      {/* PROJECTS */}
      {validProjects.length > 0 && (
        <section>
          <h2>Projects</h2>

          {validProjects.map((proj, i) => (
            <div key={i} className={styles.project}>
              <h3>{proj.title}</h3>

              {proj.structured ? (
                <ul>
                  {proj.structured.project_summary.map((b, index) => (
                    <li key={index}>
                      {Array.isArray(b) ? b.join(" ") : b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* SKILLS / TECHNOLOGIES */}
      {skillsArray.length > 0 && (
        <section>
          <h2>Technologies</h2>
          <p>{skillsArray.join(", ")}</p>
        </section>
      )}

      {/* CERTIFICATIONS */}
      {validCertifications.length > 0 && (
        <section>
          <h2>Certifications & Activities</h2>

          <ul>
            {validCertifications.map((c, i) => (
              <li key={i}>
                {c.link
                  ? <a href={c.link}>{c.name}</a>
                  : c.name}
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
});

export default ResumePreview2;