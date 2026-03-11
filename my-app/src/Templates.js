import React, { useState, useRef, useEffect } from "react";
import ResumePreview from "./ResumePreview";
import ResumePreview2 from "./ResumePreview2";

function Templates({ resumeData }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const componentRef = useRef();

    // Scroll to top when template opens
    useEffect(() => {
        if (selectedTemplate) {
            window.scrollTo(0, 0);
        }
    }, [selectedTemplate]);

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

    const renderSelectedTemplate = () => {
        switch (selectedTemplate) {
            case 'Custom':
                return <ResumePreview ref={componentRef} data={resumeData} />;
            case 'ATS':
                return <ResumePreview2 ref={componentRef} data={resumeData} />;
            default:
                return null;
        }
    };

    if (selectedTemplate) {
        return (
            <div className="template-preview-wrapper" style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div style={{ marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
                    <button
                        className="premium-btn"
                        style={{ background: "#64748b" }}
                        onClick={() => setSelectedTemplate(null)}
                    >
                        ← Back to Templates
                    </button>
                    <h2 style={{ margin: 0 }}>Preview Resume</h2>
                    <button className="premium-btn" style={{ background: "#64748b" }} onClick={handleDownloadPDF}>
                        📄 Download as PDF
                    </button>
                </div>
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    {renderSelectedTemplate()}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: "8px" }}>Resume Templates</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Select a template to view and download your modern AI-optimized resume.</p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: "wrap" }}>

                {/* Template 1 */}
                <div
                    onClick={() => setSelectedTemplate('Custom')}
                    style={{
                        background: "linear-gradient(135deg, #ffffff, #f8f9fa)",
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '16px',
                        padding: '32px 20px',
                        width: '240px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        position: "relative",
                        overflow: "hidden"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>✨</div>
                    <h3 style={{ margin: '0 0 8px 0', color: "var(--text-main)" }}>Modern</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>Clean, vibrant layout</p>
                </div>

                {/* Template 2 */}
                <div
                    onClick={() => setSelectedTemplate('ATS')}
                    style={{
                        background: "linear-gradient(135deg, #ffffff, #f8f9fa)",
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '16px',
                        padding: '32px 20px',
                        width: '240px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                        transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
                    <h3 style={{ margin: '0 0 8px 0', color: "var(--text-main)" }}>ATS Optimized</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>Standard formatting</p>
                </div>

            </div>
        </div>
    );
}

export default Templates;
