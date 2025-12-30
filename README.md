# FamiLes 2026 - Deployment Guide

## Project Structure

```
familes-2026/
├── index.html          # Main HTML file (loads dependencies)
├── js/
│   ├── config.js       # Firebase configuration & constants
│   └── app.js          # Main React application component
├── .gitignore
└── README.md           # This file
```

## Quick Start

### Option 1: Drag & Drop to Netlify (Easiest)

1. Create a folder called `familes-2026`
2. Add the three files:
   - `index.html` (in root)
   - `js/config.js` (in js folder)
   - `js/app.js` (in js folder)
3. Go to [Netlify Drop](https://app.netlify.com/drop)
4. Drag the entire `familes-2026` folder onto the page
5. Done! Your app is live

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project folder
cd familes-2026
netlify deploy --prod
```

### Option 3: Git-based Deployment

1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (root)
4. Deploy!

## File Organization Benefits

### Why 3 Files?

**config.js** - Separates configuration from logic
- Firebase credentials
- App constants (PAGES_PER_LEVEL, DAILY_PAGES_GOAL)
- Icon components
- Easy to update settings without touching main code

**app.js** - Contains all application logic
- React components
- Business logic
- Event handlers
- Clean, organized code

**index.html** - Minimal structure
- Just loads dependencies
- Keeps markup clean
- Easy to see what's being loaded

## Configuration

### Updating Firebase Settings

Edit `js/config.js` to change:
- Firebase credentials
- Pages per level (currently 20)
- Daily reading goal (currently 5)

### Customizing Constants

```javascript
// In config.js
window.APP_CONSTANTS = {
  PAGES_PER_LEVEL: 20,      // Change to 50, 100, etc.
  DAILY_PAGES_GOAL: 5       // Change to 10, 20, etc.
};
```

## Development Workflow

### Local Development

Simply open `index.html` in a browser - no build tools needed!

For a better local dev experience:
```bash
# Install a simple HTTP server
npm install -g serve

# Run from project folder
serve .

# Or use Python
python -m http.server 8000
```

### Making Changes

1. Edit `js/app.js` for functionality changes
2. Edit `js/config.js` for settings/constants
3. Refresh browser to see changes
4. Deploy to Netlify when ready

## Advantages of This Structure

✅ **No build step** - Direct deployment
✅ **Easy maintenance** - Separated concerns
✅ **Git-friendly** - Small, focused files
✅ **Fast deploys** - Netlify handles everything
✅ **Simple debugging** - Clear file organization
✅ **Version control** - Track changes per file

## Future Improvements

If the app grows more complex, consider:

### Option A: Add More Files
```
js/
├── config.js
├── components/
│   ├── AuthForm.js
│   ├── BookList.js
│   ├── Leaderboard.js
│   └── ProfileSelector.js
├── utils/
│   ├── firebase.js
│   └── calculations.js
└── app.js
```

### Option B: Use Build Tools (Vite)
```bash
npm create vite@latest familes-2026 -- --template react
```

But for now, the 3-file structure is perfect for your family reading tracker!

## Security Note

Your Firebase config is safe to expose in client-side code. Firebase security is handled by:
- Authentication rules
- Database security rules (set in Firebase Console)

Make sure your Firebase Realtime Database rules are properly configured!

## Support

For issues or questions:
1. Check Firebase Console for database errors
2. Check browser console for JavaScript errors
3. Verify all three files are in correct locations
4. Ensure Firebase credentials are correct in config.js
