# Chat System Documentation

## Overview

The chat system enables real-time one-to-one messaging between friends in the FamiLes application. Built with Firebase Realtime Database, it provides instant message delivery, unread tracking, and a responsive user interface.

## Features

### Core Functionality
- **One-to-One Messaging**: Chat with any friend in your friends list
- **Real-Time Sync**: Messages appear instantly for both users
- **Unread Indicators**: Badge shows number of unread messages (0-9+)
- **Auto-Read**: Messages automatically marked as read when chat is opened
- **Message History**: All conversations are persisted in Firebase

### User Experience
- **Auto-Scroll**: Automatically scrolls to latest messages
- **Auto-Focus**: Input field receives focus when chat opens
- **Timestamps**: Relative time display (e.g., "14:30" for today, "Mon 14:30" for this week)
- **Message Bubbles**: Visual distinction between sent and received messages
- **Loading States**: Disabled send button while message is being sent
- **Modal Interface**: Full-screen overlay for focused conversation

### Design
- **Responsive**: Optimized for both desktop and mobile devices
- **Dark Mode**: Full support with proper contrast in both themes
- **Norwegian UI**: All labels and text in Norwegian (consistent with app)
- **Accessible**: Keyboard navigation and semantic HTML

## Architecture

### Component Structure

```
FriendsManager Component
├── Friend List
│   ├── Friend Card
│   │   ├── Profile Info
│   │   ├── Chat Button (with unread badge)
│   │   ├── View Books Button
│   │   └── Remove Friend Button
│   └── ...
└── ChatManager Modal (when chat opened)
    ├── Header (friend info, close button)
    ├── Messages Area (scrollable)
    │   ├── Message Bubble (own messages - right/blue)
    │   ├── Message Bubble (friend's - left/gray)
    │   └── Timestamps
    └── Input Form
        ├── Text Input
        └── Send Button
```

### Data Structure

```
chats/
  └── {conversationId}/              # e.g., "user1_user2" (sorted IDs)
      ├── messages/
      │   └── {messageId}/
      │       ├── id: string          # Auto-generated Firebase key
      │       ├── senderId: string    # Profile ID of sender
      │       ├── recipientId: string # Profile ID of recipient
      │       ├── text: string        # Message content
      │       ├── timestamp: string   # ISO 8601 format
      │       └── read: boolean       # Read status
      ├── lastMessage/
      │   ├── text: string            # Last message preview
      │   ├── timestamp: string       # When it was sent
      │   └── senderId: string        # Who sent it
      ├── participants/
      │   ├── {profileId1}: true      # User 1 is participant
      │   └── {profileId2}: true      # User 2 is participant
      └── unreadCount/
          ├── {profileId1}: number    # Unread count for user 1
          └── {profileId2}: number    # Unread count for user 2
```

### Key Functions

#### Firebase Service (`firebase-service.js`)

1. **`getConversationId(profileId1, profileId2)`**
   - Generates deterministic conversation ID
   - Always returns same ID regardless of parameter order
   - Format: "{smaller_id}_{larger_id}"

2. **`sendMessage(conversationId, senderId, recipientId, messageText)`**
   - Sends a new message
   - Updates lastMessage metadata
   - Increments unread count for recipient
   - Adds both users as participants

3. **`loadMessages(conversationId, callback)`**
   - Sets up real-time listener for messages
   - Ordered by timestamp
   - Returns unsubscribe function for cleanup

4. **`markMessagesAsRead(conversationId, userId)`**
   - Marks all user's messages as read in conversation
   - Resets unread count to 0
   - Optimized query using Firebase index

5. **`loadConversations(userId, callback)`**
   - Loads all conversations where user is participant
   - Real-time updates
   - Returns unsubscribe function

## Usage

### For Users

1. **Starting a Chat**
   - Go to "Venner" (Friends) tab
   - Click the green "Chat" button next to a friend's name
   - Chat modal opens

2. **Sending Messages**
   - Type message in input field at bottom
   - Press Enter or click "Send" button
   - Message appears on right side (blue bubble)

3. **Receiving Messages**
   - Friend's messages appear on left side (gray/white bubble)
   - Unread badge shows on chat button (red circle with number)
   - Badge disappears when you open the chat

4. **Closing Chat**
   - Click X button in top-right corner
   - Click outside the modal
   - Press Escape key

### For Developers

#### Adding Chat to a Component

```javascript
// Import ChatManager
const { ChatManager } = window;

// State for chat
const [activeChatFriendId, setActiveChatFriendId] = useState(null);

// Open chat handler
const openChat = (friendId) => {
  setActiveChatFriendId(friendId);
};

// Close chat handler
const closeChat = () => {
  setActiveChatFriendId(null);
};

// Render chat modal
{activeChatFriendId && (
  <ChatManager
    currentProfile={currentProfile}
    friendId={activeChatFriendId}
    friendData={users[activeChatFriendId]}
    onClose={closeChat}
    darkMode={darkMode}
  />
)}
```

