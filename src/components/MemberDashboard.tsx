import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Command, UserStats } from '../api';
import { useAuth } from '../AuthContext';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [commandText, setCommandText] = useState('');
  const [commands, setCommands] = useState<Command[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previousCommands, setPreviousCommands] = useState<Command[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

 
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (previousCommands.length > 0) {
      commands.forEach(cmd => {
        const prevCmd = previousCommands.find(pc => pc.id === cmd.id);
        if (prevCmd && prevCmd.status === 'pending_approval') {
          if (cmd.status === 'executed') {
            setMessage({ type: 'success', text: `✅ Your command "${cmd.command_text.substring(0, 30)}..." was approved and executed!` });
          } else if (cmd.status === 'rejected') {
            setMessage({ type: 'error', text: `❌ Your command "${cmd.command_text.substring(0, 30)}..." was rejected.` });
          }
        }
      });
    }
  }, [commands]);

  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchData = async () => {
    try {
      const [commandsRes, statsRes] = await Promise.all([
        api.getUserCommands(),
        api.getUserStats(),
      ]);
      setPreviousCommands(commands);
      setCommands(commandsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.submitCommand(commandText);
      const newCommand = response.data;
      
      setCommands([newCommand, ...commands]);
      setCommandText('');
      
      if (newCommand.status === 'executed') {
        setMessage({ type: 'success', text: 'Command executed successfully!' });
        if (stats) {
          setStats({ ...stats, credits: stats.credits - 1, executed_commands: stats.executed_commands + 1, total_commands: stats.total_commands + 1 });
        }
      } else if (newCommand.status === 'rejected') {
        setMessage({ type: 'error', text: `Command rejected: ${newCommand.result}` });
        if (stats) {
          setStats({ ...stats, rejected_commands: stats.rejected_commands + 1, total_commands: stats.total_commands + 1 });
        }
      }
      
      fetchData(); // Refresh data
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to submit command' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Command['status']) => {
    const styles = {
      executed: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
      accepted: 'bg-blue-100 text-blue-800 border border-blue-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Member Dashboard</h1>
        <p className="text-gray-600 text-lg mt-2">Welcome, <span className="text-gray-900 font-semibold">{user?.username}</span>!</p>
      </div>

      {/* Message/Notification Banner */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-800' 
            : 'bg-red-50 border-red-500 text-red-800'
        } flex items-center justify-between`}>
          <span className="font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending Approvals Alert */}
      {commands.filter(cmd => cmd.status === 'pending_approval').length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 flex items-center">
          <svg className="h-5 w-5 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-yellow-800 font-medium">
            {commands.filter(cmd => cmd.status === 'pending_approval').length} command{commands.filter(cmd => cmd.status === 'pending_approval').length > 1 ? 's' : ''} waiting for approval
          </span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-xl border border-blue-200">
            <div className="text-sm text-blue-700 font-semibold uppercase tracking-wider mb-2">Credits</div>
            <div className="text-4xl font-bold text-blue-600">{stats.credits}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-xl border border-gray-200">
            <div className="text-sm text-gray-700 font-semibold uppercase tracking-wider mb-2">Total Commands</div>
            <div className="text-4xl font-bold text-gray-900">{stats.total_commands}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-xl border border-green-200">
            <div className="text-sm text-green-700 font-semibold uppercase tracking-wider mb-2">Executed</div>
            <div className="text-4xl font-bold text-green-600">{stats.executed_commands}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-xl border border-red-200">
            <div className="text-sm text-red-700 font-semibold uppercase tracking-wider mb-2">Rejected</div>
            <div className="text-4xl font-bold text-red-600">{stats.rejected_commands}</div>
          </div>
        </div>
      )}

      {/* Submit Command Form */}
      <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Submit Command</h2>
        <form onSubmit={handleSubmitCommand}>
          <div className="mb-6">
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-lg"
              placeholder="Enter command (e.g., ls -la)"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (stats?.credits ?? 0) <= 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg transition-all text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Command'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-6 p-4 rounded-xl font-semibold ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-300' 
              : 'bg-red-50 text-red-700 border border-red-300'
          }`}>
            {message.type === 'error' ? '⚠️ ' : '✓ '}{message.text}
          </div>
        )}
      </div>

      {/* Command History */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Command History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Command</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Credits</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Time</th>
                <th className="text-left py-4 px-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((cmd) => (
                <tr key={cmd.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm text-gray-900 bg-gray-50 rounded px-3 py-2">{cmd.command_text}</td>
                  <td className="py-4 px-4">{getStatusBadge(cmd.status)}</td>
                  <td className="py-4 px-4 text-gray-900 font-semibold">{cmd.credits_deducted}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(cmd.submitted_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {cmd.result || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {commands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No commands yet. Submit your first command above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
