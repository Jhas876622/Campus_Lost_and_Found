import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Eye, Tag } from 'lucide-react';
import { getCategoryInfo, getLocationInfo, formatRelativeTime } from '../../utils/constants';

const ItemCard = ({ item, index = 0 }) => {
  const category = getCategoryInfo(item.category);
  const location = getLocationInfo(item.location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/items/${item._id}`}
        className="block glass-card-hover overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-800">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">{category.icon}</span>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
              {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
            </span>
          </div>

          {/* Views */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-gray-300">
            <Eye className="w-3 h-3" />
            <span>{item.views}</span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-display font-semibold text-white text-lg mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {item.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="category-badge text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {category.label}
            </span>
            <span className="location-badge text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {location.label}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {item.postedBy?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {item.postedBy?.name || 'Anonymous'}
              </span>
            </div>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
