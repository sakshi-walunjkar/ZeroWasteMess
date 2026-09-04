import initialData from '../data/database.json';

const DB_KEY = 'zerowastemess_db';
const DB_VERSION = '2.1.0';

const initDB = () => {
  const existing = localStorage.getItem(DB_KEY);
  const version = localStorage.getItem(DB_KEY + '_version');
  
  if (!existing || version !== DB_VERSION) {
    console.log('Initializing fresh database from JSON');
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    localStorage.setItem(DB_KEY + '_version', DB_VERSION);
  }
};

const getDB = () => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY));
};

const saveDB = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// ============ FOOD SERVICE ============
export const foodService = {
  getAll: () => {
    const db = getDB();
    return db.foodEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: (id) => {
    const db = getDB();
    return db.foodEntries.find(entry => entry.id === id);
  },

  getByStatus: (status) => {
    const db = getDB();
    return db.foodEntries.filter(entry => entry.status === status);
  },

  getByMess: (mess) => {
    const db = getDB();
    return db.foodEntries.filter(entry => entry.mess === mess);
  },

  getByNGO: (ngoId) => {
    const db = getDB();
    return db.foodEntries.filter(entry => entry.ngoId === ngoId);
  },

  create: (entry) => {
    const db = getDB();
    const newEntry = {
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: entry.status || 'Pending Collection',
      workflow: entry.workflow || 'Awaiting Collection',
      ngoId: null,
      ngoName: '',
      collectionStaffId: null,
      collectionStaffName: '',
      deliveryStaffId: null,
      deliveryStaffName: '',
      collectedAt: null,
      assignedAt: null,
      deliveredAt: null
    };
    db.foodEntries.push(newEntry);
    saveDB(db);
    return newEntry;
  },

  update: (id, updates) => {
    const db = getDB();
    const index = db.foodEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      db.foodEntries[index] = { ...db.foodEntries[index], ...updates };
      saveDB(db);
      return db.foodEntries[index];
    }
    return null;
  },

  assignToNGO: (foodId, ngoId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    const ngo = db.ngos.find(n => n.id === ngoId);
    
    if (foodIndex !== -1 && ngo) {
      // Guard: only assign after food has been collected
      if (db.foodEntries[foodIndex].status !== 'Collected') return null;

      db.foodEntries[foodIndex].ngoId = ngoId;
      db.foodEntries[foodIndex].ngoName = ngo.name;
      db.foodEntries[foodIndex].status = 'In Transit';
      db.foodEntries[foodIndex].workflow = 'Out for Delivery';
      db.foodEntries[foodIndex].assignedAt = new Date().toISOString();
      
      // Update NGO assigned deliveries
      const ngoIndex = db.ngos.findIndex(n => n.id === ngoId);
      if (!db.ngos[ngoIndex].assignedDeliveries) {
        db.ngos[ngoIndex].assignedDeliveries = [];
      }
      db.ngos[ngoIndex].assignedDeliveries.push(foodId);
      
      saveDB(db);
      
      // Notify NGO
      notificationService.create(ngoId, 'assignment', 'New Delivery Assigned', 
        `You have been assigned to deliver ${db.foodEntries[foodIndex].item}`, foodId);
      
      return db.foodEntries[foodIndex];
    }
    return null;
  },

  markDelivered: (foodId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    
    if (foodIndex !== -1) {
      const food = db.foodEntries[foodIndex];
      food.status = 'Delivered';
      food.workflow = 'Completed';
      food.deliveredAt = new Date().toISOString();

      // Update tracking record
      if (db.deliveryTracking) {
        const trackingIndex = db.deliveryTracking.findIndex(t => t.foodId === foodId);
        if (trackingIndex !== -1) {
          db.deliveryTracking[trackingIndex].status = 'Completed';
          db.deliveryTracking[trackingIndex].actualArrival = food.deliveredAt;
        }
      }
      
      // Update NGO stats
      if (food.ngoId) {
        const ngoIndex = db.ngos.findIndex(n => n.id === food.ngoId);
        if (ngoIndex !== -1) {
          db.ngos[ngoIndex].meals += Math.ceil(food.quantity);
          db.ngos[ngoIndex].assignedDeliveries = 
            db.ngos[ngoIndex].assignedDeliveries.filter(id => id !== foodId);
          if (!db.ngos[ngoIndex].completedDeliveries) {
            db.ngos[ngoIndex].completedDeliveries = [];
          }
          db.ngos[ngoIndex].completedDeliveries.push(foodId);
        }
      }
      
      saveDB(db);
      return food;
    }
    return null;
  },

  delete: (id) => {
    const db = getDB();
    db.foodEntries = db.foodEntries.filter(entry => entry.id !== id);
    saveDB(db);
    return true;
  },

  getStats: () => {
    const db = getDB();
    const entries = db.foodEntries;
    
    const totalKg = entries.reduce((sum, e) => {
      if (e.unit === 'kg') return sum + e.quantity;
      if (e.unit === 'pieces') return sum + e.quantity * 0.1;
      if (e.unit === 'litres') return sum + e.quantity * 0.5;
      return sum;
    }, 0);

    return {
      total: entries.length,
      totalKg: Math.round(totalKg * 10) / 10,
      pending: entries.filter(e => ['Pending Collection','Collection Assigned'].includes(e.status)).length,
      collected: entries.filter(e => e.status === 'Collected').length,
      inTransit: entries.filter(e => e.status === 'In Transit').length,
      delivered: entries.filter(e => e.status === 'Delivered').length,
      mealsServed: entries
        .filter(e => e.status === 'Delivered')
        .reduce((sum, e) => sum + Math.ceil(e.quantity), 0)
    };
  }
};

