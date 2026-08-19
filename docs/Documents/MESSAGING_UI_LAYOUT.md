# 🎨 Messaging UI Layout

## Full Screen Chat Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│                           💬 MESSAGES HEADER                         │
│  ← Back to Dashboard                                                 │
│  "Team Chat & Direct Messages" Subtitle                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         MAIN CHAT AREA                              │
│                                                                      │
│  TEAM CHAT MODE:                    DIRECT MESSAGES MODE:           │
│  ┌──────────────────────┐           ┌──────────┬──────────────────┐ │
│  │ 📢 Team Chat        │           │Users     │Selected User     │ │
│  │ "Communication with  │           │Sidebar   │Info              │ │
│  │  entire team"        │           │          │                  │ │
│  ├──────────────────────┤           │          │Content:          │ │
│  │                      │           │          │ - Message List   │ │
│  │   MESSAGE LIST       │           │          │ - Input Form     │ │
│  │  (All team messages) │           │          │                  │ │
│  │                      │           ├──────────┼──────────────────┤ │
│  │  [User]: Message 1   │           │Tharun 🟢 │[User]: Msg 1     │ │
│  │  [User]: Message 2   │           │John 🟢   │[User]: Msg 2     │ │
│  │  ✋ Someone typing... │           │Jane ⚪   │✋Someone typing.. │ │
│  │                      │           │Mike ⚪   │                  │ │
│  ├──────────────────────┤           │          │                  │ │
│  │ [           ] [Send] │           └──────────┼──────────────────┤ │
│  │  Type message...     │                      │ [          ] [Send]
│  └──────────────────────┘                      │  Message user...
│                                                └──────────────────┘
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  [📢 Team Chat]    [✉️ Direct Messages]    (Bottom Toggle)         │
│  (Active)          (Inactive)                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Structure

```
Chat.jsx (Main Page)
├── Header
│   ├── Title "💬 Messages"
│   ├── Subtitle
│   └── Back Button
│
├── Main Content
│   ├── Team Chat Mode
│   │   ├── Chat Header
│   │   ├── Message List
│   │   │   ├── Message (other)
│   │   │   ├── Message (own)
│   │   │   ├── Typing Indicator
│   │   │   └── Empty State
│   │   └── Message Form
│   │       ├── Input Field
│   │       └── Send Button
│   │
│   └── Direct Messages Mode
│       ├── Users Sidebar
│       │   ├── User Option
│       │   ├── User Icon + Status
│       │   └── User Name + Status
│       │
│       └── Chat Area
│           ├── Chat Header
│           │   ├── User Name
│           │   └── Online Status
│           ├── Message List
│           └── Message Form
│
└── Mode Toggle (Bottom)
	├── Team Chat Button (with icon)
	└── Direct Messages Button (with icon)
```

## Message Bubble Elements

### Other User's Message
```
┌─────────────────────────────┐
│ John Doe          2:30 PM   │
│ "This is a sample message"  │
└─────────────────────────────┘
(Gray background, left-aligned)
```

### Your Message
```
				┌─────────────────────────────┐
				│ Jane Smith        2:31 PM   │
				│ "This is my message"        │
				└─────────────────────────────┘
(Blue background, right-aligned)
```

### Typing Indicator
```
✋ John Doe is typing...
(Italic, muted color, pulsing animation)
```

## User Badge (Direct Messages)

### Online
```
┌─────────────────────────┐
│ 🟢 Tharun              │
│    🟢 Online           │
└─────────────────────────┘
```

### Offline
```
┌─────────────────────────┐
│ ⚪ Jane Smith          │
│    ⚪ Offline          │
└─────────────────────────┘
```

## Color & Styling

### Color Scheme
- **Team Chat Messages**: Gray background (rgba(0, 0, 0, 0.05))
- **Own Messages**: Blue tint (rgba(0, 120, 212, 0.15))
- **Background**: Frosted glass effect (backdrop-filter: blur 10px)
- **Sender Name**: Primary text color (bold)
- **Timestamp**: Muted gray text color
- **Input Field**: White background with border
- **Send Button**: Blue (--color-accent-primary)
- **Online Status**: Green (#22c55e)
- **Offline Status**: Gray (#9ca3af)

### Typography
- **Header**: XL bold (1.8rem)
- **Chat Title**: Large (var(--font-size-xl))
- **Message**: Base size with normal weight
- **Timestamp**: Small (11px) muted
- **Status**: Small (var(--font-size-sm)) secondary

### Spacing
- **Padding**: Standard (--spacing-md, --spacing-lg)
- **Gap between messages**: Medium (--spacing-md)
- **Border radius**: Medium (--radius-md, --radius-lg)
- **Shadows**: Subtle box shadows for depth

## Responsive Design

### Desktop (> 900px)
```
Full layout with both sidebars visible
Wide message bubbles (70% width)
All UI elements clearly visible
```

### Tablet (600px - 900px)
```
Slightly condensed layout
Message bubbles (85% width)
Adjusted column widths
```

### Mobile (< 600px)
```
┌──────────────┐
│    HEADER    │
├──────────────┤
│  CHAT AREA   │ (Full width)
│  (stacked    │
│   layout)    │
├──────────────┤
│ INPUT FORM   │
├──────────────┤
│ MODE TOGGLE  │ (Full width buttons)
└──────────────┘

Direct messages in drawer or stacked view
Message bubbles (90% width)
Touch-friendly button sizes
```

## Animations

### Message Slide-In
```
From: opacity: 0, transform: translateY(10px)
To:   opacity: 1, transform: translateY(0)
Duration: 0.3s ease-out
```

### Typing Indicator Pulse
```
0%, 100%: opacity 0.6
50%:      opacity 1.0
Duration: 1.5s infinite
```

### Button Hover
```
Send Button:
  Hover: scale(1.05), darker background
  Active: scale(0.98)
  Disabled: opacity 0.5, cursor not-allowed

Back Button:
  Hover: translateX(-3px)
```

### Mode Toggle Active
```
Active Button:
  Background: Primary accent color
  Color: White
  Box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3)
```

## Empty States

### No Messages (Team Chat)
```
┌────────────────────────────┐
│                            │
│    No messages yet.        │
│  Start the conversation!   │
│           👋              │
│                            │
└────────────────────────────┘
```

### No Conversation (Direct Messages)
```
┌────────────────────────────┐
│                            │
│  Select a team member      │
│  to start chatting         │
│                            │
└────────────────────────────┘
```

## Accessibility Features

- Proper semantic HTML (headers, sections, forms)
- ARIA labels on buttons
- Keyboard navigation support
- Color contrast for readability
- Focus states on interactive elements
- Placeholder text in input fields
- Alt text on icons

---

**This layout is fully responsive and adapts to all screen sizes!**
