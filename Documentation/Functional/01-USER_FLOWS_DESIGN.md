# 🎨 User Flow & Journey with Wireframes

## Citizen Concern Platform - Australia & New Zealand

### Table of Contents

1. [User Personas](#user-personas)
2. [Citizen User Flows](#citizen-user-flows)
3. [Officer User Flows](#officer-user-flows)
4. [Admin User Flows](#admin-user-flows)
5. [Screen Wireframes](#screen-wireframes)

---

## User Personas

### **1. Sarah - Urban Citizen (Primary)**

- **Age**: 32, Marketing Manager
- **Location**: Melbourne, VIC
- **Tech Savvy**: High
- **Device**: iPhone 14, MacBook
- **Goals**: Quick issue reporting, track progress
- **Pain Points**: Busy schedule, wants transparency

### **2. Bob - Rural Citizen**

- **Age**: 58, Farmer
- **Location**: Rural NSW
- **Tech Savvy**: Medium
- **Device**: Android phone, limited data
- **Goals**: Report infrastructure issues
- **Pain Points**: Slow internet, complex interfaces

### **3. Maria - Officer**

- **Age**: 28, Council Officer
- **Location**: Auckland, NZ
- **Tech Savvy**: High
- **Device**: Council laptop, tablet
- **Goals**: Efficient case management
- **Pain Points**: High workload, manual processes

### **4. David - Department Head**

- **Age**: 45, Infrastructure Manager
- **Location**: Sydney, NSW
- **Tech Savvy**: Medium
- **Device**: Desktop, mobile
- **Goals**: Team performance, resource allocation
- **Pain Points**: Reporting overhead, decision making

---

## Citizen User Flows

### **Flow 1: New User Registration**

```
Landing Page → Register Button → Registration Form → Email Verification → Welcome/Onboarding → Dashboard
```

**Screen Details:**

**1.1 Landing Page**

- Hero section with value proposition
- "Report a Concern" CTA button
- "Login" and "Register" buttons
- Features overview with icons
- Testimonials from other councils
- Mobile-responsive design

**1.2 Registration Form**

- Clean, minimal form design
- Progressive disclosure (step-by-step)
- Real-time validation
- Password strength indicator
- Terms & Privacy links
- Social login options (optional)

**1.3 Email Verification**

- Check email illustration
- Resend email option
- Clear next steps

**1.4 Onboarding (3 screens)**

- Screen 1: "Report Issues Easily" - Photo + GPS explanation
- Screen 2: "Track Progress" - Timeline visualization
- Screen 3: "Community Impact" - Voting and engagement
- Skip option for experienced users

### **Flow 2: Submit New Concern (Core Flow)**

```
Dashboard → Submit Concern → Location Selection → Photo Capture → Description → Category → Review → Confirmation → Tracking
```

**Screen Details:**

**2.1 Submit Concern Entry**

- Large "Submit New Concern" button
- Quick access from navigation
- Voice input option prominently displayed

**2.2 Location Selection**

- Map interface with current location pin
- "Use Current Location" button
- Manual address entry option
- Location accuracy indicator
- Privacy note about GPS usage

**2.3 Photo Capture**

- Camera viewfinder interface
- Capture button (large, thumb-friendly)
- Gallery selection option
- Multiple photo support
- Photo preview with delete option
- "Skip Photos" option

**2.4 Description Input**

- Large text area
- Voice-to-text button
- Character counter
- Helpful prompts/examples
- "What happened?" guidance text

**2.5 Category Selection**

- Grid of category icons
- Search/filter categories
- "Other" option with text input
- Category descriptions on tap

**2.6 Review Screen**

- All information summary
- Edit buttons for each section
- Privacy settings (Anonymous option)
- Urgency level selector

**2.7 Confirmation**

- Success animation
- Unique tracking number (large, copyable)
- "What happens next" timeline
- Share button
- "Submit Another" option

### **Flow 3: Track Concerns**

```
Dashboard → Track Concerns → Concern List → Individual Concern → Status Details → Comments → Actions
```

**Screen Details:**

**3.1 Track Concerns List**

- Card-based layout
- Status indicators (color-coded)
- Search and filter options
- Sort by date, status, category
- Pull-to-refresh

**3.2 Individual Concern Detail**

- Photo gallery at top
- Status timeline (visual progress)
- Officer comments section
- Community voting display
- Location map
- Related concerns nearby

**3.3 Actions Available**

- Add comment/update
- Share concern
- Mark as resolved (if applicable)
- Report inappropriate response

### **Flow 4: Discover Nearby Concerns**

```
Dashboard → Nearby Concerns → Location Permission → Map View → Filter Options → Concern Details → Vote/Comment
```

**Screen Details:**

**4.1 Location Permission Request**

- Clear explanation of why location is needed
- Benefits of sharing location
- "Allow" / "Skip" options
- Manual location entry alternative

**4.2 Map View**

- Interactive map with concern markers
- Color-coded by category/status
- Cluster markers for multiple concerns
- Distance radius selector
- List/Map toggle button

**4.3 Filter Interface**

- Category chips (multi-select)
- Distance slider
- Status filters
- Sort options (distance, date, votes)
- Clear filters button

**4.4 Concern Cards**

- Preview image
- Title and brief description
- Distance indicator
- Vote count and status
- "View Details" button

**4.5 Voting Interface**

- Large vote button
- Vote count display
- "This affects me too" messaging
- Login prompt if not authenticated

### **Flow 5: Profile Management**

```
Dashboard → Profile → Edit Information → Save Changes → Notification Settings → Privacy Settings
```

**Screen Details:**

**5.1 Profile Overview**

- Avatar placeholder/upload
- User information display
- Statistics (concerns submitted, resolved)
- Achievement badges (optional)

**5.2 Edit Profile Form**

- Form fields with current values
- Photo upload with crop tool
- Validation and error handling
- Save/Cancel buttons

**5.3 Settings Sections**

- Notification preferences
- Privacy settings
- Account management
- App preferences

---

## Officer User Flows

### **Flow 6: Officer Dashboard & Case Management**

```
Login → Officer Dashboard → Assigned Concerns → Case Details → Status Update → Add Comments → Notify Citizen
```

**Screen Details:**

**6.1 Officer Dashboard**

- Key metrics cards (assigned, in-progress, resolved)
- Quick actions toolbar
- Recent activity feed
- Performance indicators
- Search functionality

**6.2 Assigned Concerns List**

- Table/card hybrid layout
- Priority indicators
- Due date warnings
- Bulk action options
- Advanced filtering

**6.3 Case Management Detail**

- Full concern information
- Citizen contact details
- Internal notes section
- Status change workflow
- Assignment options

**6.4 Status Update Flow**

- Status dropdown with reasons
- Progress percentage slider
- Required comment field
- Photo attachments for updates
- Notification preview

### **Flow 7: Officer Profile & Performance**

```
Dashboard → Profile → Personal Information → Department Details → Performance Metrics → Work History
```

**Screen Details:**

**7.1 Officer Profile Dashboard**

- Photo and basic info
- Current assignments overview
- Quick actions menu
- Performance summary

**7.2 Performance Metrics**

- Resolution time charts
- Citizen satisfaction ratings
- Workload distribution
- Department comparisons

---

## Admin User Flows

### **Flow 8: Admin Analytics Dashboard**

```
Login → Admin Dashboard → System Overview → Detailed Analytics → Report Generation → User Management
```

**Screen Details:**

**8.1 Admin Dashboard**

- System-wide KPI cards
- Geographic heat map
- Trend charts
- Department performance
- Alert notifications

**8.2 Analytics Deep Dive**

- Interactive charts and graphs
- Date range selectors
- Export options
- Drill-down capabilities
- Comparative analysis

**8.3 User Management**

- User list with roles
- Add/edit user forms
- Permission management
- Bulk operations
- Audit trail

### **Flow 9: System Configuration**

```
Settings → System Configuration → Category Management → Department Setup → Workflow Configuration → Integration Settings
```

---

## Screen Wireframes

### **Mobile Screens (375px width)**

#### **Citizen Screens:**

**Home/Dashboard:**

```
┌─────────────────┐
│   🏛️ CitizenApp │ ← Header with logo
├─────────────────┤
│ Welcome, Sarah  │ ← Personalized greeting
├─────────────────┤
│ [📝 Report Now] │ ← Primary CTA button (large)
├─────────────────┤
│ Quick Stats:    │
│ • 3 Active      │ ← User's concerns summary
│ • 1 Resolved    │
├─────────────────┤
│ Recent Activity │
├─────────────────┤
│ [📍] Pothole    │ ← Recent concern cards
│ 123 Main St     │
│ Status: Progress│
├─────────────────┤
│ [🚧] Traffic    │
│ King St         │
│ Status: Resolved│
└─────────────────┘
```

**Submit Concern - Step 1 (Location):**

```
┌─────────────────┐
│ ← Submit Concern│ ← Back button + title
├─────────────────┤
│ Step 1 of 4     │ ← Progress indicator
├─────────────────┤
│                 │
│    📍 MAP       │ ← Interactive map
│     VIEW        │
│                 │
├─────────────────┤
│ 📍 Your Location│
│ 123 Collins St  │ ← Current address
│ Melbourne, VIC  │
├─────────────────┤
│ [Use Location]  │ ← Primary button
│ [Enter Manually]│ ← Secondary button
└─────────────────┘
```

**Submit Concern - Step 2 (Photo):**

```
┌─────────────────┐
│ ← Submit Concern│
├─────────────────┤
│ Step 2 of 4     │
├─────────────────┤
│                 │
│   📸 CAMERA     │ ← Camera viewfinder
│    PREVIEW      │
│                 │
├─────────────────┤
│    ( 📸 )       │ ← Large capture button
├─────────────────┤
│ [📁] [🎤] [→]   │ ← Gallery, Voice, Skip
└─────────────────┘
```

#### **Officer Screens:**

**Officer Dashboard:**

```
┌─────────────────┐
│ Officer Portal  │
├─────────────────┤
│ Maria Santos    │ ← Officer name
│ Infrastructure  │ ← Department
├─────────────────┤
│ ┌─────┐ ┌─────┐ │
│ │  12 │ │  8  │ │ ← Metrics cards
│ │Assgn│ │Prog │ │
│ └─────┘ └─────┘ │
├─────────────────┤
│ ┌─────┐ ┌─────┐ │
│ │  4  │ │  2  │ │
│ │Resol│ │Urgnt│ │
│ └─────┘ └─────┘ │
├─────────────────┤
│ Recent Concerns │
├─────────────────┤
│ [🚧] #2034      │ ← Concern list items
│ Road damage     │
│ High Priority   │
│ Due: Tomorrow   │
└─────────────────┘
```

### **Desktop Screens (1200px width)**

#### **Admin Dashboard:**

```
┌─────────────────────────────────────────────────────────┐
│ 🏛️ Admin Portal                          [User] [⚙️]    │ ← Header
├─────────────────────────────────────────────────────────┤
│ System Overview - Melbourne City Council                │
├─────────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │  234  │ │  156  │ │   45  │ │   23  │ │  89%  │      │ ← KPI Cards
│ │ Total │ │Active │ │Resolvd│ │Overdue│ │ Satis │      │
│ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │                     │ │                             │ │
│ │    📊 TRENDS        │ │        🗺️ HEAT MAP         │ │ ← Charts
│ │     CHART           │ │                             │ │
│ │                     │ │                             │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Recent Activity                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [📝] New concern #2035 - Pothole on Collins St     │ │ ← Activity Feed
│ │ [✅] Concern #2030 resolved by Officer Johnson     │ │
│ │ [📊] Monthly report generated                       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```