// ============ NGO SERVICE ============
export const ngoService = {
  getAll: () => {
    const db = getDB();
    return db.ngos;
  },

  getById: (id) => {
    const db = getDB();
    return db.ngos.find(ngo => ngo.id === id);
  },

  getActive: () => {
    const db = getDB();
    return db.ngos.filter(ngo => ngo.status === 'Active');
  },

  create: (ngo) => {
    const db = getDB();
    const newNGO = {
      ...ngo,
      id: Date.now(),
      meals: 0,
      rating: 0,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      assignedDeliveries: [],
      completedDeliveries: []
    };
    db.ngos.push(newNGO);
    saveDB(db);
    return newNGO;
  },

  update: (id, updates) => {
    const db = getDB();
    const index = db.ngos.findIndex(ngo => ngo.id === id);
    if (index !== -1) {
      db.ngos[index] = { ...db.ngos[index], ...updates };
      saveDB(db);
      return db.ngos[index];
    }
    return null;
  },

  getAssignedDeliveries: (ngoId) => {
    const db = getDB();
    const ngo = db.ngos.find(n => n.id === ngoId);
    if (ngo && ngo.assignedDeliveries) {
      return db.foodEntries.filter(f => ngo.assignedDeliveries.includes(f.id));
    }
    return [];
  },

  getCompletedDeliveries: (ngoId) => {
    const db = getDB();
    const ngo = db.ngos.find(n => n.id === ngoId);
    if (ngo && ngo.completedDeliveries) {
      return db.foodEntries.filter(f => ngo.completedDeliveries.includes(f.id));
    }
    return [];
  },

  getStats: () => {
    const db = getDB();
    const ngos = db.ngos;
    
    const totalMeals = ngos.reduce((sum, ngo) => sum + ngo.meals, 0);
    const avgRating = ngos.reduce((sum, ngo) => sum + ngo.rating, 0) / ngos.length;

    return {
      total: ngos.length,
      active: ngos.filter(ngo => ngo.status === 'Active').length,
      totalMeals,
      avgRating: Math.round(avgRating * 10) / 10
    };
  }
};

