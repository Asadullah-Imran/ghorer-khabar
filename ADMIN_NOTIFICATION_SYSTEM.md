# Admin Support Notification System - Implementation Complete

## Overview
A complete real-time notification system has been implemented for the admin panel. When customers submit support tickets, admins receive live notifications in the navbar with a badge counter showing the number of unread notifications.

## What Gets Shown
**Support ticket data shown to ADMIN users only:**
- Customer name and email
- Support ticket topic (Order Issue, Payment Issue, Feedback, Other)
- Order number (if applicable)
- Message preview
- Timestamp of ticket submission
- Unread status indicator

## System Architecture

### 1. Database Model
**New Table: `admin_notifications`**
```prisma
model AdminNotification {
  id              String   @id @default(cuid())
  supportTicketId String   @map("support_ticket_id")
  title           String
  message         String
  read            Boolean  @default(false)
  createdAt       DateTime @default(now())

  @@index([read])
  @@index([createdAt])
  @@map("admin_notifications")
}
```

### 2. Context (State Management)
**File:** [src/contexts/AdminNotificationContext.tsx](src/contexts/AdminNotificationContext.tsx)

Features:
- Manages admin notifications state
- Polls for new notifications every 10 seconds
- Provides hooks for marking as read, marking all as read, and deleting notifications
- Auto-fetches notifications on mount for admin users

**Exported Hook:** `useAdminNotifications()`

### 3. UI Components

#### Notification Bell Component
**File:** [src/components/admin/AdminNotificationBell.tsx](src/components/admin/AdminNotificationBell.tsx)

Features:
- Bell icon in navbar with unread count badge
- Dropdown menu showing all notifications
- Click on notification to mark as read and navigate to support page
- "Mark all as read" button
- Delete individual notifications
- Shows "No notifications yet" message when empty
- Click outside to close dropdown

#### Admin Header Update
**File:** [src/components/admin/AdminHeader.tsx](src/components/admin/AdminHeader.tsx)

Changes:
- Replaced static bell icon with `AdminNotificationBell` component
- Integrated with notification system

### 4. Admin Layout
**File:** [src/app/(admin)/layout.tsx](src/app/(admin)/layout.tsx)

Changes:
- Wrapped entire admin layout with `AdminNotificationProvider`
- Enables notification context for all admin pages

### 5. API Endpoints

#### Get All Notifications
**Endpoint:** `GET /api/admin/notifications`
```json
{
  "notifications": [
    {
      "id": "string",
      "supportTicketId": "string",
      "title": "string",
      "message": "string",
      "read": boolean,
      "createdAt": "ISO DateTime"
    }
  ],
  "unreadCount": number
}
```

#### Mark as Read
**Endpoint:** `PATCH /api/admin/notifications/[id]`
**File:** [src/app/api/admin/notifications/[id]/route.ts](src/app/api/admin/notifications/[id]/route.ts)

#### Delete Notification
**Endpoint:** `DELETE /api/admin/notifications/[id]`
**File:** [src/app/api/admin/notifications/[id]/route.ts](src/app/api/admin/notifications/[id]/route.ts)

#### Mark All as Read
**Endpoint:** `PATCH /api/admin/notifications/mark-all-read`
**File:** [src/app/api/admin/notifications/mark-all-read/route.ts](src/app/api/admin/notifications/mark-all-read/route.ts)

### 6. Integration with Support Tickets
**File:** [src/app/api/support/ticket/route.ts](src/app/api/support/ticket/route.ts)

When a customer submits a support ticket:
1. Ticket is created in database
2. `AdminNotification` is automatically created with:
   - Title: "New Support Ticket: [topic]"
   - Message: "[Customer name] submitted a [topic] ticket (Order: [number])"

