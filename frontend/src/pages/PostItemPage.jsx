import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { itemsAPI } from '../utils/api';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import { toast } from 'react-hot-toast';

const PostItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: '',
    location: '',
    locationDetails: '',
    date: new Date().toISOString().split('T')[0],
    color: '',
    brand: '',
    identifyingFeatures: '',
    verificationQuestion: '',
    verificationAnswer: '',
  });

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    if (images.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  });

  const removeImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.location) {
      toast.error('Please select a location');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      // Append images
      images.forEach((img) => {
        data.append('images', img.file);
      });

      const response = await itemsAPI.create(data);
      toast.success('Item posted successfully!');
      
      // BUG-I FIX: Revoke object URLs before navigating away to prevent memory leaks
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      
      navigate(`/items/${response.data.data.item._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Report an Item
        </h1>
        <p className="text-gray-400 mb-8">
          Fill in the details below to report a lost or found item
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <div className="glass-card p-6">
            <label className="input-label">What are you reporting? *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'lost' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'lost'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-3xl mb-2 block">🔴</span>
                <span className="font-medium text-white">I Lost Something</span>
                <p className="text-xs text-gray-400 mt-1">
                  Report an item you've lost
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'found' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'found'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-3xl mb-2 block">🟢</span>
                <span className="font-medium text-white">I Found Something</span>
                <p className="text-xs text-gray-400 mt-1">
                  Report an item you've found
                </p>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

            <div>
              <label className="input-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Black iPhone 15 Pro"
                required
                maxLength={100}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed description of the item..."
                required
                maxLength={1000}
                rows={4}
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="select-field"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Location *</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="select-field"
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.icon} {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Location Details</label>
              <input
                type="text"
                name="locationDetails"
                value={formData.locationDetails}
                onChange={handleChange}
                placeholder="e.g., Near the water cooler on 2nd floor"
                maxLength={200}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">
                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., Space Black"
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Apple"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Identifying Features</label>
              <textarea
                name="identifyingFeatures"
                value={formData.identifyingFeatures}
                onChange={handleChange}
                placeholder="Any unique marks, scratches, stickers, etc."
                maxLength={500}
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Images */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Photos
              <span className="text-sm text-gray-400 font-normal ml-2">
                (Optional, max 5)
              </span>
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG, GIF, WebP • Max 5MB each
              </p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification (for found items) */}
          {formData.type === 'found' && (
            <div className="glass-card p-6 space-y-4 border-l-4 border-primary-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Verification Question
                  </h2>
                  <p className="text-sm text-gray-400">
                    Set a question that only the true owner would know the answer to
                  </p>
                </div>
              </div>

              <div>
                <label className="input-label">Question</label>
                <input
                  type="text"
                  name="verificationQuestion"
                  value={formData.verificationQuestion}
                  onChange={handleChange}
                  placeholder="e.g., What's the wallpaper on this phone?"
                  maxLength={200}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Expected Answer</label>
                <input
                  type="text"
                  name="verificationAnswer"
                  value={formData.verificationAnswer}
                  onChange={handleChange}
                  placeholder="The correct answer"
                  maxLength={200}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will not be shown publicly
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                images.forEach((img) => URL.revokeObjectURL(img.preview));
                navigate(-1);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Post Item
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PostItemPage;
