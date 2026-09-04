import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Package, CheckCircle } from 'lucide-react';
import { workflowService, foodService } from '../services/database';
import '../styles/LiveTracking.css';

export default function LiveTracking({ foodId, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [food, setFood] = useState(null);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [foodId]);

  const loadTracking = () => {
    const trackingData = workflowService.getTrackingByFood(foodId);
    setTracking(trackingData);
    const foodData = foodService.getById(foodId);
    setFood(foodData);
  };

  if (!tracking || !food) {
    return (
      <div className="tracking-modal">
        <div className="tracking-content">
          <p>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(tracking);
  const eta = calculateETA(tracking);

  return (
    <div className="tracking-modal" onClick={onClose}>
      <div className="tracking-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-header">
          <h2>Live Delivery Tracking</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Status Bar */}
        <div className="tracking-status">
          <div className="status-item active">
            <Package size={20} />
            <span>Picked Up</span>
          </div>
          <div className={`status-line ${progress > 50 ? 'active' : ''}`}></div>
          <div className={`status-item ${progress > 50 ? 'active' : ''}`}>
            <Navigation size={20} />
            <span>In Transit</span>
          </div>
          <div className={`status-line ${progress === 100 ? 'active' : ''}`}></div>
          <div className={`status-item ${progress === 100 ? 'active' : ''}`}>
            <CheckCircle size={20} />
            <span>Delivered</span>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="map-container">
          <div className="map-placeholder">
            <MapPin size={48} color="#16a34a" />
            <p>Map View</p>
            <div className="route-line"></div>
            <div className="location-markers">
              <div className="marker start">
                <MapPin size={24} />
                <span>{food.mess}</span>
              </div>
              <div className="marker current" style={{ left: `${progress}%` }}>
                <Navigation size={24} />
                <span>{tracking.staffName}</span>
              </div>
              <div className="marker end">
                <MapPin size={24} />
                <span>{food.ngoName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info">
          <div className="info-card">
            <h3>Delivery Details</h3>
            <div className="info-row">
              <span>Item:</span>
              <strong>{food.item}</strong>
            </div>
            <div className="info-row">
              <span>Quantity:</span>
              <strong>{food.quantity} {food.unit}</strong>
            </div>
            <div className="info-row">
              <span>From:</span>
              <strong>{food.mess}</strong>
            </div>
            <div className="info-row">
              <span>To:</span>
              <strong>{food.ngoName}</strong>
            </div>
            <div className="info-row">
              <span>Driver:</span>
              <strong>{tracking.staffName}</strong>
            </div>
          </div>

          <div className="info-card">
            <h3>Estimated Arrival</h3>
            <div className="eta-display">
              <Clock size={32} />
              <div>
                <div className="eta-time">{eta}</div>
                <div className="eta-label">minutes</div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">{progress}% Complete</p>
          </div>
        </div>

        {/* Route History */}
        <div className="route-history">
          <h3>Route History</h3>
          <div className="history-list">
            {tracking.route.map((point, index) => (
              <div key={index} className="history-item">
                <div className="history-dot"></div>
                <div className="history-content">
                  <span className="history-time">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="history-location">
                    Checkpoint {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateProgress(tracking) {
  if (tracking.status === 'Completed') return 100;
  
  const totalDistance = Math.sqrt(
    Math.pow(tracking.endLocation.lat - tracking.startLocation.lat, 2) +
    Math.pow(tracking.endLocation.lng - tracking.startLocation.lng, 2)
  );
  
  const currentDistance = Math.sqrt(
    Math.pow(tracking.currentLocation.lat - tracking.startLocation.lat, 2) +
    Math.pow(tracking.currentLocation.lng - tracking.startLocation.lng, 2)
  );
  
  return Math.min(Math.round((currentDistance / totalDistance) * 100), 95);
}

function calculateETA(tracking) {
  if (tracking.status === 'Completed') return 0;
  
  const now = new Date();
  const estimated = new Date(tracking.estimatedArrival);
  const diff = Math.max(0, Math.round((estimated - now) / 60000));
  
  return diff;
}