#### Loading Conversations with Unread Counts

```javascript
const { loadConversations, getConversationId } = window;

// Load conversations
useEffect(() => {
  if (!currentProfile) return;
  
  const unsubscribe = loadConversations(currentProfile.id, (data) => {
    setConversations(data);
  });
  
  return () => unsubscribe();
}, [currentProfile?.id]);

// Get unread count for specific friend
const getUnreadCount = (friendId) => {
  const conversationId = getConversationId(currentProfile.id, friendId);
  const conversation = conversations[conversationId];
  return conversation?.unreadCount?.[currentProfile.id] || 0;
};
```

## Firebase Setup

### Required Indices

Add to Firebase Database Rules for optimal performance:

```json
{
  "rules": {
    "chats": {
      "$conversationId": {
        "messages": {
          ".indexOn": ["recipientId", "timestamp"]
        }
      }
    }
  }
}
```

See `FIREBASE_SETUP.js` for complete rules and security recommendations.

### Security Rules

Current implementation allows any authenticated user to read/write chats. For production:
- Restrict to participants only
- Validate message structure
- Add rate limiting (via Cloud Functions)
- Verify friendship before allowing chat

## Performance

### Scalability

The current implementation is optimized for typical usage:
- Works well with < 50 friends per user
- Handles conversations with < 1000 messages efficiently
- Friend-only restriction naturally limits conversation count

### Optimizations

1. **Message Queries**
   - Uses Firebase indices for fast filtering
   - Only updates unread messages (skips already read)
   - Queries by recipient ID for efficiency

2. **Unread Counts**
   - Atomic increment (no race conditions)
   - Client-side calculation for display

3. **Real-Time Listeners**
   - Proper cleanup to prevent memory leaks
   - Unsubscribe functions returned from hooks
   - Listeners only active when component mounted

### Future Improvements (Not Implemented)

For very large scale deployments:
- Add `userConversations/${userId}/${conversationId}` index
- Implement message pagination (load older messages on scroll)
- Add Cloud Functions for server-side filtering
- Implement WebSocket for lower latency

## Testing

### Manual Testing Checklist

1. **Basic Messaging**
   - [ ] Send message from User A to User B
   - [ ] Verify message appears for User B in real-time
   - [ ] Reply from User B to User A
   - [ ] Verify message appears for User A

2. **Unread Tracking**
   - [ ] Send message from User A
   - [ ] Verify unread badge appears for User B
   - [ ] Open chat as User B
   - [ ] Verify badge disappears

3. **UI/UX**
   - [ ] Messages auto-scroll to bottom
   - [ ] Input field receives focus on open
   - [ ] Timestamps display correctly
   - [ ] Own messages on right (blue), friend's on left (gray/white)
   - [ ] Close button works
   - [ ] Send button disabled while sending

4. **Responsive Design**
   - [ ] Test on mobile viewport
   - [ ] Test on tablet viewport
   - [ ] Test on desktop viewport
   - [ ] Verify buttons are touch-friendly
   - [ ] Check modal sizing

5. **Dark Mode**
   - [ ] Toggle dark mode
   - [ ] Verify chat UI adapts
   - [ ] Check text contrast
   - [ ] Verify message bubbles are readable

6. **Edge Cases**
   - [ ] Open chat with no previous messages
   - [ ] Send very long message
   - [ ] Send many messages quickly
   - [ ] Open multiple chats (one at a time)
   - [ ] Close and reopen same chat

## Troubleshooting

### Messages not appearing in real-time
- Check Firebase connection (console for errors)
- Verify Firebase rules allow read/write
- Check browser console for JavaScript errors

### Unread badges not updating
- Verify `loadConversations` is called
- Check Firebase listener is active
- Verify `markMessagesAsRead` is called when chat opens

### Performance issues
- Add Firebase indices (see FIREBASE_SETUP.js)
- Check for memory leaks (listeners not cleaned up)
- Verify not loading too many conversations

### Styling issues in dark mode
- Verify `darkMode` prop passed to ChatManager
- Check CSS classes use conditional dark mode classes
- Inspect element to debug specific styles

## Future Enhancements

Potential features for future versions:
- Group chats (multiple participants)
- Message editing and deletion
- Image/file sharing
- Typing indicators
- Push notifications
- Message search
- Read receipts (double checkmarks)
- Message reactions (emoji)
- Voice messages
- Link previews

## Credits

Implemented for FamiLes reading tracking application
Following existing codebase patterns and Norwegian language UI
