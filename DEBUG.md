# Debug Guide - Assign Button Issue

## ✅ Fixed in v1.0.8

### What Was Added:
- Console logs to track button clicks
- Better validation for dropdown values
- Success/failure alerts
- Debug logs in workflow service

---

## 🔍 How to Debug

### Step 1: Clear Cache
```javascript
localStorage.clear()
```
Refresh page - loads v1.0.8

### Step 2: Open Console
Press F12 → Console tab

### Step 3: Test Assign Button

1. **Login as Mess** (staff@hostel.edu / staff123)
   - Log food: Rice, 10 kg

2. **Login as Admin** (admin@hostel.edu / admin123)
   - Go to Workflow tab
   - Assign collection staff (Ravi Kumar)

3. **Login as Ravi** (ravi@hostel.edu / staff123)
   - Mark as collected

4. **Login as Admin** (admin@hostel.edu / admin123)
   - Go to Workflow tab
   - Find "Collected - Assign Delivery" section
   - Select NGO dropdown
   - Select Delivery Staff dropdown
   - Click "Assign Delivery"

### Step 4: Check Console Logs

You should see:
```
Assign Delivery: {foodId: 123, ngoId: "1", staffId: "6"}
workflowService.assignDelivery called: {foodId: 123, ngoId: 1, staffId: 6}
Found: {foodIndex: 0, ngo: "Asha NGO", staff: "Amit Singh"}
```

### If Button Not Working:

**Check Console for:**
1. "Please select both NGO and delivery staff" → Dropdowns not selected
2. "Failed to assign delivery" → Database issue
3. No logs → Button click not firing

**Common Issues:**

1. **Dropdowns show empty**
   - Check deliveryStaff array has data
   - Check ngos array has data
   - Console: `console.log(deliveryStaff, ngos)`

2. **Button does nothing**
   - Check if collected array has items
   - Verify food status is "Collected"
   - Console: `console.log(collected)`

3. **Assignment fails**
   - Check staff role is "delivery_staff"
   - Check NGO status is "Active"
   - Check food exists in database

---

## 🐛 Manual Test

Open Console (F12) and run:

```javascript
// Check database
const db = JSON.parse(localStorage.getItem('zerowastemess_db'));
console.log('Food entries:', db.foodEntries);
console.log('NGOs:', db.ngos);
console.log('Users:', db.users);

// Check collected food
const collected = db.foodEntries.filter(f => f.status === 'Collected');
console.log('Collected food:', collected);

// Check delivery staff
const staff = db.users.filter(u => u.role === 'delivery_staff');
console.log('Delivery staff:', staff);
```

---

## ✅ Expected Behavior

1. Select NGO from dropdown
2. Select Delivery Staff from dropdown
3. Click "Assign Delivery"
4. See alert: "Delivery assigned successfully!"
5. Food disappears from "Collected" section
6. Food appears in "In Transit" section
7. Page refreshes automatically

---

## 📊 Version: 1.0.8

**Build:** SUCCESS (7.53s)
**Status:** Debug logs added
**Action:** Test and check console logs
