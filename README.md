# Command Gateway - Frontend

Modern React + TypeScript web interface for the Command Gateway API. Built for the Unbound Hackathon with a clean, professional UI.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5178 (or whatever port Vite assigns)

**Shared API Key for Demo:** `HnXVX7endKivrmVLnigm6i7RAPwBIGY85yDVSAd96Nec9XsPYIYavqIlC1tORf2I`

## ✨ Features

### Authentication & User Management
- 🔐 **API Key Authentication**: Simple login with API key
- 👤 **User Profiles**: View username, role, and credits
- 🔄 **Auto-Login**: Uses shared API key for easy demo access

### Member Features
- 💻 **Command Submission**: Submit commands for execution
- 📊 **Real-time Stats Dashboard**: 
  - Current credits balance
  - Total commands submitted
  - Executed vs rejected counts
  - Pending approval count
- 📜 **Command History**: View all submitted commands with status
- 🔔 **Approval Notifications**: Real-time alerts when commands are approved/rejected
- ⏳ **Pending Alerts**: Banner showing commands waiting for approval
- 🔄 **Auto-refresh**: Commands update every 5 seconds

### Admin Features
- 👥 **User Management**:
  - Create new users (admin/member roles)
  - View all users with stats
  - Manage user credits
  - Display API keys for new users
  
- 📜 **Rule Management**:
  - Create rules with regex patterns
  - Set actions: AUTO_ACCEPT, AUTO_REJECT, REQUIRE_APPROVAL
  - Configure priority levels
  - Delete rules
  - ⚠️ **Conflict Detection** (Bonus): Visual warnings for conflicting rules
  
- ✅ **Approval Queue** (Bonus Feature):
  - View all pending approval requests
  - Approve or reject commands
  - See command details and requester info
  - 🔔 Badge counter showing pending approvals
  - ⚠️ Alert banner for waiting approvals
  - ✅ Success notifications on approval actions
  - 🔄 Auto-refresh every 10 seconds
  
- 📝 **Audit Logs**:
  - Complete history of all actions
  - User activity tracking
  - Rule changes and command executions
  - Timestamped entries

### UI/UX Features
- 🎨 **Modern Design**: Clean white background with black text
- 📱 **Responsive Layout**: Works on all screen sizes
- 🔔 **Real-time Notifications**: Success/error messages with auto-dismiss
- ⚡ **Live Updates**: Auto-refresh for approvals and commands
- 🎯 **Intuitive Navigation**: Tab-based admin dashboard
- 💫 **Smooth Animations**: Professional transitions and effects

## 🛠️ Tech Stack

- **React 19** - Latest React features
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Lightning-fast build tool
- **Tailwind CSS v3.4** - Utility-first styling
- **Axios** - HTTP client for API calls

## 🎁 Bonus Features Implemented

1. ✅ **REQUIRE_APPROVAL with Notifications**: 
   - Full approval workflow UI
   - Real-time notifications for members and admins
   - Auto-refresh for instant updates
   - Badge counters and alert banners

2. ✅ **Rule Conflict Detection**:
   - Visual conflict warnings in Rules tab
   - Detailed conflict information
   - Shows which rules conflict and why

3. ✅ **Deployed to Cloud**: 
   - Live on Vercel
   - Production-ready configuration
   - Environment variable support

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.tsx           # Login page with API key input
│   ├── Header.tsx          # App header with logout
│   ├── MemberDashboard.tsx # Member view with notifications
│   └── AdminDashboard.tsx  # Admin view with all features
├── api.ts                  # API client and type definitions
├── AuthContext.tsx         # Authentication state management
├── App.tsx                 # Main app router
└── main.tsx               # Entry point
```

## 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000  # For local development
# VITE_API_URL=https://comman-gateway-be.onrender.com  # For production
```

## 🎬 Demo Features

Perfect for your hackathon video demo:

1. **Login Flow**: Show shared API key login
2. **Member View**: 
   - Submit a safe command (auto-approved)
   - Submit a dangerous command (auto-rejected)
   - Submit a command requiring approval
   - Show pending approval notification
3. **Admin View**:
   - See pending approval in Approvals tab
   - Approve the command
   - Show success notification
4. **Member Notification**: Switch back to show approval notification
5. **Rule Conflict**: Create duplicate rule to show conflict detection
6. **Audit Logs**: Show complete activity trail

## 🚀 Deployment

Deployed on Vercel:
- Automatic deployments on git push
- Environment variables configured in Vercel dashboard
- Production URL: Check Vercel dashboard

## 📸 Screenshots

### Member Dashboard
- Clean stats cards showing credits and command counts
- Command submission form
- Command history table with status badges
- Real-time approval notifications

### Admin Dashboard
- Tabbed interface: Commands, Users, Rules, Approvals, Audit
- User creation with API key display
- Rule management with conflict detection
- Approval queue with action buttons
- Complete audit trail
