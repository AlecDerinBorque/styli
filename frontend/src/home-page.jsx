import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confirmation from "./confirmation";

const API = "http://127.0.0.1:5000";

function HomePage() {
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    existingClassifications: [],
    newClassifications: [],
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    if (!token) return;
    try {
      const response = await fetch(API + "/wardrobe/fetch-user-items", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
      setWardrobeItems(await response.json());
    } catch (error) {
      console.error("Error fetching wardrobe: ", error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    const validImageTypes = ["image/jpeg", "image/png"];
    const imageFiles = files.filter((f) => validImageTypes.includes(f.type));
    if (imageFiles.length === 0) {
      alert("Please upload only JPEG or PNG images.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64Images = await Promise.all(imageFiles.map(convertToBase64));
      const response = await fetch(API + "/wardrobe/classify-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Images }),
      });
      if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
      const result = await response.json();
      setConfirmationData({
        existingClassifications: [],
        newClassifications: result.message,
      });
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error uploading images: ", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmationClose = async ({ newItems }) => {
    setShowConfirmation(false);
    if (newItems.length === 0) return;

    try {
      const response = await fetch(API + "/wardrobe/save-clothing-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newItems),
      });
      if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
      await fetchWardrobe();
    } catch (error) {
      console.error("Error saving items: ", error);
    }
  };

  const handleGenerate = () => {
    if (wardrobeItems.length === 0) {
      alert("Please upload some wardrobe items first.");
      return;
    }
    navigate("/preferences");
  };

  if (!token) {
    return (
      <div className="preferences-container">
        <h1>Please log in to use your wardrobe.</h1>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="sidebar">
          <h1>Welcome to Styli</h1>
          <h2>
            An AI-powered styling assistant that curates outfit suggestions
            based on your uploaded wardrobe.
          </h2>
          <label className="upload-btn">
            Upload
            <input type="file" multiple onChange={handleUpload} hidden />
          </label>
          <button className="generate-btn" onClick={handleGenerate}>
            Generate
          </button>
        </div>

        <div className="gallery-container">
          <h1>My Wardrobe</h1>
          <div className="gallery">
            <div className="image-grid">
              {wardrobeItems.map((item, i) => (
                <div key={i} className="image-container">
                  <img src={item.image} alt={item.sub_category} />
                </div>
              ))}
            </div>
          </div>
          {wardrobeItems.length === 0 && (
            <p className="gallery-placeholder">
              No items yet. Upload something to get started.
            </p>
          )}
        </div>
      </div>

      {showConfirmation && (
        <Confirmation
          existingClassifications={confirmationData.existingClassifications}
          newClassifications={confirmationData.newClassifications}
          onClose={handleConfirmationClose}
        />
      )}

      {isAnalyzing && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p id="popup-text">Analyzing clothing items...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
