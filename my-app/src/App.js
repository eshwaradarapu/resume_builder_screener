import React, { useState, useEffect } from "react";
import AuthPage from "./AuthPage";
import ResumeForm from "./ResumeForm";
import Dashboard from "./Dashboard";
import Templates from "./Templates";
import Layout from "./Layout";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AnalyzerPage from "./AnalyzerPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem('resume_token'));
  const [userHasData, setUserHasData] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs on app start and when the token changes (e.g., login/logout)
  useEffect(() => {
    const checkUserStatus = async () => {
      if (token) {
        setIsLoading(true);
        try {
          // Check if the user has a resume saved in the database
          const response = await axios.get('http://localhost:5000/api/resume', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data && Object.keys(response.data).length > 0) {
            // If data exists, the user has a resume.
            setResumeData(response.data);
            setUserHasData(true);
          } else {
            // If no data, this is a new user who needs to fill out the form.
            setUserHasData(false);
          }
        } catch (error) {
          console.error("Failed to fetch user status", error);
          handleLogout(); // Log out the user if the token is invalid or an error occurs
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    checkUserStatus();
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('resume_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('resume_token');

    // 🔥 RESET USER-SCOPED STATE
    setToken(null);
    setResumeData(null);
    setUserHasData(false);
  };

  // This function is called by the form after a new resume is created
  const handleResumeCreated = (newData) => {
    setResumeData(newData);
    setUserHasData(true); // This switches the view to the Dashboard
  };

  // This is called from the Dashboard to go back to the form for editing
  const handleEdit = () => {
    setUserHasData(false);
  };

  // While checking the user's status, show a loading message
  if (isLoading && token) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <Router>
      {!token ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Layout handleLogout={handleLogout}>
          <Routes>
            {/* Always land on Dashboard first after login */}
            <Route
              path="/"
              element={<Dashboard token={token} />}
            />
            <Route
              path="/templates"
              element={
                userHasData ? (
                  <Templates resumeData={resumeData} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
            <Route
              path="/analyzer"
              element={
                userHasData ? (
                  <AnalyzerPage token={token} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                <ResumeForm
                  token={token}
                  onResumeCreated={handleResumeCreated}
                  initialData={resumeData}
                  mode={resumeData ? "edit" : "create"}
                  onBack={userHasData ? () => { } : undefined} // Removed back button action if they don't have data, else it's optional
                />
              }
            />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;

