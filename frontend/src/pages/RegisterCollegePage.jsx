import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Lock,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { collegesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const RegisterCollegePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    // College Details
    name: '',
    shortName: '',
    email: '',
    phone: '',
    website: '',
    // Address
    street: '',
    city: '',
    state: '',
    pincode: '',
    // Admin Details
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => setLogo(files[0]),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.svg'] },
    maxSize: 2 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.shortName || !formData.email) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.city || !formData.state) {
      toast.error('City and State are required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      toast.error('Please fill in all admin details');
      return false;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('shortName', formData.shortName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('website', formData.website);
      data.append('address[street]', formData.street);
      data.append('address[city]', formData.city);
      data.append('address[state]', formData.state);
      data.append('address[pincode]', formData.pincode);
      data.append('adminName', formData.adminName);
      data.append('adminEmail', formData.adminEmail);
      data.append('adminPassword', formData.adminPassword);
      if (logo) data.append('logo', logo);

      const response = await collegesAPI.register(data);
      
      // Auto login
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('selectedCollege', JSON.stringify(response.data.data.college));
      updateUser(response.data.data.user);

      toast.success('College registered successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Register Your College
            </h1>
            <p className="text-gray-400">
              Bring Lost & Found to your campus
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      step > s ? 'bg-primary-500' : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: College Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  College Details
                </h2>

                <div>
                  <label className="input-label">College Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Indian Institute of Technology Delhi"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Short Name / Code *</label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="IITD"
                    maxLength={10}
                    className="input-field uppercase"
                  />
                </div>

                <div>
                  <label className="input-label">College Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@iitd.ac.in"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="011-26591999"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://iitd.ac.in"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="input-label">College Logo</label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {logo ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={URL.createObjectURL(logo)}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain"
                        />
                        <span className="text-gray-300">{logo.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">Drop logo here or click to upload</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  College Address
                </h2>

                <div>
                  <label className="input-label">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Hauz Khas"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New Delhi"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Delhi"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110016"
                    maxLength={6}
                    className="input-field"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Admin Account */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Admin Account
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  This will be your admin account to manage the college
                </p>

                <div>
                  <label className="input-label">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Your Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="admin@iitd.ac.in"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
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
                      Register College
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterCollegePage;
