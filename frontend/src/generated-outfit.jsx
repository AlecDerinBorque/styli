import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GeneratedOutfit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outfitSuggestions = location.state?.outfitSuggestions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedNames, setEditedNames] = useState({});
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const nextOutfit = () => {
    setCurrentIndex((i) => (i + 1) % outfitSuggestions.length);
    setEditing(false);
  };

  const prevOutfit = () => {
    setCurrentIndex((i) => (i - 1 + outfitSuggestions.length) % outfitSuggestions.length);
    setEditing(false);
  };

  const currentName = editedNames[currentIndex] || "Outfit Suggestion " + (currentIndex + 1);

  const toggleEditing = () => {
    if (!editing) {
      setInputValue(currentName);
      setEditing(true);
    } else {
      setEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setEditedNames({ ...editedNames, [currentIndex]: inputValue.trim() });
      setEditing(false);
    }
  };

  if (outfitSuggestions.length === 0) {
    return (
      <div className="suggestion-container">
        <p>No outfits were generated. You need at least one top, one bottom, and one pair of shoes in your wardrobe.</p>
        <button onClick={() => navigate("/preferences")}>Back to preferences</button>
      </div>
    );
  }

  return (
    <div className="suggestion-container">
      <div className="suggestion">
        <div className="outfit-title-container">
          {editing ? (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-name-input"
              autoFocus
            />
          ) : (
            <h1 className="editable-title">{currentName}</h1>
          )}
          <button onClick={toggleEditing}>{editing ? "Cancel" : "Rename"}</button>
        </div>

        <p>
          {currentIndex + 1} of {outfitSuggestions.length}
        </p>

        <div className="outfit-container">
          <button className="suggestion-arrow" onClick={prevOutfit}>Previous</button>

          {outfitSuggestions[currentIndex].map((item, index) => (
            <div key={index} className="large-image-container">
              <img
                src={item.image}
                alt={"Outfit piece " + index}
                className="outfit-item"
                width="180"
              />
              <p>{item.sub_category} / {item.color}</p>
            </div>
          ))}

          <button className="suggestion-arrow" onClick={nextOutfit}>Next</button>
        </div>

        <button onClick={() => navigate("/preferences")}>Try different preferences</button>
      </div>
    </div>
  );
};

export default GeneratedOutfit;
