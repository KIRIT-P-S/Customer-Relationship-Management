# AI CRM — Complete Feature Documentation

**Product:** AI-Powered Customer Relationship Management System
**Stack:** React + Vite + Tailwind (Frontend) | Node.js + Express + MongoDB (Backend) | Gemini AI
**Version:** 1.0.0

---

## USER ROLES

| Role     | Access Level                                      |
|----------|---------------------------------------------------|
| Admin    | Full access to all features + Admin Panel         |
| Agent    | CRM features, assigned complaints, no Admin Panel |
| Customer | Support portal only                               |

---

## 1. AUTHENTICATION (All Users)

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Register             | Sign up with name, email, password, role selection       |
| Role Selection       | Choose Admin / Agent / Customer at registration          |
| Agent Skills         | Agents add skills (billing, technical, sales, etc.)      |
| Login                | Email + password login with JWT token                    |
| JWT Auth             | Token stored in localStorage, auto-attached to all APIs  |
| Auto Logout          | 401 response clears token and redirects to login         |
| Protected Routes     | All pages redirect to login if not authenticated         |
| Token Expiry         | Tokens expire after 7 days                               |

---

## 2. ADMIN PORTAL

### 2.1 Dashboard (/)
| Feature                | Description                                            |
|------------------------|--------------------------------------------------------|
| KPI Cards              | Total Customers, Active Leads, Pending Tasks, Churn Risk, Active Customers, Lead Conversion % |
| Quick Actions          | One-click buttons to Add Customer, Lead, Task, Analytics |
| Customer Growth Chart  | Line chart showing monthly customer growth (6 months)  |
| Activity Feed          | Real-time log of recent CRM actions                    |
| AI Chat                | Gemini-powered assistant on dashboard                  |
| Date Greeting          | Personalized welcome with current date                 |

### 2.2 Customers (/customers)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| List All Customers   | Table with name, email, phone, company, status           |
| Add Customer         | Form with name, email, phone, company, status fields     |
| Edit Customer        | Inline edit form pre-filled with existing data           |
| Delete Customer      | Confirm dialog before deletion                           |
| Search               | Real-time search by name, email, or company              |
| Filter by Status     | Filter Active / Inactive / At Risk                       |
| Status Badges        | Color-coded: green (Active), red (At Risk), gray (Inactive) |
| Notes Panel          | Click any row to open slide-in notes panel               |
| Add Notes            | Add timestamped notes per customer                       |
| View Notes           | See all notes with author name and date                  |
| Export CSV           | Download all customers as CSV file                       |
| Customer Count       | Live count shown in header                               |

### 2.3 Leads (/leads)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| List All Leads       | Table with name, email, phone, source, status            |
| Add Lead             | Form with all lead fields                                |
| Edit Lead            | Pre-filled edit form                                     |
| Delete Lead          | Confirm before delete                                    |
| Search               | Real-time search by name, email, source                  |
| Status Filter Cards  | Clickable stat cards: New, Contacted, Qualified, Lost    |
| Quick Status Update  | Inline dropdown to change status without opening form    |
| Status Badges        | Color-coded per status                                   |
| Export CSV           | Download leads as CSV                                    |
| Lead Count           | Live count in header                                     |

### 2.4 Sales Pipeline (/pipeline)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Kanban Board         | 5 columns: Prospecting, Proposal, Negotiation, Closed Won, Closed Lost |
| Add Deal             | Title, value ($), stage, expected close date, probability %, notes |
| Edit Deal            | Update any deal field                                    |
| Delete Deal          | Remove deal from pipeline                                |
| Drag & Drop          | Drag cards between stage columns                         |
| Quick Stage Move     | Dropdown on each card to change stage                    |
| Won Revenue          | Live total of all Closed Won deal values                 |
| Weighted Pipeline    | Sum of (value × probability%) for open deals            |
| Per-Column Totals    | Count and total value shown per stage column             |
| Deal Cards           | Show value, probability, expected close, notes           |

