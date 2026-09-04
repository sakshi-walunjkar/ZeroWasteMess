import { useState, useEffect } from "react";
import { Leaf, Menu, X } from "lucide-react";
import "../styles/Navbar.css";

const ROLE_LINKS = {
  admin:          [{ id: "admin-dashboard", label: "Dashboard" }, { id: "log-food", label: "Log Food" }, { id: "food-log", label: "Food Log" }, { id: "ngos", label: "NGO Partners" }],
  ngo:            [{ id: "ngo-dashboard", label: "Dashboard" }],
  mess_staff:     [{ id: "mess-dashboard", label: "Dashboard" }, { id: "log-food", label: "Log Food" }],
  delivery_staff: [{ id: "delivery-dashboard", label: "My Tasks" }],
};

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ROLE_LINKS[user?.role] ?? [
    { id: "home", label: "Home" },
    { id: "food-log", label: "Food Log" },
    { id: "ngos", label: "NGO Partners" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => setActivePage("home")}>
          <Leaf className="logo-icon" size={20} />
          <span className="logo-text">
            <span className="logo-bold">Zero</span>Waste<span className="logo-bold">Mess</span>
          </span>
        </button>

        <ul className={`nav-links ${mobileOpen ? "mobile-open" : ""}`}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                className={`nav-link ${activePage === link.id ? "active" : ""}`}
                onClick={() => { setActivePage(link.id); setMobileOpen(false); }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {user && (
            <div className="nav-user-chip">
              <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span>{user.name?.split(" ")[0]}</span>
            </div>
          )}
          {onLogout && (
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          )}
          <button
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
