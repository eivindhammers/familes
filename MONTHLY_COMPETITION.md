# Monthly Competition Feature

## Overview
The monthly competition feature allows leagues to track XP earned during each calendar month, providing motivation for users who are behind in total XP rankings.

## How It Works

### Monthly XP Tracking
- Each user profile tracks `monthlyXP` separately from `totalXP`
- Monthly XP is earned the same way as total XP: 1 page read = 1 XP
- When a new month begins, monthly XP automatically resets to 0
- Total XP is never affected by the monthly reset

### Viewing the Leaderboard
1. Navigate to the "Ledertavle" (Leaderboard) tab
2. Select a league from the dropdown
3. Use the toggle buttons to switch between:
   - **Totalt XP**: All-time rankings based on total XP
   - **Månedens XP**: Current month rankings based on monthly XP

### Month Reset Behavior
- The app tracks the current month as `YYYY-MM` (e.g., "2026-01")
- When you read pages in a new month, the system detects the month change
- Your `monthlyXP` resets to the new XP earned
- Your `totalXP` continues to accumulate normally

## Technical Implementation

### Data Structure
Each user profile contains:
```javascript
{
  totalXP: 1500,           // All-time XP
  monthlyXP: 250,          // Current month XP
  currentMonth: "2026-01"  // Month being tracked
}
```

### League Leaderboard
Each league's leaderboard stores:
```javascript
{
  profileId: {
    id: "user_id",
    name: "User Name",
    totalXP: 1500,
    monthlyXP: 250,
    currentMonth: "2026-01",
    level: 15,
    currentStreak: 5
  }
}
```

## Future Enhancements

### Monthly Winner Rewards (Ready for Implementation)
Helper functions are available in `firebase-service.js` for:

1. **Determining Winners**: `determineMonthlyWinner(leagueId, leagueLeaderboard)`
   - Automatically determines the winner for the previous month
   - Stores winner information in the database

2. **Claiming Rewards**: `claimMonthlyReward(leagueId, month, profileId, rewardXP)`
   - Allows winners to claim their reward (default: 100 XP)
   - Marks reward as claimed to prevent double-claiming

3. **Reward Constant**: `APP_CONSTANTS.MONTHLY_WINNER_REWARD = 100`
   - Configurable XP reward for monthly winners

### Potential UI Additions
- Banner showing last month's winner
- Button to claim monthly reward
- History of past monthly winners
- Notification when you win a month

## Configuration

### Adjusting Monthly Reward
Edit `js/config.js`:
```javascript
window.APP_CONSTANTS = {
  MONTHLY_WINNER_REWARD: 100 // Change this value
};
```

## Benefits

1. **Motivation for New Users**: Even if far behind in total XP, users can compete in the current month
2. **Fresh Start**: Every month provides a new opportunity to win
3. **Sustained Engagement**: Monthly goals keep users engaged throughout the year
4. **Fair Competition**: Users who join mid-year aren't permanently disadvantaged

## Example Use Case

**Scenario**: 
- User A has 5000 total XP (been reading for 6 months)
- User B has 500 total XP (just started)
- In January, both users start at 0 monthly XP
- User B reads 300 pages in January
- User A reads 200 pages in January
- **Result**: User B wins the monthly competition despite being far behind in total XP!
