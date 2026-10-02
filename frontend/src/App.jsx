import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navbar";
import HomePage from "./home-page";
import Login from "./login";
import Register from "./register";
import Preferences from "./preferences";
import GeneratedOutfit from "./generated-outfit";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/generated-outfit" element={<GeneratedOutfit />} />
      </Routes>
    </Router>
  );
}

export default App;
