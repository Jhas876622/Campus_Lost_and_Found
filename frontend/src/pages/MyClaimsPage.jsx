import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Eye,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { claimsAPI } from '../utils/api';
import { LoadingSpinner, EmptyState, ConfirmModal } from '../components/common';
import { getCategoryInfo, formatDate, formatRelativeTime } from '../utils/constants';
import { toast } from 'react-hot-toast';

const MyClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, claimId: null });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      const response = await claimsAPI.getMyClaims({ limit: 50 });
      setClaims(response.data.data.claims);
    } catch (error) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClaim = async () => {
    try {
      await claimsAPI.cancel(cancelModal.claimId);
      setClaims((prev) =>
        prev.map((claim) =>
          claim._id === cancelModal.claimId
            ? { ...claim, status: 'cancelled' }
            : claim
        )
      );
      toast.success('Claim cancelled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel claim');
    } finally {
      setCancelModal({ open: false, claimId: null });
    }
  };

  const filteredClaims = claims.filter((claim) => {
    if (filter === 'all') return true;
    return claim.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    };
    return badges[status] || badges.pending;
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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          My Claims
        </h1>
        <p className="text-gray-400">
          Track the status of items you've claimed
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((f) => (
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

      {filteredClaims.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No claims found"
          description={
            claims.length === 0
              ? "You haven't claimed any items yet. Browse items to find what you've lost."
              : 'No claims match the selected filter.'
          }
          action={
            claims.length === 0 && (
              <Link to="/items" className="btn-primary">
                Browse Items
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim, index) => {
            const item = claim.item;
            const category = item ? getCategoryInfo(item.category) : null;

            return (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  {/* Item Image */}
                  <Link
                    to={`/items/${item?._id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {item?.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">{category?.icon || '📦'}</span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`badge ${getStatusBadge(claim.status)}`}>
                        {getStatusIcon(claim.status)}
                        <span className="ml-1">{claim.status}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Claimed {formatRelativeTime(claim.createdAt)}
                      </span>
                    </div>

                    <Link
                      to={`/items/${item?._id}`}
                      className="text-lg font-semibold text-white hover:text-primary-400 transition-colors block truncate"
                    >
                      {item?.title || 'Item Deleted'}
                    </Link>

                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {claim.description}
                    </p>

                    {/* Contact info for approved claims */}
                    {claim.status === 'approved' && item?.postedBy && (
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm font-medium text-green-400 mb-2">
                          🎉 Your claim has been approved!
                        </p>
                        <p className="text-sm text-gray-300">
                          Contact the item owner to arrange pickup:
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-gray-400">
                          <p>
                            <strong>Name:</strong> {item.postedBy.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {item.postedBy.email}
                          </p>
                        </div>
                        {claim.meetupLocation && (
                          <p className="text-sm text-gray-400 mt-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {claim.meetupLocation}
                          </p>
                        )}
                        {claim.meetupTime && (
                          <p className="text-sm text-gray-400">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(claim.meetupTime)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Rejection reason */}
                    {claim.status === 'rejected' && claim.reviewNotes && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400">
                          <strong>Reason:</strong> {claim.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/items/${item?._id}`}
                      className="btn-ghost !p-2"
                      title="View Item"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    {claim.status === 'pending' && (
                      <button
                        onClick={() =>
                          setCancelModal({ open: true, claimId: claim._id })
                        }
                        className="btn-ghost !p-2 text-red-400 hover:bg-red-500/10"
                        title="Cancel Claim"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, claimId: null })}
        onConfirm={handleCancelClaim}
        title="Cancel Claim"
        message="Are you sure you want to cancel this claim? You can submit a new claim later if needed."
        confirmText="Cancel Claim"
        danger
      />
    </div>
  );
};

export default MyClaimsPage;
