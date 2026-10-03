import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/styli-logo.png";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} className="logo-icon" alt="Styli logo" /> Styli
      </Link>
      <ul>
        <li>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
