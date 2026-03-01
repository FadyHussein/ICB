# ICB Sunday School Frontend

React frontend application for the ICB Sunday School Attendance & Academic Progress Tracking System.

## Overview

This is a React + TypeScript frontend application that provides an intuitive interface for teachers to mark attendance and track academic progress for students in both Iqra and Islamic Studies programs.

## Features

- **Dual Program Support**: Separate tracking for Iqra and Islamic Studies programs
- **Multi-Level Navigation**: Easy selection of program levels (Kindergarten through Level 6, plus Quran)
- **Teacher Authentication**: Simple teacher selection-based authentication
- **Student Attendance Interface**: Mark attendance with checkboxes and track page/lesson progress
- **Bulk Operations**: Update multiple students' page numbers at once
- **Responsive Design**: Works seamlessly on tablets, phones, and desktop computers
- **Real-time Validation**: Form validation and error handling
- **Success Confirmation**: Clear feedback after submission with summary statistics

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Styling**: Emotion (CSS-in-JS)

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components (LoadingSpinner, ErrorAlert)
│   │   ├── landing/     # Landing page
│   │   ├── level/       # Level selection page
│   │   ├── teacher/     # Teacher selection page
│   │   ├── attendance/  # Main attendance interface
│   │   ├── confirmation/# Success confirmation page
│   │   └── layout/      # Layout components (Header)
│   ├── context/         # React Context providers
│   │   ├── AppStateContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/        # API service layer
│   │   ├── api.ts
│   │   ├── config.service.ts
│   │   ├── teachers.service.ts
│   │   ├── students.service.ts
│   │   └── attendance.service.ts
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── styles/          # Theme and global styles
│   │   └── theme.ts
│   ├── App.tsx          # Root component with routing
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Setup Instructions

### Prerequisites

- Node.js v18.x or v20.x LTS
- npm or pnpm package manager
- Backend server running on port 5000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` (already done)
   - Verify `VITE_API_BASE_URL` points to backend (default: http://localhost:5000/api/v1)

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

The production build will be in the `dist/` directory.

## Usage Guide

### User Flow

1. **Landing Page**: Select either "Iqra Tracking" or "Islamic Studies Tracking"
2. **Level Selection**: Choose the class level
3. **Teacher Selection**: Select your name from the list of teachers
4. **Attendance Interface**: 
   - Mark students present/absent with checkboxes
   - Enter page/lesson numbers for present students
   - Use "Select All" for quick marking
   - Use bulk update to set the same page number for all present students
   - Submit attendance
5. **Confirmation**: View summary and choose to submit more or return home

### Key Features

#### Attendance Interface

- **Individual Marking**: Check/uncheck students and enter their progress
- **Select All**: Quickly mark all students present or absent
- **Bulk Page Update**: Set the same page number for all checked students
- **Real-time Summary**: See count of present students before submission
- **Validation**: Ensures at least one student is marked before submission

#### Responsive Design

- **Tablet-Optimized**: Large, touch-friendly buttons and inputs (48px minimum)
- **Mobile Support**: Single-column layout on small screens
- **Desktop-Friendly**: Multi-column layouts on larger screens

## API Integration

The frontend connects to the backend REST API at `http://localhost:5000/api/v1`.

### Key Endpoints Used

- `GET /config/programs` - Get available programs
- `GET /config/programs/:programId/levels` - Get levels for a program
- `GET /teachers?program=X&level=Y` - Get filtered teachers
- `GET /students?program=X&level=Y` - Get students for a level
- `POST /attendance/submit` - Submit attendance records

All API calls include error handling with user-friendly error messages.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint code with ESLint

### Component Development

Each page is a self-contained component with:
- TypeScript interfaces for props and state
- Material-UI components for consistent styling
- Error handling and loading states
- Responsive layout

### Adding New Features

1. **Add API Service**: Create service method in `src/services/`
2. **Update Types**: Add TypeScript interfaces in `src/types/`
3. **Create Component**: Build component in appropriate directory
4. **Add Route**: Update routes in `App.tsx`
5. **Test**: Verify in browser

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:5000/api/v1 | Backend API base URL |
| `VITE_APP_NAME` | ICB Sunday School Attendance | Application name |
| `VITE_APP_VERSION` | 1.0.0 | Application version |

### Theme Customization

Edit `src/styles/theme.ts` to customize:
- Primary and secondary colors
- Typography
- Component styles
- Breakpoints

## Troubleshooting

### Backend Connection Issues

**Error**: "Unable to connect to server"
**Solution**: Ensure backend server is running on port 5000

```bash
# In backend directory
cd backend
npm start
```

### Port Already in Use

**Error**: "Port 5173 is already in use"
**Solution**: Kill the process using the port or specify a different port

```bash
# Use different port
npm run dev -- --port 3000
```

### Build Errors

**Error**: TypeScript compilation errors
**Solution**: Ensure all dependencies are installed

```bash
npm install
```

### API Errors

**Error**: 404 Not Found from API
**Solution**: Verify backend is running and API routes are correct

## Deployment

### Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve with backend:**
   - The backend Express server can serve the static frontend files
   - Copy `dist/` contents to backend's `public/` directory

3. **Or use standalone server:**
   ```bash
   npm install -g serve
   serve -s dist -p 3000
   ```

### Network Configuration

For local network access:
1. Update `VITE_API_BASE_URL` to use server's IP address
2. Ensure firewall allows connections on port 3000/5173
3. Teachers access via `http://<SERVER_IP>:3000`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Bundle size optimized with code splitting
- Lazy loading for routes (can be added)
- Material-UI tree shaking for smaller bundle
- Vite fast refresh for development

## Security

- Input validation on all forms
- XSS protection via React's built-in escaping
- HTTPS recommended for production
- CORS configured in backend

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Touch-friendly for tablets
- High contrast text

## Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review browser console for errors
3. Check backend logs for API issues
4. Verify network connectivity
5. Contact development team

## License

MIT License - Islamic Center of Boise

---

**Version**: 1.0.0  
**Last Updated**: February 22, 2026  
**Developed for**: Islamic Center of Boise Sunday School
