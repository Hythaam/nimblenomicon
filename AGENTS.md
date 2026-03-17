---
name: "Modern React Project Template"
description: "A comprehensive development guide for modern frontend projects based on React 18 + TypeScript + Vite, including complete development standards and best practices"
category: "Frontend Framework"
author: "Agents.md Collection"
authorUrl: "https://github.com/gakeez/agents_md_collection"
tags: ["react", "typescript", "vite", "frontend", "spa"]
lastUpdated: "2024-12-19"
---

# Modern React Project Development Guide

## Project Overview

This is a modern frontend project template based on React 18, JavaScript, and Vite. It's suitable for building high-performance Single Page Applications (SPA) with integrated modern development toolchain and best practices.

## Tech Stack

- **Frontend Framework**: React 19 + Javascript v24
- **Build Tool**: Vite
- **Routing**: React Router v7
- **UI Components**: Ant Design / Material-UI
- **Styling**: Tailwind CSS / Styled-components
- **HTTP Client**: Fetch
- **Code Quality**: BiomeJS

## Project Structure

```
react-project/
├── public/                # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common components
│   │   └── ui/            # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom Hooks
│   ├── store/             # State management
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   ├── constants/         # Constants
│   ├── App.jsx
│   └── main.jsx
├── docs/                  # Project documentation
├── .env.example           # Environment variables example
├── package.json
├── vite.config.js
└── README.md
```

## Development Guidelines

### Component Development Standards

1. **Function Components First**: Use function components and Hooks
2. **Component Naming**: Use PascalCase, file name matches component name
3. **Single Responsibility**: Each component handles only one functionality

```jsx
// Example: Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = ({
  variant,
  size = 'medium',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## Environment Setup

### Development Requirements
- Node.js >= 24.0.0
- npm >= 8.0.0

### Installation Steps
```bash
# 1. Create project
npm create vite@latest my-react-app -- --template react

# 2. Navigate to project directory
cd my-react-app

# 3. Install dependencies
npm install

# 4. Install additional dependencies
npm install react-router-dom

# 5. Start development server
npm run dev
```

### Environment Variables Configuration
```env
# .env.local
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=My React App
VITE_ENABLE_MOCK=false
```

## Routing Configuration

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Deployment Configuration

### Build Production Version
```bash
npm run build
```

## Common Issues

### Issue 1: Vite Development Server Slow Startup
**Solution**:
- Check dependency pre-build cache
- Use `npm run dev -- --force` to force rebuild
- Optimize optimizeDeps configuration in vite.config.js

## Reference Resources

- [React Official Documentation](https://react.dev/)
- [Vite Official Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
