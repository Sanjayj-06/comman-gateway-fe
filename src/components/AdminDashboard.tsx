import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { User, Rule, AuditLog, UserWithApiKey, ApprovalRequest, ConflictReport } from '../api';
import MemberDashboard from './MemberDashboard';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commands' | 'users' | 'rules' | 'audit' | 'approvals'>('commands');
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [conflicts, setConflicts] = useState<ConflictReport | null>(null);
  
 
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
    if (activeTab === 'rules') {
      fetchRules();
      fetchConflicts();
    }
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

  const fetchConflicts = async () => {
    try {
      const response = await api.checkConflicts();
      setConflicts(response.data);
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-2">
        {['commands', 'users', 'rules', 'approvals', 'audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'approvals' && approvals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full animate-pulse">
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
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                  className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
            
            {createdUser && (
              <div className="mt-6 p-6 bg-green-50 border border-green-300 rounded-xl">
                <p className="font-semibold text-green-700 mb-3 text-lg">✓ User created successfully!</p>
                <p className="text-sm mb-2 text-gray-700">Username: <span className="text-gray-900 font-semibold">{createdUser.username}</span></p>
                <p className="text-sm mb-2 text-gray-700">API Key (save this now!):</p>
                <code className="text-sm bg-white p-3 rounded-lg block overflow-x-auto text-gray-900 border border-gray-200">
                  {createdUser.api_key}
                </code>
                <button
                  onClick={() => setCreatedUser(null)}
                  className="mt-3 text-sm text-green-700 hover:text-green-800 font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Users List */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Username</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Role</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Credits</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-gray-900 font-medium">{user.username}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-green-600 font-semibold">{user.credits}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div>
          {/* Conflict Alert */}
          {conflicts && conflicts.total_conflicts > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800">⚠️ Rule Conflicts Detected</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="mb-2">Found {conflicts.total_conflicts} conflicting rule(s). Rules with the same pattern but different actions may cause unexpected behavior.</p>
                    {conflicts.conflicts.map((conflict, idx) => (
                      <div key={idx} className="mt-2 p-3 bg-white rounded border border-yellow-200">
                        <p className="font-semibold text-gray-900">Rule #{conflict.rule_id}: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{conflict.pattern}</code> ({conflict.action})</p>
                        <p className="text-xs mt-1">Conflicts with:</p>
                        <ul className="ml-4 mt-1 text-xs">
                          {conflict.conflicts_with.map((c, i) => (
                            <li key={i}>• Rule #{c.rule_id}: {c.action} (priority: {c.priority})</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Rule Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Rule</h2>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Pattern (Regex)</label>
                <input
                  type="text"
                  value={newRule.pattern}
                  onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                  placeholder="e.g., ^sudo\s+"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Action</label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="AUTO_ACCEPT">AUTO_ACCEPT</option>
                    <option value="AUTO_REJECT">AUTO_REJECT</option>
                    <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                  <input
                    type="number"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transition-all"
                  >
                    Create Rule
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </form>
          </div>

          {/* Rules List */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">All Rules</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Priority</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Pattern</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Action</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Description</th>
                    <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-blue-600 text-lg">{rule.priority}</td>
                      <td className="py-4 px-4 font-mono text-sm text-gray-900 bg-gray-50 rounded px-3 py-2">{rule.pattern}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rule.action === 'AUTO_ACCEPT' ? 'bg-green-100 text-green-800 border border-green-300' :
                          rule.action === 'AUTO_REJECT' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{rule.description || '-'}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors"
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
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Audit Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Time</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Action</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{log.username || `User ${log.user_id}`}</td>
                    <td className="py-4 px-4 font-semibold text-blue-600">{log.action}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 max-w-md truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No audit logs yet.
            </div>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Pending Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Command</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Requested By</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Time</th>
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-gray-900 bg-gray-50 rounded px-3 py-2">{approval.command_text}</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">{approval.requester_username}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(approval.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprovalAction(approval.id, 'approve')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-semibold shadow-lg transition-all"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(approval.id, 'reject')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-semibold shadow-lg transition-all"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {approvals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pending approvals.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