Example notification creation:
```typescript
await prisma.adminNotification.create({
  data: {
    supportTicketId: ticket.id,
    title: `New Support Ticket: ${topic}`,
    message: `${ticket.user?.name || "Guest"} submitted a ${topic.toLowerCase()} ticket${
      orderNumber ? ` (Order: ${orderNumber})` : ""
    }`,
    read: false,
  },
});
```

### 7. Database Migration
**Migration:** [prisma/migrations/20260120093019_add_admin_notification_model](prisma/migrations/20260120093019_add_admin_notification_model)

Creates:
- `admin_notifications` table
- Indexes on `read` and `createdAt` for efficient querying

## User Flow

### For Customers (Support Ticket Submission)
1. Customer navigates to `/support`
2. Selects topic and enters message
3. Submits ticket via `POST /api/support/ticket`
4. **System automatically creates admin notification**

### For Admins (In Dashboard)
1. Admin logs into `/admin/dashboard`
2. Bell icon appears in navbar with unread count badge
3. Real-time polling fetches notifications every 10 seconds
4. Admin clicks bell icon to open dropdown
5. Admin sees list of support tickets that need attention
6. Clicking a notification:
   - Marks it as read
   - Navigates to `/admin/support`
7. Admin can delete individual notifications
8. Admin can mark all as read with one click

## Features

✅ Real-time notification display
✅ Unread count badge on bell icon
✅ Poll-based updates (every 10 seconds)
✅ Mark notifications as read
✅ Mark all notifications as read
✅ Delete notifications
✅ Click outside to close dropdown
✅ Navigate to support page from notification
✅ Customer details in notification message
✅ Timestamp display for each notification
✅ Admin-only access

## File Structure

```
src/
├── contexts/
│   └── AdminNotificationContext.tsx         (Context & Hook)
├── components/admin/
│   ├── AdminNotificationBell.tsx            (Notification UI)
│   └── AdminHeader.tsx                      (Updated with bell)
├── app/
│   ├── (admin)/
│   │   └── layout.tsx                       (Provider wrapper)
│   └── api/admin/notifications/
│       ├── route.ts                         (GET notifications)
│       ├── [id]/route.ts                    (PATCH/DELETE)
│       └── mark-all-read/route.ts           (PATCH all)
└── app/api/support/ticket/
    └── route.ts                             (Creates notifications)
```

## Environment Variables & Configuration

No additional environment variables needed. Uses existing Prisma configuration and database.

## Testing

### Manual Testing Steps:
1. Log in as admin
2. Open admin dashboard
3. Have a customer submit a support ticket
4. Observe notification appears in bell icon with count
5. Click bell to see dropdown
6. Verify customer details are shown
7. Test marking as read, marking all as read, delete, navigate
8. Verify dropdown closes on outside click

### API Testing:
```bash
# Get all notifications
curl http://localhost:3000/api/admin/notifications

# Mark notification as read
curl -X PATCH http://localhost:3000/api/admin/notifications/[id]/read

# Delete notification
curl -X DELETE http://localhost:3000/api/admin/notifications/[id]

# Mark all as read
curl -X PATCH http://localhost:3000/api/admin/notifications/mark-all-read
```

## Performance Considerations

- **Indexes:** Created on `read` and `createdAt` for fast queries
- **Polling:** 10-second interval balances real-time feel with server load
- **Automatic cleanup:** Admins can manually delete notifications
- **Unread count:** Computed server-side to ensure accuracy

## Future Enhancements

1. **WebSocket Integration:** Replace polling with real-time WebSocket for instant notifications
2. **Email Notifications:** Send email alerts to admins for urgent tickets
3. **Notification Preferences:** Allow admins to configure notification settings
4. **Sound/Desktop Alerts:** Add audio and browser notifications
5. **Notification History:** Archive old notifications for audit trail
6. **Priority Levels:** Show high-priority tickets differently
7. **Search/Filter:** Add filters for notification types and date ranges

## Dependencies

- Prisma ORM (existing)
- React hooks (existing)
- Next.js API routes (existing)
- Lucide React icons (existing)
