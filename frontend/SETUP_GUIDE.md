# TextPro AI Frontend - Complete Setup Guide

This guide will help you set up and run the TextPro AI Frontend project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. Node.js and npm
- **Download**: Go to [https://nodejs.org/](https://nodejs.org/)
- **Version**: Install the latest LTS version (recommended)
- **Verify installation**: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```
  You should see version numbers for both commands.

### 2. Git (Optional but recommended)
- **Download**: Go to [https://git-scm.com/](https://git-scm.com/)
- This is needed if you want to clone the repository or manage version control.

## Quick Start (One-Command Installation)

### Option 1: Super Easy Install (Recommended)
**Windows:**
1. Double-click `INSTALL.bat`
2. Wait for installation to complete
3. Run `npm run dev`

**macOS/Linux:**
1. Double-click `INSTALL.sh` or run: `./INSTALL.sh`
2. Wait for installation to complete  
3. Run `npm run dev`

### Option 2: Manual Install from requirements.txt
**Windows:**
```powershell
# Navigate to the project folder
cd path\to\TextProBah\frontend

# Install from requirements.txt (one command installs everything!)
node smart-install.js

# Start the development server
npm run dev
```

**macOS/Linux:**
```bash
# Navigate to the project folder
cd path/to/TextProBah/frontend

# Install from requirements.txt (one command installs everything!)
node smart-install.js

# Start the development server
npm run dev
```

### Option 3: Traditional npm install
```bash
# Navigate to the project folder
cd path/to/TextProBah/frontend

# Install all dependencies
npm install

# Start the development server
npm run dev
```

## Detailed Setup Instructions

### Step 1: Get the Project Files
If you received the project as a ZIP file:
1. Extract the ZIP file to your desired location
2. Open terminal/command prompt
3. Navigate to the `frontend` folder:
   ```bash
   cd path/to/TextProBah/frontend
   ```

### Step 2: Install Dependencies
Run this command to install all required packages:
```bash
npm install
```

This will install all the frameworks and libraries including:
- **Next.js 15.5.0** - React framework
- **React 19.1.0** - Frontend library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library
- **Axios** - HTTP client
- **NextAuth** - Authentication
- **Recharts** - Charts and graphs
- **And many more...**

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Open your web browser and go to:
```
http://localhost:3000
```

You should see the TextPro AI application running!

## Available Scripts

After installation, you can run these commands:

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (run after build)
npm start

# Run linting
npm run lint
```

## Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── allocation/      # Resource allocation components
│   ├── analytics/       # Analytics and reporting
│   ├── inspector/       # Quality inspection tools
│   ├── machines/        # Machine monitoring
│   ├── maintenance/     # Maintenance management
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── services/           # API services
├── styles/             # Global styles
├── public/             # Static assets
└── src/                # Source code
```

## Technologies Used

- **Frontend Framework**: Next.js 15.5.0
- **UI Library**: React 19.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI (Shadcn/UI)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## Troubleshooting

### Common Issues and Solutions:

#### 1. "npm is not recognized" error
- **Solution**: Node.js is not installed or not in PATH
- **Fix**: Download and install Node.js from [nodejs.org](https://nodejs.org/)

#### 2. Permission errors on Windows
- **Solution**: Run terminal as Administrator
- **Or**: Use `npx` instead of global installations

#### 3. Port 3000 already in use
- **Solution**: Either:
  - Stop the other application using port 3000
  - Or start on different port: `npm run dev -- --port 3001`

#### 4. Module not found errors
- **Solution**: Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

#### 5. TypeScript errors
- **Solution**: Make sure TypeScript is installed:
  ```bash
  npm install -g typescript
  ```

## Development Tips

1. **Hot Reload**: The development server automatically reloads when you make changes
2. **File Structure**: Follow the existing folder structure for consistency
3. **Components**: All UI components are in the `components/` folder
4. **Styling**: Use Tailwind CSS classes for styling
5. **API Calls**: Use the services in `services/` folder for API integration

## Environment Variables (If Needed)

If the application requires environment variables, create a `.env.local` file in the root directory:

```env
# Example environment variables
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=your-api-url
```

## Browser Compatibility

This application works best with modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Make sure all dependencies are installed (`npm install`)
3. Verify Node.js version is compatible
4. Check the browser console for client-side errors

## Production Deployment

To build for production:
```bash
npm run build
npm start
```

The application will be optimized and ready for production deployment.

---

**Happy coding! 🚀**