// ============ USER SERVICE ============
export const userService = {
  getAll: () => {
    const db = getDB();
    return db.users.map(u => ({ ...u, password: undefined }));
  },

  getById: (id) => {
    const db = getDB();
    const user = db.users.find(user => user.id === id);
    return user ? { ...user, password: undefined } : null;
  },

  getByEmail: (email) => {
    const db = getDB();
    const user = db.users.find(user => user.email === email);
    return user ? { ...user, password: undefined } : null;
  },

  login: (email, password) => {
    const db = getDB();
    // Trim whitespace from inputs
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const user = db.users.find(u => u.email === cleanEmail && u.password === cleanPassword);
    if (user) {
      return { ...user, password: undefined };
    }
    return null;
  },

  create: (user) => {
    const db = getDB();
    const newUser = {
      ...user,
      id: Date.now(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    return { ...newUser, password: undefined };
  },

  update: (id, updates) => {
    const db = getDB();
    const index = db.users.findIndex(user => user.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updates };
      saveDB(db);
      return { ...db.users[index], password: undefined };
    }
    return null;
  },

  getByRole: (role) => {
    const db = getDB();
    return db.users.filter(u => u.role === role).map(u => ({ ...u, password: undefined }));
  }
};

// ============ WORKFLOW SERVICE ============
export const workflowService = {
  // Assign collection staff
  assignCollectionStaff: (foodId, staffId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    const staff = db.users.find(u => u.id === staffId && u.role === 'delivery_staff');
    
    if (foodIndex !== -1 && staff) {
      db.foodEntries[foodIndex].collectionStaffId = staffId;
      db.foodEntries[foodIndex].collectionStaffName = staff.name;
      db.foodEntries[foodIndex].status = 'Collection Assigned';
      db.foodEntries[foodIndex].workflow = 'Awaiting Collection';
      saveDB(db);
      
      notificationService.create(staffId, 'collection_assigned', 'Collection Task Assigned',
        `Collect ${db.foodEntries[foodIndex].item} from ${db.foodEntries[foodIndex].mess}`, foodId);
      
      return db.foodEntries[foodIndex];
    }
    return null;
  },

  // Mark food as collected
  markCollected: (foodId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    
    if (foodIndex !== -1) {
      db.foodEntries[foodIndex].status = 'Collected';
      db.foodEntries[foodIndex].workflow = 'Collected';
      db.foodEntries[foodIndex].collectedAt = new Date().toISOString();
      saveDB(db);
      
      // Notify admin
      const admin = db.users.find(u => u.role === 'admin');
      if (admin) {
        notificationService.create(admin.id, 'food_collected', 'Food Collected',
          `${db.foodEntries[foodIndex].item} collected from ${db.foodEntries[foodIndex].mess}`, foodId);
      }
      
      return db.foodEntries[foodIndex];
    }
    return null;
  },

  // Assign delivery staff and NGO
  assignDelivery: (foodId, ngoId, staffId) => {
    console.log('workflowService.assignDelivery called:', { foodId, ngoId, staffId });
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    const ngo = db.ngos.find(n => n.id === ngoId);
    const staff = db.users.find(u => u.id === staffId && u.role === 'delivery_staff');
    
    console.log('Found:', { foodIndex, ngo: ngo?.name, staff: staff?.name });
    
    if (foodIndex !== -1 && ngo && staff) {
      db.foodEntries[foodIndex].ngoId = ngoId;
      db.foodEntries[foodIndex].ngoName = ngo.name;
      db.foodEntries[foodIndex].ngoLocation = ngo.location;
      db.foodEntries[foodIndex].deliveryStaffId = staffId;
      db.foodEntries[foodIndex].deliveryStaffName = staff.name;
      db.foodEntries[foodIndex].status = 'In Transit';
      db.foodEntries[foodIndex].workflow = 'Out for Delivery';
      db.foodEntries[foodIndex].assignedAt = new Date().toISOString();
      
      // Update NGO assigned deliveries
      const ngoIdx = db.ngos.findIndex(n => n.id === ngoId);
      if (ngoIdx !== -1) {
        if (!db.ngos[ngoIdx].assignedDeliveries) db.ngos[ngoIdx].assignedDeliveries = [];
        if (!db.ngos[ngoIdx].assignedDeliveries.includes(foodId)) {
          db.ngos[ngoIdx].assignedDeliveries.push(foodId);
        }
      }

      // Create tracking entry
      if (!db.deliveryTracking) db.deliveryTracking = [];
      const tracking = {
        id: Date.now(),
        foodId,
        staffId,
        staffName: staff.name,
        startLocation: db.foodEntries[foodIndex].messLocation,
        endLocation: ngo.location,
        currentLocation: staff.currentLocation || db.foodEntries[foodIndex].messLocation,
        status: 'In Transit',
        startTime: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString(),
        actualArrival: null,
        route: [{
          lat: staff.currentLocation?.lat || db.foodEntries[foodIndex].messLocation.lat,
          lng: staff.currentLocation?.lng || db.foodEntries[foodIndex].messLocation.lng,
          timestamp: new Date().toISOString()
        }]
      };
      db.deliveryTracking.push(tracking);
      
      saveDB(db);
      
      // Notify staff and NGO
      notificationService.create(staffId, 'delivery_assigned', 'Delivery Task Assigned',
        `Deliver ${db.foodEntries[foodIndex].item} to ${ngo.name}`, foodId);
      
      const ngoUser = db.users.find(u => u.ngoId === ngoId);
      if (ngoUser) {
        notificationService.create(ngoUser.id, 'delivery_incoming', 'Delivery On The Way',
          `${db.foodEntries[foodIndex].item} is being delivered by ${staff.name}`, foodId);
      }
      
      return db.foodEntries[foodIndex];
    }
    return null;
  },

  // Update delivery location
  updateLocation: (trackingId, location) => {
    const db = getDB();
    if (!db.deliveryTracking) return null;
    
    const trackingIndex = db.deliveryTracking.findIndex(t => t.id === trackingId);
    if (trackingIndex !== -1) {
      db.deliveryTracking[trackingIndex].currentLocation = location;
      db.deliveryTracking[trackingIndex].route.push({
        ...location,
        timestamp: new Date().toISOString()
      });
      
      // Update food entry location
      const foodId = db.deliveryTracking[trackingIndex].foodId;
      const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
      if (foodIndex !== -1) {
        db.foodEntries[foodIndex].currentLocation = location;
      }
      
      saveDB(db);
      return db.deliveryTracking[trackingIndex];
    }
    return null;
  },

  // Complete delivery
  completeDelivery: (foodId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    
    if (foodIndex !== -1) {
      const food = db.foodEntries[foodIndex];
      food.status = 'Delivered';
      food.workflow = 'Completed';
      food.deliveredAt = new Date().toISOString();
      
      // Update tracking
      if (db.deliveryTracking) {
        const trackingIndex = db.deliveryTracking.findIndex(t => t.foodId === foodId);
        if (trackingIndex !== -1) {
          db.deliveryTracking[trackingIndex].status = 'Completed';
          db.deliveryTracking[trackingIndex].actualArrival = new Date().toISOString();
        }
      }
      
      // Update NGO stats
      if (food.ngoId) {
        const ngoIndex = db.ngos.findIndex(n => n.id === food.ngoId);
        if (ngoIndex !== -1) {
          db.ngos[ngoIndex].meals += Math.ceil(food.quantity);
        }
      }
      
      saveDB(db);
      
      // Notify admin
      const admin = db.users.find(u => u.role === 'admin');
      if (admin) {
        notificationService.create(admin.id, 'delivery_completed', 'Delivery Completed',
          `${food.item} delivered to ${food.ngoName}`, foodId);
      }
      
      return food;
    }
    return null;
  },

  getActiveDeliveries: () => {
    const db = getDB();
    return db.deliveryTracking?.filter(t => t.status === 'In Transit') || [];
  },

  getTrackingByFood: (foodId) => {
    const db = getDB();
    return db.deliveryTracking?.find(t => t.foodId === foodId) || null;
  },

  // Delivery staff declines a task → resets back to Pending Collection
  declineTask: (foodId, staffId, reason) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    if (foodIndex === -1) return null;
    const food = db.foodEntries[foodIndex];
    food.status = 'Pending Collection';
    food.workflow = 'Awaiting Collection';
    food.collectionStaffId = null;
    food.collectionStaffName = '';
    food.deliveryStaffId = null;
    food.deliveryStaffName = '';
    food.declineReason = reason;
    food.declinedAt = new Date().toISOString();
    saveDB(db);
    const admin = db.users.find(u => u.role === 'admin');
    if (admin) notificationService.create(admin.id, 'task_declined', 'Task Declined',
      `${food.item} task declined by staff: ${reason}`, foodId);
    return food;
  },

  // Admin cancels any entry → removes it
  cancelEntry: (foodId) => {
    const db = getDB();
    const food = db.foodEntries.find(e => e.id === foodId);
    if (!food) return null;
    db.foodEntries = db.foodEntries.filter(e => e.id !== foodId);
    // Clean up NGO assignments
    if (food.ngoId) {
      const ngoIdx = db.ngos.findIndex(n => n.id === food.ngoId);
      if (ngoIdx !== -1) {
        db.ngos[ngoIdx].assignedDeliveries = (db.ngos[ngoIdx].assignedDeliveries || []).filter(id => id !== foodId);
      }
    }
    saveDB(db);
    return true;
  },

  // NGO confirms receipt of delivered food
  confirmReceipt: (foodId, ngoId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    if (foodIndex === -1) return null;
    db.foodEntries[foodIndex].receiptConfirmed = true;
    db.foodEntries[foodIndex].receiptConfirmedAt = new Date().toISOString();
    saveDB(db);
    const admin = db.users.find(u => u.role === 'admin');
    if (admin) notificationService.create(admin.id, 'receipt_confirmed', 'Receipt Confirmed',
      `${db.foodEntries[foodIndex].item} receipt confirmed by NGO`, foodId);
    return db.foodEntries[foodIndex];
  },

  // Mess staff cancels their own pending entry
  cancelOwnEntry: (foodId, userEmail) => {
    const db = getDB();
    const food = db.foodEntries.find(e => e.id === foodId);
    if (!food || food.loggedBy !== userEmail) return null;
    if (!['Pending Collection'].includes(food.status)) return null; // can only cancel pending
    db.foodEntries = db.foodEntries.filter(e => e.id !== foodId);
    saveDB(db);
    return true;
  },

  // Admin reassigns collection staff
  reassignCollection: (foodId, newStaffId) => {
    const db = getDB();
    const foodIndex = db.foodEntries.findIndex(e => e.id === foodId);
    const staff = db.users.find(u => u.id === newStaffId && u.role === 'delivery_staff');
    if (foodIndex === -1 || !staff) return null;
    db.foodEntries[foodIndex].collectionStaffId = newStaffId;
    db.foodEntries[foodIndex].collectionStaffName = staff.name;
    db.foodEntries[foodIndex].status = 'Collection Assigned';
    saveDB(db);
    notificationService.create(newStaffId, 'collection_assigned', 'Collection Task Assigned',
      `Collect ${db.foodEntries[foodIndex].item} from ${db.foodEntries[foodIndex].mess}`, foodId);
    return db.foodEntries[foodIndex];
  }
};

