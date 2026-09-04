// Role-based permission map
// Each role lists exactly what actions they can perform

export const PERMISSIONS = {
  admin: [
    'assign_collection',      // assign collection staff to pending food
    'assign_delivery',        // assign NGO + delivery staff to collected food
    'approve_ngo_request',    // approve NGO food requests
    'reject_ngo_request',     // reject NGO food requests
    'cancel_any_entry',       // cancel/delete any food entry
    'reassign_staff',         // reassign collection or delivery staff
    'view_all_entries',       // see all food entries across all messes
    'view_all_staff',         // see all users and staff
    'view_live_tracking',     // see live delivery tracking
    'suspend_user',           // suspend any user account
  ],
  mess_staff: [
    'log_food',               // create new food entry
    'cancel_own_pending',     // cancel their own Pending Collection entries only
    'view_own_entries',       // see only their own entries
  ],
  delivery_staff: [
    'accept_task',            // accept an assigned collection/delivery task
    'decline_task',           // decline an assigned task (sends back to admin)
    'mark_collected',         // mark food as collected from mess
    'mark_delivered',         // mark food as delivered to NGO
    'report_issue',           // report a problem with a task
    'view_own_tasks',         // see only tasks assigned to them
  ],
  ngo: [
    'request_food',           // request available food
    'cancel_own_request',     // cancel their own pending request
    'confirm_receipt',        // confirm they received the food
    'view_available_food',    // see food available for pickup
    'view_own_deliveries',    // see deliveries assigned to their NGO
  ],
};

export const can = (role, action) => {
  return PERMISSIONS[role]?.includes(action) ?? false;
};

// Human-readable role labels
export const ROLE_LABELS = {
  admin:          'Admin',
  mess_staff:     'Mess Staff',
  delivery_staff: 'Delivery Staff',
  ngo:            'NGO Partner',
};

// Who controls whom in the workflow
export const WORKFLOW_CONTROL = {
  'Pending Collection':   { controller: 'admin',          action: 'Assign Collection Staff' },
  'Collection Assigned':  { controller: 'delivery_staff', action: 'Accept & Mark Collected' },
  'Collected':            { controller: 'admin',          action: 'Assign NGO + Delivery' },
  'In Transit':           { controller: 'delivery_staff', action: 'Mark Delivered' },
  'Delivered':            { controller: 'ngo',            action: 'Confirm Receipt' },
};
