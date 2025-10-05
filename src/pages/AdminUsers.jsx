import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import * as d3 from 'd3';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
  });
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const toast = useToast();
  const chartRef = useRef(null);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [pagination.currentPage, search, sortBy, sortOrder]);

  useEffect(() => {
    if (stats?.userGrowth) {
      renderChart();
    }
  }, [stats]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers({
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        sortBy,
        sortOrder,
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleToggleSuperAdmin = async (userId, currentValue) => {
    if (!confirm(`Are you sure you want to ${currentValue ? 'remove' : 'grant'} super admin privileges?`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { isSuperAdmin: !currentValue });
      toast.success('User updated successfully');
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      await loadUsers();
      await loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRevokeSessions = async (userId, username) => {
    if (!confirm(`Revoke all sessions for "${username}"?`)) {
      return;
    }

    try {
      await adminAPI.revokeUserSessions(userId);
      toast.success('All sessions revoked');
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  const renderChart = () => {
    if (!chartRef.current || !stats?.userGrowth) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const data = stats.userGrowth;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and values
    const parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
    const formattedData = data.map(d => ({
      date: parseDate(d.month) || new Date(d.month),
      count: d.count
    }));

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.count) || 10])
      .nice()
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Area generator
    const area = d3.area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0);

    // Add area
    svg.append('path')
      .datum(formattedData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Add line
    svg.append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(formattedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.count))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2);

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .style('color', '#94a3b8');

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .style('color', '#94a3b8');

    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#94a3b8')
      .text('New Users');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">User Management</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.stats.totalUsers}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Active (30d)</p>
            <p className="text-2xl font-bold text-green-400">{stats.stats.activeUsers}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Verified</p>
            <p className="text-2xl font-bold text-blue-400">{stats.stats.verifiedUsers}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Unverified</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.stats.unverifiedUsers}</p>
          </div>
        </div>
      )}

      {/* User Growth Chart */}
      {stats?.userGrowth && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Growth (Last 12 Months)</h2>
          <div ref={chartRef} className="w-full"></div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="lastLogin">Last Login</option>
            <option value="username">Username</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-slate-400">{user.displayName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">
                      {user.emails.find(e => e.isPrimary)?.address || 'No email'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {user.isSuperAdmin && (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Admin</span>
                      )}
                      {user.emails.some(e => e.verifiedAt) ? (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Verified</span>
                      ) : (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleSuperAdmin(user.id, user.isSuperAdmin)}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        {user.isSuperAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleRevokeSessions(user.id, user.username)}
                        className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded"
                      >
                        Revoke Sessions
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-700">
          <div className="text-sm text-slate-400">
            Showing {users.length} of {pagination.totalCount} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPreviousPage}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-white">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
