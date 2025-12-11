import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { User, Rule, AuditLog, UserWithApiKey, ApprovalRequest } from '../api';
import MemberDashboard from './MemberDashboard';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commands' | 'users' | 'rules' | 'audit' | 'approvals'>('commands');
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  
 
  const [newUsername, setNewUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');
  const [createdUser, setCreatedUser] = useState<UserWithApiKey | null>(null);
  
  
  const [newRule, setNewRule] = useState({
    pattern: '',
    action: 'AUTO_ACCEPT' as 'AUTO_ACCEPT' | 'AUTO_REJECT' | 'REQUIRE_APPROVAL',
    description: '',
    priority: 1,
  });

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'rules') fetchRules();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'approvals') fetchApprovals();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await api.listUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.listRules();
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.getAuditLogs();
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchApprovals = async () => {
    try {
      const response = await api.listPendingApprovals();
      setApprovals(response.data);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    }
  };

  const handleApprovalAction = async (approvalId: number, action: 'approve' | 'reject') => {
    try {
      await api.reviewApproval(approvalId, action);
      fetchApprovals();
      alert(`Command ${action}d successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.detail || `Failed to ${action} command`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.createUser(newUsername, newUserRole);
      setCreatedUser(response.data);
      setNewUsername('');
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRule(newRule);
      setNewRule({ pattern: '', action: 'AUTO_ACCEPT', description: '', priority: 1 });
      fetchRules();
      alert('Rule created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await api.deleteRule(id);
        fetchRules();
      } catch (error) {
        alert('Failed to delete rule');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        {['commands', 'users', 'rules', 'approvals', 'audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 px-4 font-semibold ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'approvals' && approvals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {approvals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Commands Tab */}
      {activeTab === 'commands' && (
        <div>
          <MemberDashboard />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Create User Form */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
            
            {createdUser && (
              <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                <p className="font-semibold text-green-800 mb-2">User created successfully!</p>
                <p className="text-sm mb-1">Username: {createdUser.username}</p>
                <p className="text-sm mb-2">API Key (save this now!):</p>
                <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
                  {createdUser.api_key}
                </code>
                <button
                  onClick={() => setCreatedUser(null)}
                  className="mt-2 text-sm text-green-700 hover:text-green-900"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Users List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">All Users</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Username</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Credits</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{user.username}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">{user.credits}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div>
          {/* Create Rule Form */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Rule</h2>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pattern (Regex)</label>
                <input
                  type="text"
                  value={newRule.pattern}
                  onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                  placeholder="e.g., ^sudo\s+"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="AUTO_ACCEPT">AUTO_ACCEPT</option>
                    <option value="AUTO_REJECT">AUTO_REJECT</option>
                    <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Rule
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </form>
          </div>

          {/* Rules List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">All Rules</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Priority</th>
                  <th className="text-left py-2">Pattern</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-bold">{rule.priority}</td>
                    <td className="py-2 font-mono text-sm">{rule.pattern}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rule.action === 'AUTO_ACCEPT' ? 'bg-green-100 text-green-800' :
                        rule.action === 'AUTO_REJECT' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-gray-600">{rule.description || '-'}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">{log.username || `User ${log.user_id}`}</td>
                  <td className="py-2 font-semibold">{log.action}</td>
                  <td className="py-2 text-sm text-gray-600 max-w-md truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit logs yet.
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Command</th>
                <th className="text-left py-2">Requested By</th>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-sm">{approval.command_text}</td>
                  <td className="py-2">{approval.requester_username}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {new Date(approval.created_at).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprovalAction(approval.id, 'approve')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalAction(approval.id, 'reject')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {approvals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending approvals.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
