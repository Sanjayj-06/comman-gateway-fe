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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commandsRes, statsRes] = await Promise.all([
        api.getUserCommands(),
        api.getUserStats(),
      ]);
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
      executed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-blue-100 text-blue-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Member Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.username}!</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Credits</div>
            <div className="text-2xl font-bold text-blue-600">{stats.credits}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Commands</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total_commands}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Executed</div>
            <div className="text-2xl font-bold text-green-600">{stats.executed_commands}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected_commands}</div>
          </div>
        </div>
      )}

      {/* Submit Command Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Submit Command</h2>
        <form onSubmit={handleSubmitCommand}>
          <div className="mb-4">
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter command (e.g., ls -la)"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (stats?.credits ?? 0) <= 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Command'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Command History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Command History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Command</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Credits</th>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((cmd) => (
                <tr key={cmd.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-sm">{cmd.command_text}</td>
                  <td className="py-2">{getStatusBadge(cmd.status)}</td>
                  <td className="py-2">{cmd.credits_deducted}</td>
                  <td className="py-2 text-sm text-gray-600">
                    {new Date(cmd.submitted_at).toLocaleString()}
                  </td>
                  <td className="py-2 text-sm text-gray-600 max-w-xs truncate">
                    {cmd.result || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {commands.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No commands yet. Submit your first command above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