// ============ NGO REQUEST SERVICE ============
export const ngoRequestService = {
  getAll: () => {
    const db = getDB();
    return db.ngoRequests || [];
  },

  getByFood: (foodId) => {
    const db = getDB();
    return (db.ngoRequests || []).filter(r => r.foodId === foodId);
  },

  getByNGO: (ngoId) => {
    const db = getDB();
    return (db.ngoRequests || []).filter(r => r.ngoId === ngoId);
  },

  create: (foodId, ngoId, message) => {
    const db = getDB();
    if (!db.ngoRequests) db.ngoRequests = [];
    
    const ngo = db.ngos.find(n => n.id === ngoId);
    const request = {
      id: Date.now(),
      foodId,
      ngoId,
      ngoName: ngo?.name || '',
      requestedAt: new Date().toISOString(),
      status: 'Pending',
      message
    };
    
    db.ngoRequests.push(request);
    saveDB(db);
    
    // Notify admin
    const admin = db.users.find(u => u.role === 'admin');
    if (admin) {
      const food = db.foodEntries.find(f => f.id === foodId);
      notificationService.create(admin.id, 'ngo_request', 'NGO Food Request',
        `${ngo?.name} requested ${food?.item}`, foodId);
    }
    
    return request;
  },

  approve: (requestId, staffId) => {
    const db = getDB();
    if (!db.ngoRequests) return null;
    
    const requestIndex = db.ngoRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      const request = db.ngoRequests[requestIndex];
      request.status = 'Approved';
      saveDB(db); // save approval status first
      // assignDelivery reads fresh DB and saves itself — no double-save
      workflowService.assignDelivery(request.foodId, request.ngoId, staffId);
      return request;
    }
    return null;
  },

  reject: (requestId, reason) => {
    const db = getDB();
    if (!db.ngoRequests) return null;
    
    const requestIndex = db.ngoRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      db.ngoRequests[requestIndex].status = 'Rejected';
      db.ngoRequests[requestIndex].rejectionReason = reason;
      saveDB(db);
      
      // Notify NGO
      const ngoUser = db.users.find(u => u.ngoId === db.ngoRequests[requestIndex].ngoId);
      if (ngoUser) {
        notificationService.create(ngoUser.id, 'request_rejected', 'Request Rejected',
          `Your request was rejected: ${reason}`, db.ngoRequests[requestIndex].foodId);
      }
      
      return db.ngoRequests[requestIndex];
    }
    return null;
  }
};

