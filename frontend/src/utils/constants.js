// Item categories with icons and labels
export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: '📱', color: 'blue' },
  { value: 'documents', label: 'Documents / ID Cards', icon: '📄', color: 'yellow' },
  { value: 'accessories', label: 'Accessories', icon: '⌚', color: 'purple' },
  { value: 'clothing', label: 'Clothing', icon: '👕', color: 'pink' },
  { value: 'books', label: 'Books / Notebooks', icon: '📚', color: 'green' },
  { value: 'keys', label: 'Keys', icon: '🔑', color: 'orange' },
  { value: 'wallet', label: 'Wallet / Purse', icon: '👛', color: 'red' },
  { value: 'bags', label: 'Bags / Backpacks', icon: '🎒', color: 'indigo' },
  { value: 'sports', label: 'Sports Equipment', icon: '⚽', color: 'cyan' },
  { value: 'other', label: 'Other', icon: '📦', color: 'gray' },
];

// Campus locations
export const LOCATIONS = [
  { value: 'library', label: 'Library', icon: '📚' },
  { value: 'canteen', label: 'Canteen / Food Court', icon: '🍽️' },
  { value: 'hostel', label: 'Hostel', icon: '🏠' },
  { value: 'classroom', label: 'Classroom', icon: '🏫' },
  { value: 'lab', label: 'Computer Lab', icon: '💻' },
  { value: 'sports_complex', label: 'Sports Complex', icon: '🏟️' },
  { value: 'parking', label: 'Parking Area', icon: '🅿️' },
  { value: 'auditorium', label: 'Auditorium', icon: '🎭' },
  { value: 'admin_block', label: 'Admin Block', icon: '🏛️' },
  { value: 'other', label: 'Other', icon: '📍' },
];

// Item status
export const ITEM_STATUS = {
  active: { label: 'Active', color: 'green' },
  claimed: { label: 'Claimed', color: 'yellow' },
  returned: { label: 'Returned', color: 'blue' },
  expired: { label: 'Expired', color: 'gray' },
  removed: { label: 'Removed', color: 'red' },
};

// Claim status
export const CLAIM_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'gray' },
};

// Helper functions
export const getCategoryInfo = (value) => {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[9];
};

export const getLocationInfo = (value) => {
  return LOCATIONS.find((l) => l.value === value) || LOCATIONS[9];
};

export const getStatusInfo = (status, type = 'item') => {
  if (type === 'claim') {
    return CLAIM_STATUS[status] || { label: status, color: 'gray' };
  }
  return ITEM_STATUS[status] || { label: status, color: 'gray' };
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(date);
};
