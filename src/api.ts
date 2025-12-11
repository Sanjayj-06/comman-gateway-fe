import axios from 'axios';

const API_BASE_URL = "https://comman-gateway-be.onrender.com";
const SHARED_API_KEY = 'HnXVX7endKivrmVLnigm6i7RAPwBIGY85yDVSAd96Nec9XsPYIYavqIlC1tORf2I';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('apiKey') || SHARED_API_KEY;
  config.headers['X-API-Key'] = apiKey;
  return config;
});

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'member';
  credits: number;
  created_at: string;
}

export interface UserWithApiKey extends User {
  api_key: string;
}

export interface UserStats {
  credits: number;
  total_commands: number;
  executed_commands: number;
  rejected_commands: number;
}

export interface Rule {
  id: number;
  pattern: string;
  action: 'AUTO_ACCEPT' | 'AUTO_REJECT' | 'REQUIRE_APPROVAL';
  description?: string;
  priority: number;
  created_at: string;
  created_by?: number;
}

export interface Command {
  id: number;
  command_text: string;
  status: 'accepted' | 'rejected' | 'executed' | 'pending_approval';
  credits_deducted: number;
  result?: string;
  submitted_at: string;
  executed_at?: string;
  rule_id?: number;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details?: string;
  timestamp: string;
  username?: string;
}

export interface ApprovalRequest {
  id: number;
  command_id: number;
  command_text: string;
  requested_by: number;
  requester_username: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  approved_by?: number;
  approver_username?: string;
}

// API functions
export const api = {
  // Auth & User
  getCurrentUser: () => apiClient.get<User>('/users/me'),
  getUserStats: () => apiClient.get<UserStats>('/users/me/stats'),
  getUserCommands: (limit = 50) => apiClient.get<Command[]>(`/users/me/commands?limit=${limit}`),
  
  // Admin - Users
  createUser: (username: string, role: 'admin' | 'member') => 
    apiClient.post<UserWithApiKey>('/users/', { username, role }),
  listUsers: () => apiClient.get<User[]>('/users/'),
  updateUserCredits: (userId: number, credits: number) => 
    apiClient.patch(`/users/${userId}/credits`, { credits }),
  
  // Rules
  listRules: () => apiClient.get<Rule[]>('/rules/'),
  createRule: (rule: Omit<Rule, 'id' | 'created_at' | 'created_by'>) => 
    apiClient.post<Rule>('/rules/', rule),
  updateRule: (id: number, rule: Partial<Omit<Rule, 'id' | 'created_at' | 'created_by'>>) => 
    apiClient.put<Rule>(`/rules/${id}`, rule),
  deleteRule: (id: number) => apiClient.delete(`/rules/${id}`),
  
  // Commands
  submitCommand: (commandText: string) => 
    apiClient.post<Command>('/commands/', { command_text: commandText }),
  listCommands: (limit = 50) => apiClient.get<Command[]>(`/commands/?limit=${limit}`),
  
  // Audit
  getAuditLogs: (limit = 100) => apiClient.get<AuditLog[]>(`/audit/?limit=${limit}`),
  getUserAuditLogs: (userId: number, limit = 100) => 
    apiClient.get<AuditLog[]>(`/audit/user/${userId}?limit=${limit}`),
  
  // Approvals
  listPendingApprovals: () => apiClient.get<ApprovalRequest[]>('/approvals/'),
  reviewApproval: (approvalId: number, action: 'approve' | 'reject', reason?: string) =>
    apiClient.post(`/approvals/${approvalId}/review`, { action, reason }),
};

export default apiClient;