// ============ NOTIFICATION SERVICE ============
export const notificationService = {
  getAll: () => {
    const db = getDB();
    return db.notifications || [];
  },

  getByUser: (userId) => {
    const db = getDB();
    return (db.notifications || []).filter(n => n.userId === userId);
  },

  getUnread: (userId) => {
    const db = getDB();
    return (db.notifications || []).filter(n => n.userId === userId && !n.read);
  },

  create: (userId, type, title, message, foodId = null) => {
    const db = getDB();
    if (!db.notifications) db.notifications = [];
    
    const notification = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      userId,
      type,
      title,
      message,
      foodId,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    db.notifications.push(notification);
    saveDB(db);
    return notification;
  },

  markRead: (id) => {
    const db = getDB();
    const index = (db.notifications || []).findIndex(n => n.id === id);
    if (index !== -1) {
      db.notifications[index].read = true;
      saveDB(db);
      return db.notifications[index];
    }
    return null;
  },

  markAllRead: (userId) => {
    const db = getDB();
    if (db.notifications) {
      db.notifications = db.notifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
      );
      saveDB(db);
    }
    return true;
  },

  notifyNGOs: (foodEntry) => {
    const db = getDB();
    const activeNGOs = db.ngos.filter(ngo => ngo.status === 'Active');
    
    activeNGOs.forEach(ngo => {
      const user = db.users.find(u => u.ngoId === ngo.id);
      if (user) {
        notificationService.create(
          user.id,
          'new_food',
          'New Food Available',
          `${foodEntry.quantity} ${foodEntry.unit} ${foodEntry.item} available from ${foodEntry.mess}`,
          foodEntry.id
        );
      }
    });
  }
};

// ============ UTILITY ============
export const dbService = {
  reset: () => {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return true;
  },

  export: () => {
    return getDB();
  },

  import: (data) => {
    saveDB(data);
    return true;
  },

  clear: () => {
    localStorage.removeItem(DB_KEY);
    return true;
  }
};

initDB();
