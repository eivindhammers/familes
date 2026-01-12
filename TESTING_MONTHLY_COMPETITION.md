# Testing Guide for Monthly Competition Feature

## Overview
This document provides manual testing steps to verify the monthly competition feature works correctly.

## Prerequisites
- Access to the FamiLes application
- At least one league created
- Multiple user profiles in the league (for realistic testing)

## Test Plan

### Test 1: New Profile Creation
**Purpose**: Verify new profiles are initialized with monthly XP fields

**Steps**:
1. Create a new profile or register a new user
2. Check Firebase database for the profile

**Expected Results**:
- Profile should have `monthlyXP: 0`
- Profile should have `currentMonth: "YYYY-MM"` (current month)

**Verification Query** (Firebase Console):
```
userProfiles/{uid}/{profileId}
```

### Test 2: Reading Pages and XP Tracking
**Purpose**: Verify both total and monthly XP increase when reading

**Steps**:
1. Add a book to your profile
2. Update pages read (e.g., read 10 pages)
3. Check your profile data

**Expected Results**:
- `totalXP` increases by 10
- `monthlyXP` increases by 10
- `currentMonth` is set to current month
- `totalPages` increases by 10

**Visual Check**: View leaderboard in both "Totalt XP" and "Månedens XP" modes - your XP should match

### Test 3: Leaderboard Toggle
**Purpose**: Verify users can switch between total and monthly views

**Steps**:
1. Navigate to "Ledertavle" tab
2. Select a league
3. Click "Totalt XP" button
4. Click "Månedens XP" button

**Expected Results**:
- "Totalt XP" view shows rankings by total XP
- "Månedens XP" view shows rankings by monthly XP
- Active button is highlighted
- Rankings may differ between the two views

### Test 4: Multiple Users in League
**Purpose**: Verify monthly leaderboard ranks multiple users correctly

**Steps**:
1. Have multiple users in the same league
2. Have users read different amounts this month
3. View the monthly leaderboard

**Expected Results**:
- Users are ranked by `monthlyXP` (highest to lowest)
- User with most pages read this month is #1
- Rankings update in real-time as users read

### Test 5: Month Transition (Simulation)
**Purpose**: Verify monthly XP resets when month changes

**Note**: This test requires waiting for a month change or manually adjusting the database

**Simulation Steps**:
1. Using Firebase Console, change your profile's `currentMonth` to last month (e.g., "2025-12")
2. Keep `monthlyXP` at some value (e.g., 100)
3. In the app, read some pages (e.g., 5 pages)
4. Check the database again

**Expected Results**:
- `currentMonth` updates to current month (e.g., "2026-01")
- `monthlyXP` resets to the new pages read (e.g., 5, not 105)
- `totalXP` continues to accumulate normally

### Test 6: League Leaderboard Data
**Purpose**: Verify league leaderboards store monthly data correctly

**Steps**:
1. Read some pages
2. Check Firebase database for league leaderboard

**Expected Results**:
- Entry exists at `leagueLeaderboards/{leagueId}/{profileId}`
- Entry contains:
  - `totalXP`: your total XP
  - `monthlyXP`: your monthly XP
  - `currentMonth`: current month
  - Other standard fields (name, level, streaks)

**Verification Query** (Firebase Console):
```
leagueLeaderboards/{leagueId}/{profileId}
```

### Test 7: Stale Month Data in Leaderboard
**Purpose**: Verify monthly leaderboard handles users with old month data

**Simulation Steps**:
1. Using Firebase Console, set one user's `currentMonth` to "2025-11" (old month)
2. Keep their `monthlyXP` at some value (e.g., 200)
3. View the monthly leaderboard in the app

**Expected Results**:
- User with old month data shows 0 monthly XP
- User is ranked at the bottom of monthly leaderboard
- User's total XP is unaffected

### Test 8: Edge Case - January Transition
**Purpose**: Verify date calculation handles year boundary correctly

**Note**: This is primarily a code review test

**Check**:
- Review `getLastMonth()` function in `js/firebase-service.js`
- Verify it correctly handles January → December transition

**Expected Logic**:
```javascript
// If current month is January (month = 0)
// Last month should be December of previous year
// Example: 2026-01 → 2025-12
```

### Test 9: No League Scenario
**Purpose**: Verify behavior when user is not in any league

**Steps**:
1. Create a new profile without joining any leagues
2. Navigate to "Ledertavle" tab

**Expected Results**:
- League dropdown shows "Ingen ligaer"
- Toggle buttons are not visible
- Message displayed: "Bli med i eller opprett en liga..."

### Test 10: Real-Time Updates
**Purpose**: Verify leaderboard updates in real-time

**Steps**:
1. Have two browser windows open with different users
2. Both users in the same league viewing monthly leaderboard
3. One user reads pages

**Expected Results**:
- Other user's leaderboard updates automatically
- Rankings adjust if necessary
- No page refresh needed

## Manual Verification Checklist

- [ ] New profiles have monthly XP fields initialized
- [ ] Reading pages increases both total and monthly XP
- [ ] Leaderboard toggle switches between views correctly
- [ ] Monthly leaderboard ranks users by monthly XP
- [ ] Month transition resets monthly XP (simulated)
- [ ] League leaderboard data includes monthly fields
- [ ] Stale month data shows as 0 in monthly view
- [ ] January transition calculates correctly
- [ ] No league scenario handled gracefully
- [ ] Real-time updates work across users

## Known Limitations

1. **Manual Month Transition**: Monthly XP resets when users next read pages after a month change, not automatically at midnight
2. **Winner Tracking**: Functions exist for tracking monthly winners, but UI for displaying/claiming rewards is not implemented
3. **Historical Data**: No UI to view previous months' winners or statistics

## Future Testing

When implementing monthly winner rewards:
- Test winner determination at month end
- Test reward claiming mechanism
- Test preventing duplicate reward claims
- Test historical winner display
