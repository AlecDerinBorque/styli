import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Styli</Link>
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
