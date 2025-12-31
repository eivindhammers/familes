// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJAev8Jn2Ywh_ms57iRfFkZxXVRQu6Hlk",
  authDomain: "familes-98f43.firebaseapp.com",
  databaseURL: "https://familes-98f43-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "familes-98f43",
  storageBucket: "familes-98f43.firebasestorage.app",
  messagingSenderId: "341223228678",
  appId: "1:341223228678:web:267ba8ab953eed3d088a87",
  measurementId: "G-GC4TWT0TW0"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase instances
window.database = firebase.database();
window.auth = firebase.auth();

// Constants
window.APP_CONSTANTS = {
  // XP system: 1 page read = 1 XP (but XP can come from other sources too)
  XP_BASE: 10,         // XP needed for first level up (1→2)
  XP_MULTIPLIER: 1.5,  // Each level requires 50% more XP than the previous
  DAILY_PAGES_GOAL: 5  // Pages needed per day to maintain streak (streaks are about reading, not XP)
};

// Icon components (available globally)
window.Icons = {
  BookOpen: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
    React.createElement("path", { key: "2", d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
  ]),

  TrendingUp: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("polyline", { key: "1", points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
    React.createElement("polyline", { key: "2", points: "17 6 23 6 23 12" })
  ]),

  Users: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    React.createElement("circle", { key: "2", cx: "9", cy: "7", r: "4" }),
    React.createElement("path", { key: "3", d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    React.createElement("path", { key: "4", d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ]),

  Plus: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("line", { key: "1", x1: "12", y1: "5", x2: "12", y2: "19" }),
    React.createElement("line", { key: "2", x1: "5", y1: "12", x2: "19", y2: "12" })
  ]),

  LogOut: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    React.createElement("polyline", { key: "2", points: "16 17 21 12 16 7" }),
    React.createElement("line", { key: "3", x1: "21", y1: "12", x2: "9", y2: "12" })
  ]),

  LogIn: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }),
    React.createElement("polyline", { key: "2", points: "10 17 15 12 10 7" }),
    React.createElement("line", { key: "3", x1: "15", y1: "12", x2: "3", y2: "12" })
  ]),

  Flame: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
  })),

  Trash2: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M3 6h18" }),
    React.createElement("path", { key: "2", d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
    React.createElement("path", { key: "3", d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
    React.createElement("line", { key: "4", x1: "10", y1: "11", x2: "10", y2: "17" }),
    React.createElement("line", { key: "5", x1: "14", y1: "11", x2: "14", y2: "17" })
  ]),

  Settings: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("circle", { key: "1", cx: "12", cy: "12", r: "3" }),
    React.createElement("path", { key: "2", d: "M12 1v6m0 6v6" }),
    React.createElement("path", { key: "3", d: "m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" }),
    React.createElement("path", { key: "4", d: "M1 12h6m6 0h6" }),
    React.createElement("path", { key: "5", d: "m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" })
  ]),

  GitHub: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, React.createElement("path", {
    d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
  })),

  UserPlus: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    React.createElement("circle", { key: "2", cx: "9", cy: "7", r: "4" }),
    React.createElement("line", { key: "3", x1: "19", y1: "8", x2: "19", y2: "14" }),
    React.createElement("line", { key: "4", x1: "22", y1: "11", x2: "16", y2: "11" })
  ]),

  Bell: (props) => React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [
    React.createElement("path", { key: "1", d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
    React.createElement("path", { key: "2", d: "M13.73 21a2 2 0 0 1-3.46 0" })
  ])
};
