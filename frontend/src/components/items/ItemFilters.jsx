import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { CATEGORIES, LOCATIONS } from '../../utils/constants';

const ItemFilters = ({ filters, onFilterChange, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterClick = (filterType, value) => {
    if (filters[filterType] === value) {
      onFilterChange({ ...filters, [filterType]: '' });
    } else {
      onFilterChange({ ...filters, [filterType]: value });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ type: '', category: '', location: '', search: '' });
  };

  const hasActiveFilters = filters.type || filters.category || filters.location || filters.search;

  return (
    <div className="glass-card p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for items..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary !px-6">
          Search
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`btn-secondary !px-4 flex items-center gap-2 ${isOpen ? 'bg-gray-700' : ''}`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>
      </form>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-800 space-y-4">
              {/* Type Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Type</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterClick('type', 'lost')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === 'lost'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    🔴 Lost
                  </button>
                  <button
                    onClick={() => handleFilterClick('type', 'found')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === 'found'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    🟢 Found
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleFilterClick('category', cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                        filters.category === cat.value
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => handleFilterClick('location', loc.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                        filters.location === loc.value
                          ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span>{loc.icon}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="pt-2">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemFilters;