### 2.5 Tasks (/tasks)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| List All Tasks       | Table with title, description, due date, status          |
| Add Task             | Title, description, due date, status                     |
| Edit Task            | Pre-filled edit form                                     |
| Delete Task          | Confirm before delete                                    |
| Search               | Real-time search by title or description                 |
| Status Filter Cards  | Clickable: Pending, In Progress, Done                    |
| Quick Status Update  | Inline dropdown per row                                  |
| Overdue Highlight    | Red background + "OVERDUE" badge for past-due tasks      |
| Status Badges        | Yellow (Pending), Blue (In Progress), Green (Done)       |
| Export CSV           | Download tasks as CSV                                    |

### 2.6 Calendar (/calendar)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Monthly Grid View    | Full calendar grid with day cells                        |
| Task Display         | Tasks shown on their due date, color-coded by status     |
| Reminder Display     | Reminders shown with 🔔 icon on their date               |
| Navigate Months      | Previous / Next month buttons                            |
| Today Highlight      | Today's date highlighted in blue circle                  |
| Jump to Today        | "Today" button to return to current month                |
| Overflow Indicator   | "+N more" shown when day has many items                  |
| Color Legend         | Yellow=Pending, Blue=In Progress, Green=Done, Purple=Reminder |

### 2.7 Reminders (/reminders)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Add Reminder         | Title, type, date/time, related contact, description     |
| Reminder Types       | Task, Follow-up, Meeting, Call, Other                    |
| Due Now Section      | Red-highlighted section for overdue reminders            |
| Upcoming Section     | Future reminders sorted by date                          |
| Completed Section    | Archive of marked-done reminders                         |
| Mark as Done         | One-click to mark reminder complete                      |
| Delete Reminder      | Remove reminder permanently                              |
| Live Badge           | Sidebar shows red count badge for due reminders          |
| Auto Polling         | Badge refreshes every 60 seconds automatically           |

### 2.8 Complaints (/complaints)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| View All Complaints  | All complaints from all customers (Admin view)           |
| AI Summary           | Gemini-generated one-line summary per complaint          |
| Category Display     | billing, technical, sales, general, refund, delivery     |
| Sentiment Display    | positive, neutral, negative, urgent with color coding    |
| Assigned Agent       | Shows which agent is handling each complaint             |
| Status Update        | Dropdown to change Open → In Progress → Resolved         |
| Customer Info        | Shows customer name linked to complaint                  |
| Date Logged          | Timestamp of when complaint was submitted                |

### 2.9 AI Email Composer (/email)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Email Types          | Follow-up, Sales Proposal, Welcome, Re-engagement, Complaint Response |
| AI Generation        | Gemini writes full professional email draft              |
| Recipient Name       | Personalizes email with recipient's name                 |
| Context Input        | Add key points / context for more relevant emails        |
| Editable Draft       | Edit the generated email before sending                  |
| Copy to Clipboard    | One-click copy of full email                             |
| Open in Mail App     | mailto link opens default email client with pre-filled content |
| Regenerate           | Generate a different version of the same email           |

### 2.10 Analytics (/analytics) — Admin Only
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Lead Conversion Rate | % of leads that reached Qualified status                 |
| Task Completion Rate | % of tasks marked Done                                   |
| Complaint Resolution | % of complaints marked Resolved                          |
| Estimated Revenue    | Active customers × avg deal size                         |
| Customer Growth Chart| Line chart — monthly new customers (6 months)            |
| Lead Sources Pie     | Pie chart of leads by source                             |
| Performance Bar Chart| Bar chart comparing all 3 KPI rates                      |
| Activity Feed        | Last 20 CRM actions with timestamps                      |

### 2.11 Admin Panel (/admin) — Admin Only
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| System Stats         | Total users, customers, leads, tasks, complaints         |
| Users by Role        | Count breakdown: Admin / Agent / Customer                |
| User Table           | All users with name, email, role, skills, join date      |
| Change User Role     | Inline dropdown to change any user's role                |
| Delete User          | Remove any user (cannot delete self)                     |

### 2.12 AI Chat Assistant (Dashboard)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Natural Language     | Ask questions about your CRM data in plain English       |
| Action Execution     | AI creates tasks, customers, leads from chat commands    |
| Create Task          | "Add task: follow up with John tomorrow"                 |
| Create Customer      | "Create customer: Jane Doe email: jane@acme.com"         |
| Create Lead          | "Add lead: Mike Smith from referral"                     |
| Update Task Status   | "Mark the follow-up task as done"                        |
| CRM Context          | AI knows your current data counts and names              |
| Action Feedback      | Green bubble confirms when action was performed          |
| Voice Input          | 🎤 button for voice-to-text commands (Chrome)            |
| Fallback Mode        | Works with basic commands even without Gemini API key    |
| Dashboard Refresh    | Stats auto-refresh after AI performs an action           |

