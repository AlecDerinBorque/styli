import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "./icons";

const API = "http://127.0.0.1:5000";

const Preferences = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [weather, setWeather] = useState("");
  const [occasion, setOccasion] = useState("");
  const [color, setColor] = useState("");

  const token = localStorage.getItem("token");

  const weather_options = ["hot", "warm", "cool", "cold", "rainy"];

  const occasions = [
    "casual", "work", "formal", "athletic", "outdoor", "lounge", "party", "special event"
  ];

  const colors = [
    "black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "brown",
    "gray", "navy", "beige", "cream"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const preferences = { weather, occasion, color };

      const generateResponse = await fetch(API + "/outfits/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(preferences),
      });

      if (!generateResponse.ok) throw new Error("Failed to generate outfit.");

      const outfitData = await generateResponse.json();
      setIsGenerating(false);
      navigate("/generated-outfit", {
        state: { outfitSuggestions: outfitData.outfit },
      });
    } catch (error) {
      console.error("Error during outfit generation:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="preferences-container">
      <div className="preference-text-container">
        <h1>Select Your Preferences</h1>
        <h3>
          Customize your outfit with these selections — optional but recommended
          for the perfect look!
        </h3>
      </div>

      <div className="preference-container">
        <h2>Weather:</h2>
        <select value={weather} onChange={(e) => setWeather(e.target.value)}>
          <option value="" disabled>Select</option>
          {weather_options.map((wea) => (
            <option key={wea} value={wea}>{wea}</option>
          ))}
        </select>
      </div>

      <div className="preference-container">
        <h2>Occasion:</h2>
        <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
          <option value="" disabled>Select</option>
          {occasions.map((occ) => (
            <option key={occ} value={occ}>{occ}</option>
          ))}
        </select>
      </div>

      <div className="preference-container">
        <h2>Color:</h2>
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="" disabled>Select</option>
          {colors.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <button className="generate-btn" onClick={handleGenerate} disabled={isGenerating}>
        <Icons.Generate className="generate" /> Generate
      </button>

      {isGenerating && (
        <div className="popup-overlay">
          <div className="popup-content">
            <Icons.Loading className="spinner" />
            <p id="popup-text">Generating your outfit...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preferences;
