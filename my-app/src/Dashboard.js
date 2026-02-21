import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import ResumePreview from './ResumePreview'; // Your first custom template
// We will import more templates here as we create them

// The Dashboard receives the user's saved data and a function to handle editing
function Dashboard({ resumeData, onEdit }) {
  // This state tracks which template is currently being viewed
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const componentRef = useRef();

  /*
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${resumeData?.name || "Resume"}_Resume`,
  });  */

 const handleDownloadPDF = async () => {
  if (!componentRef.current) return;

  const html = componentRef.current.outerHTML;

  // ✅ Grab all styles + CSS links from the page
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map(el => el.outerHTML)
    .join("\n");

  // ✅ Build full HTML document
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


  // Function to render the correct template based on the selection
  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case 'Custom':
        return <ResumePreview ref={componentRef} data={resumeData} />;
      // Add more cases here for future templates
      // case 'Classic':
      //   return <TemplateClassic ref={componentRef} data={resumeData} />;
      default:
        return <div>Please select a template.</div>;
    }
  };

  // If a template has been selected, show the preview view
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

  // --- This is the main dashboard view with template cards ---
  return (
    <div>
      <h2>Choose a Template</h2>
      <p>Select a template to view your resume.</p>
       <button onClick={onEdit}>✏️ Edit Resume Data</button>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        {/* Template Card 1 */}
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
          {/* You can add a small image preview of the template here */}
          
          <h3 style={{ marginTop: '10px' }}>Modern Template</h3>
        </div>

        {/* Add more template cards here in the future */}
        
      </div>
    </div>
  );
}

export default Dashboard;
