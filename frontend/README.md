# TaskBuddy Frontend

A React-based frontend application for the TaskBuddy project management system. Built with React, React Router, Bootstrap, and Axios.

## 🚀 Features

- **Dashboard** - Overview of projects and notifications
- **Project Management** - Create, edit, view, and manage projects
- **Task Management** - Create, edit, and track tasks within projects
- **Member Management** - View project members and their roles
- **Notifications** - Real-time notification system
- **Invitations** - Accept or reject project invitations
- **Authentication** - User login/logout system

## 📦 Dependencies

- **React** - Frontend framework
- **React Router** - Client-side routing
- **Bootstrap** - UI styling framework
- **Axios** - HTTP client for API calls

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- TaskBuddy backend running on `http://localhost:8080`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── api/                    # API service functions
│   ├── auth.js            # Authentication API calls
│   ├── project.js         # Project management API calls
│   ├── task.js            # Task management API calls
│   ├── notification.js    # Notification API calls
│   ├── member.js          # Member management API calls
│   └── invite.js          # Invitation API calls
│
├── components/            # Reusable UI components
│   ├── ProjectCard.jsx    # Project display card
│   ├── TaskCard.jsx       # Task display card
│   ├── MemberCard.jsx     # Member display card
│   ├── NotificationCard.jsx
│   ├── InviteCard.jsx
│   └── Navbar.jsx         # Navigation bar
│
├── context/              # React Context providers
│   └── AuthContext.jsx   # Authentication context
│
├── pages/                # Page components
│   ├── Dashboard.jsx     # Main dashboard
│   ├── ProjectList.jsx   # List all projects
│   ├── ProjectCreate.jsx # Create new project
│   ├── ProjectEdit.jsx   # Edit existing project
│   ├── ProjectDetails.jsx # Project details view
│   ├── TaskList.jsx      # List project tasks
│   ├── TaskCreate.jsx    # Create new task
│   ├── TaskEdit.jsx      # Edit existing task
│   ├── MemberList.jsx    # List project members
│   ├── InvitePage.jsx    # Manage invitations
│   ├── NotificationPage.jsx # View notifications
│   └── Login.jsx         # Login page
│
├── App.jsx               # Main App component with routing
├── main.jsx              # Application entry point
└── index.css             # Global styles
```

## 🔗 API Integration

The frontend connects to your Spring Boot backend running on `http://localhost:8080`. The API endpoints are organized as follows:

- **Projects**: `/projects/*`
- **Tasks**: `/tasks/*`
- **Notifications**: `/notifications/*`
- **Members**: `/projects/{projectId}/members`
- **Invitations**: `/invites/*`

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop and mobile devices
- **Bootstrap Styling** - Clean and professional appearance
- **Loading States** - User feedback during API calls
- **Error Handling** - Graceful error messages
- **Navigation** - Intuitive routing between pages

## 🔐 Authentication

The app uses a simple authentication context that stores user data in localStorage. For production, you should integrate with your backend authentication system.

**Demo Credentials:**
- Manager: `manager@example.com` / `manager`
- User: `user@example.com` / `user`

## 🚦 Getting Started

1. **Start your backend server** (Spring Boot on port 8080)
2. **Install frontend dependencies**: `npm install`
3. **Start the development server**: `npm run dev`
4. **Open the app**: `http://localhost:5173`
5. **Login** with demo credentials
6. **Create projects** and start managing tasks!

## 🔧 Configuration

To change the backend API URL, update the `BASE_URL` constants in the `/api/*.js` files.

## 📝 Notes

- This frontend is designed to work with your existing Spring Boot backend
- All API calls match your backend controller endpoints
- The authentication is currently demo-based - integrate with your backend auth system
- Error handling and loading states are included for better UX
- The design is mobile-responsive using Bootstrap

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the TaskBuddy application suite.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