---

## 3. AGENT PORTAL

Agents see all Admin features **except**:
- ❌ Analytics page
- ❌ Admin Panel

Agents see **only their assigned complaints** in the Complaints page.

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Dashboard            | Same KPI dashboard as Admin                              |
| Customers            | Full CRUD + search + notes + CSV export                  |
| Leads                | Full CRUD + search + filter + CSV export                 |
| Pipeline             | Full Kanban board access                                 |
| Tasks                | Full CRUD + overdue alerts + calendar                    |
| Calendar             | Monthly view of tasks and reminders                      |
| Reminders            | Full reminder management                                 |
| My Complaints        | Only complaints assigned to this agent                   |
| Status Updates       | Can update complaint status (Open → In Progress → Resolved) |
| Email AI             | Full AI email composer access                            |
| AI Chat              | Full AI assistant with action execution                  |
| Profile              | Edit name, phone, skills, expertise                      |
| Settings             | Profile, security, preferences tabs                      |

---

## 4. CUSTOMER PORTAL (/portal)

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Submit Complaint     | Text area to describe issue                              |
| Voice Input          | 🎤 Speak complaint — auto-transcribed via Web Speech API |
| AI Analysis          | Gemini analyses complaint: category, sentiment, summary  |
| Auto Assignment      | AI matches complaint to best-skilled agent automatically |
| Assignment Result    | Shows which agent was assigned after submission          |
| Category Display     | billing, technical, sales, general, refund, delivery     |
| Sentiment Display    | positive, neutral, negative, urgent                      |
| AI Summary           | One-sentence summary of the complaint                    |
| My Complaints List   | View all previously submitted complaints                 |
| Status Tracking      | See Open / In Progress / Resolved status per complaint   |
| Agent Name           | See which agent is handling each complaint               |

---

## 5. SHARED FEATURES (All Roles)

### Profile (/profile)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Edit Name            | Update display name                                      |
| Edit Phone           | Update phone number                                      |
| View Email           | Email shown but cannot be changed                        |
| View Role            | Role shown but cannot be self-changed                    |
| Agent Skills         | Agents can update their skill tags                       |
| Agent Expertise      | Agents can update expertise description                  |
| Save Changes         | Persists to database, updates localStorage               |

### Settings (/settings)
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Profile Tab          | Edit name, phone, skills, expertise                      |
| Security Tab         | Change password UI                                       |
| Preferences Tab      | Toggle notification preferences (email alerts)           |

### UI / UX
| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Collapsible Sidebar  | Toggle sidebar between full (240px) and icon-only (64px) |
| Dark Mode            | Toggle dark/light theme from sidebar                     |
| Role Badge           | User's role shown in sidebar header                      |
| Responsive Layout    | Works on desktop and tablet                              |
| Active Link Highlight| Current page highlighted in sidebar                      |
| Loading States       | Buttons show loading text during API calls               |
| Error Messages       | Inline error display on forms                            |
| Confirm Dialogs      | Confirm before any delete action                         |
| Toast Messages       | Success/error feedback on profile save                   |

---

## 6. BACKEND API ENDPOINTS

