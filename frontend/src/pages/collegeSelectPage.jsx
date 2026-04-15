import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, Users, ArrowRight, Plus } from 'lucide-react';
import { collegesAPI } from '../utils/api';
import { LoadingSpinner } from '../components/common';
import { toast } from 'react-hot-toast';

const CollegeSelectPage = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredColleges, setFilteredColleges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = colleges.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.shortName.toLowerCase().includes(search.toLowerCase()) ||
          c.address?.city?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(colleges);
    }
  }, [search, colleges]);

  const fetchColleges = async () => {
    try {
      const response = await collegesAPI.getAll();
      setColleges(response.data.data.colleges);
      setFilteredColleges(response.data.data.colleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast.error('Failed to load colleges. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCollege = (college) => {
    localStorage.setItem('selectedCollege', JSON.stringify(college));
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
              🎓 Multi-Campus Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Campus <span className="gradient-text">Lost & Found</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Select your college to find lost items or report found ones.
              Connecting students across campuses.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your college..."
                className="input-field pl-12 py-4 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Colleges Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredColleges.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college, index) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectCollege(college)}
                  className="glass-card-hover p-6 cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-shadow">
                      {college.logo?.url ? (
                        <img
                          src={college.logo.url}
                          alt={college.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-primary-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-white text-lg mb-1 group-hover:text-primary-400 transition-colors">
                        {college.name}
                      </h3>
                      <p className="text-sm text-primary-400 font-medium mb-2">
                        {college.shortName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {college.address?.city}, {college.address?.state}
                        </span>
                      </div>
                      {college.stats && (
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {college.stats.totalUsers} users
                          </span>
                          <span>{college.stats.totalItems} items</span>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No colleges found
              </h3>
              <p className="text-gray-400">
                {search ? 'Try a different search term' : 'No colleges registered yet'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Register College CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Don't see your college?
            </h2>
            <p className="text-gray-400 mb-6">
              Register your college and bring Lost & Found to your campus
            </p>
            <Link
              to="/register-college"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Register Your College
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollegeSelectPage;
