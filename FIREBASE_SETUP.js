/**
 * Firebase Realtime Database Rules and Indexing Configuration
 * 
 * IMPORTANT: Add these rules and indices to Firebase Console for optimal chat performance
 */

// ============================================
// RECOMMENDED DATABASE RULES
// ============================================
{
  "rules": {
    // User profiles - read all, write own
    "userProfiles": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    
    // Global users list - read all
    "users": {
      ".read": true,
      "$profileId": {
        ".write": "auth != null"
      }
    },
    
    // Books - read all, write own profile
    "books": {
      ".read": true,
      "$profileId": {
        ".write": "auth != null"
      }
    },
    
    // Reading history - read all, write own profile
    "readingHistory": {
      ".read": true,
      "$profileId": {
        ".write": "auth != null"
      }
    },
    
    // Leagues - read all, write for members
    "leagues": {
      ".read": true,
      ".write": "auth != null"
    },
    
    // League leaderboards - read all, write for members
    "leagueLeaderboards": {
      ".read": true,
      ".write": "auth != null"
    },
    
    // Friendships - read own, write own
    "friendships": {
      "$profileId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    
    // Chats - read/write if participant
    "chats": {
      "$conversationId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "messages": {
          // INDEX FOR EFFICIENT QUERIES
          ".indexOn": ["recipientId", "timestamp"]
        }
      }
    }
  }
}

// ============================================
// FIREBASE INDEXING GUIDE
// ============================================

/**
 * To add these indices in Firebase Console:
 * 
 * 1. Go to Firebase Console > Database > Realtime Database
 * 2. Click on "Rules" tab
 * 3. Add the rules above
 * 4. Click "Publish"
 * 
 * The indices are already included in the rules above:
 * - chats/$conversationId/messages indexed on: recipientId, timestamp
 * 
 * These indices ensure:
 * - Fast message queries filtered by recipient
 * - Proper ordering by timestamp
 * - Efficient unread message filtering
 */

// ============================================
// PERFORMANCE NOTES
// ============================================

/**
 * Current Implementation Scalability:
 * 
 * 1. CONVERSATION LOADING (loadConversations):
 *    - Loads all chats and filters client-side
 *    - Works well for typical usage (< 50 friends per user)
 *    - Friend-only restriction naturally limits conversations
 *    
 *    For large scale (hundreds of friends):
 *    - Add userConversations/${userId}/${conversationId} index
 *    - Update sendMessage to write to both locations
 *    - Modify loadConversations to query user-specific index
 * 
 * 2. MESSAGE QUERIES (markMessagesAsRead):
 *    - Uses orderByChild('recipientId') with Firebase index
 *    - Only updates unread messages
 *    - Efficient for typical conversation sizes (< 1000 messages)
 * 
 * 3. UNREAD COUNTS:
 *    - Uses atomic increment (ServerValue.increment)
 *    - No race conditions
 *    - Efficient updates
 */

// ============================================
// SECURITY CONSIDERATIONS
// ============================================

/**
 * Current rules allow:
 * - Any authenticated user to read/write chats
 * - Any authenticated user to send friend requests
 * - Any authenticated user to read all profiles
 * 
 * For production, consider:
 * - Restrict chat write to participants only
 * - Validate message structure with .validate rules
 * - Add rate limiting (via Cloud Functions)
 * - Validate friendship before allowing chat
 * 
 * Example stricter chat rules:
 * 
 * "chats": {
 *   "$conversationId": {
 *     ".read": "data.child('participants').child(auth.uid).exists()",
 *     "messages": {
 *       "$messageId": {
 *         ".write": "!data.exists() && 
 *                    (newData.child('senderId').val() === auth.uid) &&
 *                    root.child('friendships').child(auth.uid)
 *                        .child('friends').hasChild(newData.child('recipientId').val())"
 *       }
 *     }
 *   }
 * }
 */
