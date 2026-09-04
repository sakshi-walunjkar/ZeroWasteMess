import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import NGOList from "./components/NGOList";
import FoodLog from "./components/FoodLog";
import ImpactStats from "./components/ImpactStats";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import FoodEntry from "./pages/FoodEntry";
import AdminDashboard from "./pages/AdminDashboard";
import NGODashboard from "./pages/NGODashboard";
import MessDashboard from "./pages/MessDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import { foodService, ngoService, userService, notificationService } from "./services/database";
import "./styles/App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activePage, setActivePage] = useState("home");
  const [foodEntries, setFoodEntries] = useState([]);
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFoodEntries(foodService.getAll());
    setNgos(ngoService.getAll());
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Set default page based on role
      if (user.role === 'admin') {
        setActivePage('admin-dashboard');
      } else if (user.role === 'ngo') {
        setActivePage('ngo-dashboard');
      } else if (user.role === 'mess_staff') {
        setActivePage('mess-dashboard');
      } else if (user.role === 'delivery_staff') {
        setActivePage('delivery-dashboard');
      } else {
        setActivePage('home');
      }
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const addFoodEntry = (entry) => {
    const newEntry = foodService.create({
      ...entry,
      loggedBy: user.email
    });
    notificationService.notifyNGOs(newEntry);
    loadData();
    return newEntry;
  };

  const updateFoodEntry = (id, updates) => {
    foodService.update(id, updates);
    loadData();
  };

  const deleteFoodEntry = (id) => {
    foodService.delete(id);
    loadData();
  };

  const handleLogin = (credentials) => {
    const loggedInUser = userService.login(credentials.email, credentials.password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('home');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Role-based routing
  if (user.role === 'admin') {
    return (
      <div className="app">
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user}
          onLogout={handleLogout}
        />
        <main>
          {activePage === 'admin-dashboard' && <AdminDashboard user={user} />}
          {activePage === 'log-food' && (
            <FoodEntry
              addFoodEntry={addFoodEntry}
              setActivePage={setActivePage}
              user={user}
            />
          )}
          {activePage === 'food-log' && (
            <FoodLog 
              foodEntries={foodEntries} 
              setFoodEntries={setFoodEntries}
              updateEntry={updateFoodEntry}
              deleteEntry={deleteFoodEntry}
            />
          )}
          {activePage === 'ngos' && <NGOList ngos={ngos} />}
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role === 'ngo') {
    return (
      <div className="app">
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user}
          onLogout={handleLogout}
        />
        <main>
          {activePage === 'ngo-dashboard' && <NGODashboard user={user} />}
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role === 'mess_staff') {
    return (
      <div className="app">
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user}
          onLogout={handleLogout}
        />
        <main>
          {activePage === 'mess-dashboard' && <MessDashboard user={user} />}
          {activePage === 'log-food' && (
            <FoodEntry
              addFoodEntry={addFoodEntry}
              setActivePage={setActivePage}
              user={user}
            />
          )}
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role === 'delivery_staff') {
    return (
      <div className="app">
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          user={user}
          onLogout={handleLogout}
        />
        <main>
          {activePage === 'delivery-dashboard' && <DeliveryDashboard user={user} />}
        </main>
        <Footer />
      </div>
    );
  }

  // Unknown role — force logout
  if (!['admin','ngo','mess_staff','delivery_staff'].includes(user.role)) {
    handleLogout();
    return null;
  }

  return (
    <div className="app">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        user={user}
        onLogout={handleLogout}
      />
      <main>
        {activePage === "home" && (
          <>
            <Hero setActivePage={setActivePage} foodEntries={foodEntries} ngos={ngos} />
            <ImpactStats foodEntries={foodEntries} ngos={ngos} />
            <Dashboard foodEntries={foodEntries} />
          </>
        )}
        {activePage === "log-food" && (
          <FoodEntry
            addFoodEntry={addFoodEntry}
            setActivePage={setActivePage}
            user={user}
          />
        )}
        {activePage === "food-log" && (
          <FoodLog 
            foodEntries={foodEntries} 
            setFoodEntries={setFoodEntries}
            updateEntry={updateFoodEntry}
            deleteEntry={deleteFoodEntry}
          />
        )}
        {activePage === "ngos" && <NGOList ngos={ngos} />}
      </main>
      <Footer />
    </div>
  );
}
