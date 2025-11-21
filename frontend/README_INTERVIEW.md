# TaskBuddy Frontend: File Structure & Interview Guide

This document explains the purpose of each major file/folder in the frontend (`fixed front/`) and provides sample answers to common interview questions about the codebase.

---

## 1. Project Structure Overview

- **public/**: Static assets (e.g., images, icons) served directly.
- **src/**: All source code for the React app.
  - **api/**: API service modules for backend communication.
  - **assets/**: Images, SVGs, and other static resources.
  - **components/**: Reusable UI components (e.g., Navbar, TaskCard).
  - **context/**: React Context providers (e.g., AuthContext for authentication state).
  - **hooks/**: Custom React hooks (e.g., useAuth).
  - **lib/**: Third-party library wrappers (e.g., axios config).
  - **pages/**: Top-level route components (e.g., Dashboard, TaskList).
  - **utils/**: Utility/helper functions (e.g., apiUtils, badgeUtils).

---

## 2. Key Files & Their Purpose

### `src/api/`
- **Purpose:** Encapsulate all backend API calls (auth, user, task, project, etc.)
- **Interview Q:** Why separate API logic? 
  - *"It keeps components clean and makes API changes easier to manage in one place."*

### `src/components/`
- **Purpose:** Reusable UI building blocks (e.g., TaskCard, Navbar, Alert).
- **Interview Q:** How do you ensure reusability?
  - *"By making components stateless and using props for data and callbacks."*

### `src/pages/`
- **Purpose:** Route-level components, each representing a page/view (e.g., TaskList, ProjectDetails).
- **Interview Q:** Why separate pages from components?
  - *"Pages handle routing and page-level state, while components are for reusable UI."*

### `src/context/`
- **Purpose:** Manage global state (e.g., authentication) using React Context API.
- **Interview Q:** When do you use context vs. props?
  - *"Context is for global state needed by many components, props are for parent-child data flow."*

### `src/hooks/`
- **Purpose:** Custom React hooks for shared logic (e.g., useAuth).
- **Interview Q:** Why use custom hooks?
  - *"To reuse stateful logic across components without repeating code."*

### `src/utils/`
- **Purpose:** Utility functions for API handling, formatting, roles, notifications, etc.
- **Interview Q:** Why create utility files?
  - *"To keep code DRY and maintainable by centralizing common logic."*

### `src/lib/axios.js`
- **Purpose:** Axios instance with base config for all API calls.
- **Interview Q:** Why use a custom axios instance?
  - *"To set base URL, interceptors, and headers in one place for all requests."*

### `App.jsx`, `main.jsx`
- **Purpose:** App root, routing, and React app bootstrap.
- **Interview Q:** What happens in `App.jsx`?
  - *"It sets up routes, context providers, and global UI like the navbar."*

---

## 3. Common Interview Questions & Answers

**Q: How do you manage state in this app?**
A: "We use React's useState/useEffect for local state, and Context API for global state like authentication."

**Q: How do you handle API errors?**
A: "With utility functions in `apiUtils.js` that standardize error messages and data extraction."

**Q: How do you show notifications?**
A: "We use `toastUtils.js` to show consistent toast messages for success, error, etc., using react-toastify."

**Q: How do you handle user roles and permissions?**
A: "With `roleUtils.js`, which provides functions to check roles and permissions throughout the app."

**Q: How do you keep your codebase maintainable?**
A: "By separating concerns: API logic, UI components, pages, context, and utilities are all in their own folders."

---

## 4. Tips for Explaining the Codebase
- Emphasize separation of concerns and reusability.
- Mention use of utility files for DRY code.
- Highlight use of context and custom hooks for scalable state management.
- Point out that API, UI, and business logic are all modular and easy to test or update.

---

*This guide helps you quickly explain the structure and best practices of the TaskBuddy frontend in interviews.*
