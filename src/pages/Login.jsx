import { useState } from "react";
import { Leaf, AlertCircle, Shield, UtensilsCrossed, Building2, Truck, ChevronRight, Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import "../styles/Login.css";

const ROLES = [
  {
    key: "admin",
    label: "Admin",
    icon: Shield,
    color: "blue",
    desc: "Full system control & supply chain management",
    users: [
      { name: "Warden Admin", email: "admin@hostel.edu", password: "admin123" },
    ],
  },
  {
    key: "mess",
    label: "Mess Staff",
    icon: UtensilsCrossed,
    color: "amber",
    desc: "Log leftover food from hostel mess kitchens",
    users: [
      { name: "Sunil Yadav",   email: "mess1@hostel.edu", password: "mess123", sub: "Hostel A Mess" },
      { name: "Geeta Devi",    email: "mess2@hostel.edu", password: "mess123", sub: "Hostel B Mess" },
      { name: "Ramesh Babu",   email: "mess3@hostel.edu", password: "mess123", sub: "Hostel C Mess" },
      { name: "Kamla Bai",     email: "mess4@hostel.edu", password: "mess123", sub: "Hostel D Mess" },
      { name: "Harish Pandey", email: "mess5@hostel.edu", password: "mess123", sub: "Hostel E Mess" },
      { name: "Savita Kumari", email: "mess6@hostel.edu", password: "mess123", sub: "Hostel F Mess" },
      { name: "Dinesh Rawat",  email: "mess7@hostel.edu", password: "mess123", sub: "Hostel G Mess" },
      { name: "Pushpa Singh",  email: "mess8@hostel.edu", password: "mess123", sub: "Hostel H Mess" },
      { name: "Bharat Lal",    email: "mess9@hostel.edu", password: "mess123", sub: "Hostel I Mess" },
      { name: "Meena Sharma",  email: "mess10@hostel.edu",password: "mess123", sub: "Hostel J Mess" },
    ],
  },
  {
    key: "ngo",
    label: "NGO",
    icon: Building2,
    color: "green",
    desc: "Request & receive food for your beneficiaries",
    users: [
      { name: "Rajesh Kumar",   email: "ngo1@ashaseva.org",       password: "ngo123", sub: "Asha Seva Trust" },
      { name: "Priya Sharma",   email: "ngo2@helphand.org",        password: "ngo123", sub: "HelpHand Foundation" },
      { name: "Amit Patel",     email: "ngo3@nourishindia.org",    password: "ngo123", sub: "Nourish India" },
      { name: "Sunita Devi",    email: "ngo4@annapoorna.org",      password: "ngo123", sub: "Annapoorna Sewa" },
      { name: "Mohan Lal",      email: "ngo5@rotighar.org",        password: "ngo123", sub: "Roti Ghar" },
      { name: "Kavita Singh",   email: "ngo6@bhojansewa.org",      password: "ngo123", sub: "Bhojan Sewa Samiti" },
      { name: "Ramesh Gupta",   email: "ngo7@khanachahiye.org",    password: "ngo123", sub: "Khana Chahiye" },
      { name: "Anita Joshi",    email: "ngo8@sevabharati.org",     password: "ngo123", sub: "Seva Bharati Food Wing" },
      { name: "Suresh Mehta",   email: "ngo9@hungerfreedelhi.org", password: "ngo123", sub: "Hunger Free Delhi" },
      { name: "Dr. Neha Kapoor",email: "ngo10@dilse.org",          password: "ngo123", sub: "Dil Se Foundation" },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    icon: Truck,
    color: "purple",
    desc: "Collect food from mess & deliver to NGOs",
    users: [
      { name: "Ravi Kumar",    email: "ravi@hostel.edu",    password: "delivery123", sub: "DL-01-AB-1001" },
      { name: "Amit Singh",    email: "amit@hostel.edu",    password: "delivery123", sub: "DL-01-AB-1002" },
      { name: "Suresh Yadav",  email: "suresh@hostel.edu",  password: "delivery123", sub: "DL-01-AB-1003" },
      { name: "Deepak Verma",  email: "deepak@hostel.edu",  password: "delivery123", sub: "DL-01-AB-1004" },
      { name: "Manoj Tiwari",  email: "manoj@hostel.edu",   password: "delivery123", sub: "DL-01-AB-1005" },
      { name: "Vikram Nair",   email: "vikram@hostel.edu",  password: "delivery123", sub: "DL-01-AB-1006" },
      { name: "Pradeep Mishra",email: "pradeep@hostel.edu", password: "delivery123", sub: "DL-01-AB-1007" },
      { name: "Sanjay Gupta",  email: "sanjay@hostel.edu",  password: "delivery123", sub: "DL-01-AB-1008" },
      { name: "Anil Chauhan",  email: "anil@hostel.edu",    password: "delivery123", sub: "DL-01-AB-1009" },
      { name: "Rohit Sharma",  email: "rohit@hostel.edu",   password: "delivery123", sub: "DL-01-AB-1010" },
    ],
  },
];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function Login({ onLogin }) {
  const [activeRole, setActiveRole] = useState("admin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const role = ROLES.find(r => r.key === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 350));
    const result = onLogin(form);
    if (!result) setError("Invalid credentials. Select a user card below or enter manually.");
    setLoading(false);
  };

  const fillUser = (u) => {
    setForm({ email: u.email, password: u.password });
    setSelectedUser(u);
    setError("");
  };

  return (
    <div className="login-root">
      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-brand-mark">
          <Leaf size={22} />
          <span className="login-brand-name">ZeroWasteMess</span>
        </div>
        <div className="login-hero-text">
          <h2>Turning leftovers into <span>hope</span></h2>
          <p>A smart supply chain connecting hostel mess kitchens with NGOs — reducing food waste, one meal at a time.</p>
        </div>
        <div className="login-left-stats">
          <div className="ls-stat"><div className="ls-val">10</div><div className="ls-label">Mess Kitchens</div></div>
          <div className="ls-stat"><div className="ls-val">10</div><div className="ls-label">NGO Partners</div></div>
          <div className="ls-stat"><div className="ls-val">10</div><div className="ls-label">Delivery Staff</div></div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h1>Sign in</h1>
            <p>Select your role, pick a user, then sign in</p>
          </div>

          {/* Credential hint */}
          {selectedUser && (
            <div className={`cred-hint cred-hint-${activeRole}`}>
              <div className="cred-hint-row"><Mail size={13} /><span className="cred-label">Email</span><code>{selectedUser.email}</code></div>
              <div className="cred-hint-row"><KeyRound size={13} /><span className="cred-label">Password</span><code>{selectedUser.password}</code></div>
            </div>
          )}

          {/* Role tabs */}
          <div className="role-tabs">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  className={`role-tab role-tab-${r.color} ${activeRole === r.key ? "active" : ""}`}
                  onClick={() => { setActiveRole(r.key); setForm({ email: "", password: "" }); setSelectedUser(null); setError(""); }}
                  type="button"
                >
                  <Icon size={16} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role description */}
          <p className="role-desc">{role.desc}</p>

          {/* User cards */}
          <div className={`user-cards user-cards-${role.users.length > 4 ? "scroll" : "grid"}`}>
            {role.users.map(u => (
              <button
                key={u.email}
                type="button"
                className={`user-card-btn ${form.email === u.email ? "selected" : ""} card-${activeRole}`}
                onClick={() => fillUser(u)}
              >
                <div className={`user-avatar avatar-${activeRole}`}>{getInitials(u.name)}</div>
                <div className="user-card-info">
                  <div className="user-card-name">{u.name}</div>
                  {u.sub && <div className="user-card-sub">{u.sub}</div>}
                </div>
                {form.email === u.email && <ChevronRight size={14} className="user-card-check" />}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@hostel.edu"
                required
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <div className="pwd-wrap">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="login-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            <button type="submit" className={`login-btn login-btn-${activeRole}`} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
