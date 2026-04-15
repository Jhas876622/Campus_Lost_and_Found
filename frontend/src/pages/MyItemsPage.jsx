import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Eye,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { itemsAPI, claimsAPI } from '../utils/api';
import { LoadingSpinner, EmptyState, ConfirmModal } from '../components/common';
import { getCategoryInfo, getLocationInfo, formatDate, formatRelativeTime } from '../utils/constants';
import { toast } from 'react-hot-toast';

const MyItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [itemClaims, setItemClaims] = useState({});
  const [loadingClaims, setLoadingClaims] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const response = await itemsAPI.getMyItems({ limit: 50 });
      setItems(response.data.data.items);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemClaims = async (itemId) => {
    if (itemClaims[itemId]) return;

    setLoadingClaims((prev) => ({ ...prev, [itemId]: true }));
    try {
      const response = await claimsAPI.getItemClaims(itemId);
      setItemClaims((prev) => ({ ...prev, [itemId]: response.data.data.claims }));
    } catch (error) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoadingClaims((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleExpandItem = async (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
      await fetchItemClaims(itemId);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await itemsAPI.delete(deleteModal.itemId);
      setItems((prev) => prev.filter((item) => item._id !== deleteModal.itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteModal({ open: false, itemId: null });
    }
  };

  const handleClaimAction = async (claimId, status, itemId) => {
    try {
      await claimsAPI.updateStatus(claimId, { status });
      toast.success(`Claim ${status} successfully`);
      
      // Refresh claims for this item
      const response = await claimsAPI.getItemClaims(itemId);
      setItemClaims((prev) => ({ ...prev, [itemId]: response.data.data.claims }));
      
      // Refresh items list
      fetchMyItems();
    } catch (error) {
      toast.error(`Failed to ${status} claim`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'lost') return item.type === 'lost';
    if (filter === 'found') return item.type === 'found';
    if (filter === 'active') return item.status === 'active';
    if (filter === 'claimed') return item.status === 'claimed';
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-found',
      claimed: 'badge-pending',
      returned: 'badge-approved',
      expired: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            My Items
          </h1>
          <p className="text-gray-400">
            Manage your posted items and review claims
          </p>
        </div>
        <Link to="/post" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Post New Item
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'lost', 'found', 'active', 'claimed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No items found"
          description={
            items.length === 0
              ? "You haven't posted any items yet. Start by reporting a lost or found item."
              : 'No items match the selected filter.'
          }
          action={
            items.length === 0 && (
              <Link to="/post" className="btn-primary">
                Post Your First Item
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const category = getCategoryInfo(item.category);
            const location = getLocationInfo(item.location);
            const pendingClaims = item.claims?.filter((c) => c.status === 'pending').length || 0;
            const isExpanded = expandedItem === item._id;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                {/* Item Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">{category.icon}</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
                          {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                        </span>
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        {pendingClaims > 0 && (
                          <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            {pendingClaims} pending claim{pendingClaims > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span>{location.icon} {location.label}</span>
                        <span>{formatDate(item.date)}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views} views
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/items/${item._id}`}
                        className="btn-ghost !p-2"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ open: true, itemId: item._id })}
                        className="btn-ghost !p-2 text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expand Claims */}
                  {item.status === 'active' && (
                    <button
                      onClick={() => handleExpandItem(item._id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white transition-colors border-t border-gray-800"
                    >
                      <Users className="w-4 h-4" />
                      View Claims ({item.claims?.length || 0})
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Claims Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-800 bg-gray-900/50"
                    >
                      <div className="p-4 sm:p-6">
                        {loadingClaims[item._id] ? (
                          <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : itemClaims[item._id]?.length > 0 ? (
                          <div className="space-y-4">
                            {itemClaims[item._id].map((claim) => (
                              <div
                                key={claim._id}
                                className="glass-card p-4 border border-gray-700"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-white">
                                        {claim.claimant?.name?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">
                                        {claim.claimant?.name}
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {claim.claimant?.email}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatRelativeTime(claim.createdAt)}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`badge ${
                                      claim.status === 'pending'
                                        ? 'badge-pending'
                                        : claim.status === 'approved'
                                        ? 'badge-approved'
                                        : 'badge-rejected'
                                    }`}
                                  >
                                    {claim.status}
                                  </span>
                                </div>

                                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-sm text-gray-300">
                                    {claim.description}
                                  </p>
                                  {claim.verificationAnswer && (
                                    <p className="text-sm text-gray-400 mt-2">
                                      <strong>Verification Answer:</strong>{' '}
                                      {claim.verificationAnswer}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-400 mt-2">
                                    <strong>Contact:</strong> {claim.contactNumber}
                                  </p>
                                </div>

                                {claim.status === 'pending' && (
                                  <div className="flex gap-2 mt-4">
                                    <button
                                      onClick={() =>
                                        handleClaimAction(claim._id, 'approved', item._id)
                                      }
                                      className="btn-primary flex-1 !py-2 flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleClaimAction(claim._id, 'rejected', item._id)
                                      }
                                      className="btn-secondary flex-1 !py-2 flex items-center justify-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No claims yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, itemId: null })}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default MyItemsPage;
