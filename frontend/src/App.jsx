// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProjectList from "./pages/ProjectList";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectEdit from "./pages/ProjectEdit";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectAssignments from "./pages/ProjectAssignments";
import TaskAssignmentManager from "./pages/TaskAssignmentManager";
import TaskList from "./pages/TaskList";
import TaskCreate from "./pages/TaskCreate";
import TaskEdit from "./pages/TaskEdit";
import TaskDetails from "./pages/TaskDetails";
import MemberList from "./pages/MemberList";
import NotificationPage from "./pages/NotificationPage";
import InvitePage from "./pages/InvitePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import StatusCheck from "./pages/StatusCheck";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Navbar />
          <ErrorBoundary>
            <Routes>
          <Route path="/status" element={<StatusCheck />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><ProjectList /></PrivateRoute>} />
          <Route path="/projects/create" element={<PrivateRoute><ProjectCreate /></PrivateRoute>} />
          <Route path="/projects/:id/edit" element={<PrivateRoute><ProjectEdit /></PrivateRoute>} />
          <Route path="/projects/:id/assignments" element={<PrivateRoute><ProjectAssignments /></PrivateRoute>} />
          <Route path="/projects/:id/tasks/assignments" element={<PrivateRoute><TaskAssignmentManager /></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
          <Route path="/projects/:projectId/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
          <Route path="/projects/:projectId/tasks/create" element={<PrivateRoute><TaskCreate /></PrivateRoute>} />
          <Route path="/projects/:projectId/tasks/:id" element={<PrivateRoute><TaskDetails /></PrivateRoute>} />
          <Route path="/projects/:projectId/tasks/:taskId/edit" element={<PrivateRoute><TaskEdit /></PrivateRoute>} />
          <Route path="/projects/:projectId/members" element={<PrivateRoute><MemberList /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
          <Route path="/invites" element={<PrivateRoute><InvitePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        </Routes>
        </ErrorBoundary>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