| Method | Endpoint                    | Access        | Description                        |
|--------|-----------------------------|---------------|------------------------------------|
| POST   | /api/auth/register          | Public        | Register new user                  |
| POST   | /api/auth/login             | Public        | Login, returns JWT                 |
| GET    | /api/auth/me                | All           | Get current user profile           |
| PUT    | /api/auth/me                | All           | Update profile                     |
| GET    | /api/auth/agents            | All           | List all agents                    |
| GET    | /api/customers              | Admin/Agent   | List customers (search, filter)    |
| POST   | /api/customers              | Admin/Agent   | Create customer                    |
| PUT    | /api/customers/:id          | Admin/Agent   | Update customer                    |
| DELETE | /api/customers/:id          | Admin/Agent   | Delete customer                    |
| GET    | /api/leads                  | Admin/Agent   | List leads (search, filter)        |
| POST   | /api/leads                  | Admin/Agent   | Create lead                        |
| PUT    | /api/leads/:id              | Admin/Agent   | Update lead                        |
| DELETE | /api/leads/:id              | Admin/Agent   | Delete lead                        |
| GET    | /api/tasks                  | Admin/Agent   | List tasks (search, filter)        |
| POST   | /api/tasks                  | Admin/Agent   | Create task                        |
| PUT    | /api/tasks/:id              | Admin/Agent   | Update task                        |
| DELETE | /api/tasks/:id              | Admin/Agent   | Delete task                        |
| GET    | /api/deals                  | Admin/Agent   | List all deals                     |
| POST   | /api/deals                  | Admin/Agent   | Create deal                        |
| PUT    | /api/deals/:id              | Admin/Agent   | Update deal / move stage           |
| DELETE | /api/deals/:id              | Admin/Agent   | Delete deal                        |
| GET    | /api/notes                  | Admin/Agent   | Get notes (by customer or lead)    |
| POST   | /api/notes                  | Admin/Agent   | Add note                           |
| DELETE | /api/notes/:id              | Admin/Agent   | Delete note                        |
| GET    | /api/complaints             | All           | Get complaints (role-filtered)     |
| POST   | /api/complaints             | Customer      | Submit complaint (AI auto-assign)  |
| PUT    | /api/complaints/:id         | Admin/Agent   | Update complaint status            |
| GET    | /api/reminders              | All           | Get user's reminders               |
| GET    | /api/reminders/unread-count | All           | Count of due unread reminders      |
| POST   | /api/reminders              | All           | Create reminder                    |
| PUT    | /api/reminders/:id          | All           | Update / mark read                 |
| DELETE | /api/reminders/:id          | All           | Delete reminder                    |
| GET    | /api/analytics              | Admin/Agent   | Full analytics data                |
| GET    | /api/analytics/activity     | Admin/Agent   | Recent activity log                |
| GET    | /api/admin/users            | Admin only    | All users                          |
| PUT    | /api/admin/users/:id        | Admin only    | Update user role/skills            |
| DELETE | /api/admin/users/:id        | Admin only    | Delete user                        |
| GET    | /api/admin/stats            | Admin only    | System-wide stats                  |
| GET    | /api/ai/insights            | Admin/Agent   | CRM stats for dashboard            |
| POST   | /api/ai/chat                | Admin/Agent   | AI chat + action execution         |
| POST   | /api/email/draft-email      | Admin/Agent   | Generate AI email draft            |
| POST   | /api/email/summarize        | Admin/Agent   | AI summarize text                  |

---

## 7. AI FEATURES SUMMARY

| Feature                  | Technology    | Description                                      |
|--------------------------|---------------|--------------------------------------------------|
| AI Chat Assistant        | Gemini 1.5 Flash | Natural language CRM queries + action execution |
| Action Execution         | Gemini + Backend | Creates tasks/customers/leads from chat         |
| Voice Commands           | Web Speech API   | Voice-to-text for chat and complaints           |
| Complaint Analysis       | Gemini 1.5 Flash | Category, sentiment, summary detection          |
| Auto Agent Assignment    | Gemini 1.5 Flash | Matches complaint to best-skilled agent         |
| AI Email Drafting        | Gemini 1.5 Flash | Generates 5 types of professional emails        |
| Churn Risk Calculation   | Backend Logic    | % of At Risk + Inactive customers               |
| Weighted Pipeline        | Backend Logic    | Deal value × probability for forecasting        |

---

## 8. TECHNOLOGY STACK

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, React Router v7   |
| Charts     | Recharts                                        |
| HTTP       | Axios with JWT interceptor                      |
| Backend    | Node.js, Express 4                              |
| Database   | MongoDB Atlas (free tier), Mongoose             |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| AI         | Google Gemini 1.5 Flash (@google/generative-ai) |
| Voice      | Web Speech API (browser native)                 |
| Deployment | Render (backend), Render Static (frontend)      |

---

*AI CRM — Built with React + Node.js + MongoDB + Gemini AI*
