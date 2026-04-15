import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Tag,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Flag,
  MessageSquare,
  CheckCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import { itemsAPI, claimsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, Modal } from '../components/common';
import { getCategoryInfo, getLocationInfo, formatDate, formatRelativeTime } from '../utils/constants';
import { toast } from 'react-hot-toast';

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [claimForm, setClaimForm] = useState({
    description: '',
    verificationAnswer: '',
    contactNumber: '',
  });

  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getOne(id);
      setItem(response.data.data.item);
    } catch (error) {
      toast.error('Item not found');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to claim this item');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('itemId', id);
      formData.append('description', claimForm.description);
      formData.append('verificationAnswer', claimForm.verificationAnswer);
      formData.append('contactNumber', claimForm.contactNumber);

      await claimsAPI.create(formData);
      toast.success('Claim submitted successfully!');
      setShowClaimModal(false);
      setClaimForm({ description: '', verificationAnswer: '', contactNumber: '' });
      fetchItem();
    } catch (error) {
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSubmitting(true);
    try {
      await itemsAPI.report(id, reportReason);
      toast.success('Item reported successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      toast.error(error.message || 'Failed to report item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!item) return null;

  const category = getCategoryInfo(item.category);
  const location = getLocationInfo(item.location);
  const isOwner = user && item.postedBy?._id === user.id;
  const hasUserClaimed = item.claims?.some(
    (claim) => claim.claimant?._id === user?.id && claim.status !== 'cancelled'
  );

  return (
    <div className="page-container">
      {/* Back Button */}
      <Link
        to="/items"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Items
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 mb-4">
            {item.images && item.images.length > 0 ? (
              <>
                <img
                  src={item.images[currentImageIndex].url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? item.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev === item.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">{category.icon}</span>
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-4 left-4">
              <span className={`text-lg ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </span>
            </div>

            {/* Status Badge */}
            {item.status !== 'active' && (
              <div className="absolute top-4 right-4">
                <span className="badge bg-gray-800 text-gray-300 border border-gray-700">
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? 'border-primary-500'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column - Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Title & Meta */}
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {item.title}
            </h1>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="category-badge">
                <Tag className="w-4 h-4 mr-1" />
                {category.label}
              </span>
              <span className="location-badge">
                <MapPin className="w-4 h-4 mr-1" />
                {location.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(item.date)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {item.views} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{item.description}</p>

            {/* Additional Details */}
            <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
              {item.color && (
                <div>
                  <span className="text-sm text-gray-500">Color</span>
                  <p className="text-gray-300">{item.color}</p>
                </div>
              )}
              {item.brand && (
                <div>
                  <span className="text-sm text-gray-500">Brand</span>
                  <p className="text-gray-300">{item.brand}</p>
                </div>
              )}
              {item.locationDetails && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Location Details</span>
                  <p className="text-gray-300">{item.locationDetails}</p>
                </div>
              )}
              {item.identifyingFeatures && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Identifying Features</span>
                  <p className="text-gray-300">{item.identifyingFeatures}</p>
                </div>
              )}
            </div>
          </div>

          {/* Posted By */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Posted By</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {item.postedBy?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-white">{item.postedBy?.name}</p>
                {item.postedBy?.department && (
                  <p className="text-sm text-gray-400">{item.postedBy.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Verification Question */}
          {item.verificationQuestion && (
            <div className="glass-card p-6 border-l-4 border-primary-500">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary-400" />
                Verification Required
              </h2>
              <p className="text-gray-300 text-sm">
                To claim this item, you'll need to answer a verification question set by the poster.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {item.status === 'active' && !isOwner && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please login to claim this item');
                    navigate('/login');
                    return;
                  }
                  if (hasUserClaimed) {
                    toast.error('You have already claimed this item');
                    return;
                  }
                  setShowClaimModal(true);
                }}
                disabled={hasUserClaimed}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {hasUserClaimed ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Claim Submitted
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Claim This Item
                  </>
                )}
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Flag className="w-5 h-5" />
                Report
              </button>
            )}

            {isOwner && (
              <Link
                to={`/my-items`}
                className="btn-primary flex-1 text-center"
              >
                Manage Item
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Claim Modal */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="Claim This Item"
        size="md"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div>
            <label className="input-label">
              Why do you think this is your item? *
            </label>
            <textarea
              value={claimForm.description}
              onChange={(e) =>
                setClaimForm({ ...claimForm, description: e.target.value })
              }
              placeholder="Describe why you believe this item belongs to you..."
              required
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {item.verificationQuestion && (
            <div>
              <label className="input-label">
                Verification Question: {item.verificationQuestion} *
              </label>
              <input
                type="text"
                value={claimForm.verificationAnswer}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, verificationAnswer: e.target.value })
                }
                placeholder="Your answer..."
                required
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="input-label">Contact Number *</label>
            <input
              type="tel"
              value={claimForm.contactNumber}
              onChange={(e) =>
                setClaimForm({ ...claimForm, contactNumber: e.target.value })
              }
              placeholder="10-digit phone number"
              required
              maxLength={10}
              pattern="[0-9]{10}"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowClaimModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Please provide a reason for reporting this item. Our team will review it.
          </p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason for reporting..."
            rows={3}
            className="input-field resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowReportModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              disabled={submitting}
              className="btn-primary flex-1 !from-red-600 !to-red-500"
            >
              {submitting ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemDetailPage;
