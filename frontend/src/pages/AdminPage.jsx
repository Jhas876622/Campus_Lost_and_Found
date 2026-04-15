import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Flag,
  TrendingUp,
  Eye,
  Trash2,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import { LoadingSpinner, ConfirmModal } from '../components/common';
import { getCategoryInfo, formatDate, formatRelativeTime } from '../utils/constants';
import { toast } from 'react-hot-toast';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [actionModal, setActionModal] = useState({
    open: false,
    type: '',
    id: null,
    name: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reports') {
      fetchReportedItems();
    }
  }, [activeTab, pagination.page]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page: pagination.page,
        limit: 10,
        search: userSearch,
      });
      setUsers(response.data.data.users);
      setPagination({
        page: response.data.data.pagination.page,
        pages: response.data.data.pagination.pages,
      });
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportedItems = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReportedItems({ limit: 50 });
      setReportedItems(response.data.data.items);
    } catch (error) {
      toast.error('Failed to fetch reported items');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async () => {
    try {
      if (actionModal.type === 'role') {
        const newRole = actionModal.currentRole === 'admin' ? 'user' : 'admin';
        await adminAPI.updateUserRole(actionModal.id, newRole);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === actionModal.id ? { ...u, role: newRole } : u
          )
        );
        toast.success(`User role updated to ${newRole}`);
      } else if (actionModal.type === 'delete') {
        await adminAPI.deleteUser(actionModal.id);
        setUsers((prev) => prev.filter((u) => u._id !== actionModal.id));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Action failed');
    } finally {
      setActionModal({ open: false, type: '', id: null, name: '' });
    }
  };

  const handleReportAction = async (itemId, action) => {
    try {
      await adminAPI.handleReport(itemId, action);
      setReportedItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success(
        action === 'remove' ? 'Item removed' : 'Report dismissed'
      );
    } catch (error) {
      toast.error('Failed to handle report');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: Flag },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-400 mb-8">
          Manage users, view statistics, and moderate content
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPagination({ page: 1, pages: 1 });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : dashboard ? (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-primary-400" />
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        +{dashboard.stats?.newUsersToday || 0} today
                      </span>
                    </div>
                    <p className="text-3xl font-display font-bold text-white">
                      {dashboard.stats?.totalUsers || 0}
                    </p>
                    <p className="text-sm text-gray-400">Total Users</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Package className="w-8 h-8 text-accent-400" />
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                        +{dashboard.stats?.newItemsToday || 0} today
                      </span>
                    </div>
                    <p className="text-3xl font-display font-bold text-white">
                      {dashboard.stats?.totalItems || 0}
                    </p>
                    <p className="text-sm text-gray-400">Total Items</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-3xl font-display font-bold text-white">
                      {dashboard.stats?.totalReturned || 0}
                    </p>
                    <p className="text-sm text-gray-400">Items Returned</p>
                  </div>

                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Flag className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-3xl font-display font-bold text-white">
                      {dashboard.stats?.pendingReports || 0}
                    </p>
                    <p className="text-sm text-gray-400">Pending Reports</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {dashboard.recentUsers?.slice(0, 5).map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(user.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Items */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Items
                    </h3>
                    <div className="space-y-3">
                      {dashboard.recentItems?.slice(0, 5).map((item) => {
                        const category = getCategoryInfo(item.category);
                        return (
                          <div
                            key={item._id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <p className="font-medium text-white truncate max-w-[200px]">
                                  {item.title}
                                </p>
                                <span
                                  className={`text-xs ${
                                    item.type === 'lost'
                                      ? 'text-red-400'
                                      : 'text-green-400'
                                  }`}
                                >
                                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search users by name or email..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            User
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Role
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Items
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-400">
                            Joined
                          </th>
                          <th className="text-right p-4 text-sm font-medium text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b border-gray-800/50 hover:bg-gray-800/30"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {user.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`badge ${
                                  user.role === 'admin'
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">
                              {user.itemsCount || 0}
                            </td>
                            <td className="p-4 text-gray-400 text-sm">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      open: true,
                                      type: 'role',
                                      id: user._id,
                                      name: user.name,
                                      currentRole: user.role,
                                    })
                                  }
                                  className="btn-ghost !p-2"
                                  title={
                                    user.role === 'admin'
                                      ? 'Remove Admin'
                                      : 'Make Admin'
                                  }
                                >
                                  {user.role === 'admin' ? (
                                    <ShieldOff className="w-4 h-4 text-yellow-400" />
                                  ) : (
                                    <Shield className="w-4 h-4 text-primary-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      open: true,
                                      type: 'delete',
                                      id: user._id,
                                      name: user.name,
                                    })
                                  }
                                  className="btn-ghost !p-2 text-red-400 hover:bg-red-500/10"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="btn-secondary !p-2 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-gray-400 text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                      className="btn-secondary !p-2 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : reportedItems.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Pending Reports
                </h3>
                <p className="text-gray-400">
                  All reported items have been reviewed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedItems.map((item) => {
                  const category = getCategoryInfo(item.category);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-4 sm:p-6"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge-rejected">
                              <Flag className="w-3 h-3 mr-1" />
                              {item.reports?.length || 0} reports
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-white truncate">
                            {item.title}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1">
                            Posted by {item.postedBy?.name} •{' '}
                            {formatRelativeTime(item.createdAt)}
                          </p>

                          {/* Report Reasons */}
                          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">
                              Report reasons:
                            </p>
                            <div className="space-y-1">
                              {item.reports?.slice(0, 3).map((report, idx) => (
                                <p
                                  key={idx}
                                  className="text-sm text-gray-300"
                                >
                                  • {report.reason}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <a
                            href={`/items/${item._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost !p-2"
                            title="View Item"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleReportAction(item._id, 'dismiss')}
                            className="btn-ghost !p-2 text-green-400 hover:bg-green-500/10"
                            title="Dismiss Report"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReportAction(item._id, 'remove')}
                            className="btn-ghost !p-2 text-red-400 hover:bg-red-500/10"
                            title="Remove Item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal.open}
        onClose={() =>
          setActionModal({ open: false, type: '', id: null, name: '' })
        }
        onConfirm={handleUserAction}
        title={
          actionModal.type === 'role'
            ? 'Change User Role'
            : 'Delete User'
        }
        message={
          actionModal.type === 'role'
            ? `Are you sure you want to ${
                actionModal.currentRole === 'admin' ? 'remove admin rights from' : 'make admin'
              } ${actionModal.name}?`
            : `Are you sure you want to delete ${actionModal.name}? This action cannot be undone.`
        }
        confirmText={actionModal.type === 'role' ? 'Change Role' : 'Delete'}
        danger={actionModal.type === 'delete'}
      />
    </div>
  );
};

export default AdminPage;
