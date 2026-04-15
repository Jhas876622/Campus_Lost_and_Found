import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Package,
  Users,
  CheckCircle,
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { itemsAPI } from '../utils/api';
import ItemCard from '../components/items/ItemCard';
import { LoadingSpinner } from '../components/common';
import { CATEGORIES, LOCATIONS } from '../utils/constants';

const HomePage = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const collegeStr = localStorage.getItem('selectedCollege');
      if (!collegeStr) {
        window.location.href = '/select-college';
        return;
      }

      try {
        const [itemsRes, statsRes] = await Promise.all([
          itemsAPI.getAll({ limit: 6, status: 'active' }),
          itemsAPI.getStats(),
        ]);
        setRecentItems(itemsRes.data.data.items);
        setStats(statsRes.data.data.stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Quick Posting',
      description: 'Report lost or found items in seconds with our intuitive interface',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find items easily with category, location, and keyword filters',
    },
    {
      icon: Shield,
      title: 'Verified Claims',
      description: 'Secure verification system prevents false claims',
    },
    {
      icon: Clock,
      title: 'Real-time Alerts',
      description: 'Get notified instantly when matching items are posted',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                🎓 Built for Campus Community
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight"
            >
              Lost Something?{' '}
              <span className="gradient-text">Find It Here</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              The centralized platform for your campus community to report lost items, 
              find belongings, and connect with fellow students. No more WhatsApp chaos!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/items?type=lost" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Browse Lost Items
              </Link>
              <Link to="/post" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Report an Item
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                <div className="glass-card p-6 text-center">
                  <Package className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <div className="text-3xl font-display font-bold text-white">
                    {stats.totalStats?.[0]?.totalItems || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Items</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <Search className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-3xl font-display font-bold text-white">
                    {stats.totalStats?.[0]?.totalLost || 0}
                  </div>
                  <div className="text-sm text-gray-400">Lost Items</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-display font-bold text-white">
                    {stats.totalStats?.[0]?.totalFound || 0}
                  </div>
                  <div className="text-sm text-gray-400">Found Items</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-accent-400 mx-auto mb-2" />
                  <div className="text-3xl font-display font-bold text-white">
                    {stats.totalStats?.[0]?.totalReturned || 0}
                  </div>
                  <div className="text-sm text-gray-400">Items Returned</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We've built the most efficient lost and found system for campus communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-24 relative bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">
                Recent Listings
              </h2>
              <p className="text-gray-400">
                Latest lost and found items posted by the community
              </p>
            </div>
            <Link
              to="/items"
              className="btn-ghost flex items-center gap-2 text-primary-400"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item, index) => (
                <ItemCard key={item._id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No items posted yet. Be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-400">
              Find items faster by searching within specific categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/items?category=${category.value}`}
                  className="glass-card-hover p-6 flex flex-col items-center text-center group"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {category.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Find Your Lost Items?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join our campus community and never lose track of your belongings again
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Free
            </Link>
            <Link to="/items" className="btn-secondary text-lg px-8 py-4">
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
