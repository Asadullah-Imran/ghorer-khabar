# Support Ticket System

## Overview
Complete support ticket system with order number tracking and automated email resolution notifications.

## User Flow (Customer Side)

### 1. Submit Support Ticket
**Location**: `/support` page

**Features**:
- Topic selection dropdown: Order Issue, Payment Issue, Feedback, Other
- **Order Number Field**: Automatically appears when "Order Issue" is selected
- Message textarea for detailed description
- Real-time validation

**Order Issue Flow**:
1. User selects "Order Issue" from topic dropdown
2. Order number field appears with validation
3. User enters order number (found in "My Orders" or order confirmation email)
4. User describes the issue in detail
5. System validates and submits ticket

**API**: `POST /api/support/ticket`
```json
{
  "topic": "Order Issue",
  "orderNumber": "cm4vg3h5w0000...",
  "message": "Detailed description of the issue"
}
```

## Admin Flow (Admin Dashboard)

### 2. View Support Tickets
**Location**: `/admin/support` page

**Features**:
- Real-time list of all support tickets
- Status badges: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- Search by topic, message, order number, or customer email
- Filter by status
- Order number display (shortened) for Order Issue tickets

### 3. Resolve Ticket & Send Email
**Admin Actions**:
1. Click on any ticket to view full details
2. See customer information (name, email, order number)
3. Read original message
4. Type response in "Admin Response" textarea
5. Click "Resolve & Send Email" button

**What Happens**:
1. Ticket status updated to "RESOLVED"
2. Admin response saved to database
3. Automated email sent to customer with:
   - Original ticket details
   - Order number (if applicable)
   - Admin's response
   - Professional formatting

**API**: `PATCH /api/admin/support/tickets`
```json
{
  "ticketId": "ticket_id",
  "status": "RESOLVED",
  "adminReply": "Admin's detailed response",
  "resolvedBy": "admin_user_id"
}
```

## Email Template
When admin resolves a ticket, customer receives:
- **Subject**: "Support Ticket Resolved: [Topic]"
- **Content**:
  - Ticket status badge (RESOLVED)
  - Original ticket details (topic, order number, message)
  - Admin response in highlighted box
  - Link to support center

## Database Schema

### SupportTicket Model
```prisma
model SupportTicket {
  id           String               @id @default(cuid())
  userId       String?              @map("user_id")
  topic        String
  orderNumber  String?              @map("order_number")
  message      String
  status       SupportTicketStatus  @default(OPEN)
  adminReply   String?              @map("admin_reply")
  resolvedAt   DateTime?            @map("resolved_at")
  resolvedBy   String?              @map("resolved_by")
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  user         User?                @relation(fields: [userId], references: [id])
}

enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

## Files Modified/Created

### Frontend
1. **`src/components/support/SupportInteractions.tsx`**
   - Added conditional order number field
   - Form validation
   - API integration

2. **`src/app/(admin)/admin/support/page.tsx`**
   - Complete redesign for ticket management
   - Admin resolution interface
   - Email sending confirmation

### Backend
3. **`src/app/api/support/ticket/route.ts`** (NEW)
   - POST: Create support ticket
   - GET: Fetch user's tickets

4. **`src/app/api/admin/support/tickets/route.ts`** (NEW)
   - GET: Fetch all tickets (admin)
   - PATCH: Update ticket status & send email
   - DELETE: Delete ticket

5. **`src/lib/email/emailService.ts`**
   - Added `sendSupportTicketResolutionEmail()` function
   - Professional HTML email template

### Database
6. **`prisma/schema.prisma`**
   - Added `SupportTicket` model
   - Added `SupportTicketStatus` enum
   - Added relation to `User` model

## Testing Checklist

### User Side
- [ ] Visit `/support`
- [ ] Select "Order Issue" → Order number field appears
- [ ] Submit without order number → Validation error
- [ ] Submit with valid data → Success message
- [ ] Select "Other" topic → No order number field

### Admin Side
- [ ] Visit `/admin/support`
- [ ] See all submitted tickets
- [ ] Filter by status (OPEN, RESOLVED)
- [ ] Search by order number
- [ ] Click ticket to view details
- [ ] Type admin response
- [ ] Click "Resolve & Send Email"
- [ ] Verify ticket status changes to RESOLVED
- [ ] Check email sent to customer

### Email Verification
- [ ] Customer receives email
- [ ] Email shows original message
- [ ] Email shows admin response
- [ ] Email formatting is professional
- [ ] All links work

## Environment Variables Required
Make sure these are set in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage Tips

### For Customers
- Always select the correct topic
- For order issues, have your order number ready
- Be specific in your message
- Check email for admin response

### For Admins
- Respond within 24 hours
- Be professional and helpful
- Include actionable steps in response
- Mark as RESOLVED when done

## Future Enhancements
- [ ] Auto-fetch order details from order number
- [ ] Internal notes (admin-only)
- [ ] Ticket priority levels
- [ ] Automated responses for common issues
- [ ] Customer satisfaction rating after resolution
- [ ] Support ticket analytics dashboard
