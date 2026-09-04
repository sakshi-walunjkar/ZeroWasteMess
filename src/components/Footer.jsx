import { Leaf, Activity } from "lucide-react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf size={24} />
            <span className="logo-text">
              <span className="logo-bold">Zero</span>Waste<span className="logo-bold">Mess</span>
            </span>
          </div>
          <p className="footer-tagline">
            Connecting hostel messes with communities in need.
            Every meal saved makes a difference.
          </p>
          <div className="footer-badge">
            <Activity size={14} />
            <span>System Operational</span>
            <span className="separator">·</span>
            <span>3 NGOs Active</span>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-col">
            <h4>System</h4>
            <a href="#">Dashboard</a>
            <a href="#">Log Food</a>
            <a href="#">Food Log</a>
            <a href="#">Reports</a>
          </div>
          <div className="link-col">
            <h4>Partners</h4>
            <a href="#">NGO Directory</a>
            <a href="#">Register NGO</a>
            <a href="#">Driver Portal</a>
          </div>
          <div className="link-col">
            <h4>About</h4>
            <a href="#">About Project</a>
            <a href="#">GitHub</a>
            <a href="#">API Docs</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 ZeroWasteMess · Built to reduce food waste</p>
        <p className="footer-stack">React · Node.js · MongoDB · Express</p>
      </div>
    </footer>
  );
}
