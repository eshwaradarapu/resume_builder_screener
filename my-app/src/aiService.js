// The URL of your Flask backend server . it acts as bridge between the frontend and backend 
const API_URL = 'http://localhost:5000/api/rephrase';

// This function sends the original text and its context (the title) to the backend
export const rephraseText = async (originalText, contextTitle) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // We send both pieces of data in the request body
      body: JSON.stringify({ originalText, contextTitle }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.rephrasedText;

  } catch (error) {
    console.error("Failed to fetch from backend:", error);
    // On failure, return the original text so the user's work isn't lost
    return originalText;
  }
};