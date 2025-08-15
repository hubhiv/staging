# Product Requirements Document (PRD) - HubHiv MVP

## Value Proposition Canvas – HubHiv Home Management Platform

### Customer Profile

#### Customer Jobs (Functional, Social, Emotional)
- **Organize and track home maintenance tasks** in a visual, manageable way
- **Monitor home systems health** (HVAC, plumbing, electrical, etc.) proactively
- **Schedule and coordinate service appointments** without losing track
- **Maintain home value** through proper maintenance and documentation
- **Feel confident and in control** of home management responsibilities
- **Save time** by having all home information in one centralized location

#### Pains
- **Scattered information** about home systems, warranties, and service history
- **Forgotten maintenance tasks** leading to expensive repairs
- **Difficulty tracking** which systems need attention and when
- **Lost documentation** for warranties, service records, and home details
- **Overwhelming complexity** of managing multiple home systems and providers
- **Reactive maintenance** instead of proactive planning

#### Gains
- **Visual task management** with drag-and-drop kanban boards
- **Centralized home profile** with all systems and documentation
- **Proactive maintenance scheduling** with calendar integration
- **Service provider management** with ratings and contact information
- **Health score tracking** for home systems
- **Peace of mind** knowing nothing is forgotten

### Value Map

#### Products & Services (MVP Implementation)
- **Task Management System**: Kanban board with drag-and-drop functionality (To Do → Scheduled → Booked → Complete)
- **Home Profile Management**: Comprehensive home information tracking (address, year built, square footage, etc.)
- **Home Systems Monitoring**: Track HVAC, plumbing, electrical, exterior, windows, and security systems
- **Maintenance Scheduling**: Calendar view for scheduling and tracking maintenance tasks
- **Service Provider Directory**: Manage contact information and ratings for trusted service providers
- **Dashboard Analytics**: Visual metrics for home health scores and maintenance status

#### Pain Relievers (MVP Features)
- **Unified Dashboard**: All home management tasks and information in one location
- **Visual Task Flow**: Kanban board makes it easy to see task status at a glance
- **System Health Tracking**: Proactive monitoring prevents expensive emergency repairs
- **Calendar Integration**: Never miss important maintenance deadlines
- **Provider Management**: Keep trusted service providers organized with ratings and history
- **Mobile-Responsive Design**: Access home information anywhere, anytime

#### Gain Creators (MVP Features)
- **Drag-and-Drop Interface**: Intuitive task management that feels natural
- **Health Score Visualization**: Circular progress indicators show system health at a glance
- **Maintenance Reminders**: Automated tracking of when systems need attention
- **Document Storage**: Keep warranties, manuals, and service records organized
- **Provider Ratings**: Build trust through service provider rating system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## MVP Feature Set (Currently Implemented)

### 🏠 **Core Home Management**
- **Home Profile**: Address, year built, square footage, bedrooms, bathrooms, lot size
- **Health Scores**: Overall home health with individual system scores (HVAC, plumbing, electrical, exterior, security)
- **Document Management**: Upload and organize warranties, manuals, and service records

### 📋 **Task Management System**
- **Kanban Board**: Visual task management with four columns (To Do, Scheduled, Booked, Complete)
- **Drag-and-Drop**: Move tasks between status columns intuitively
- **Task Details**: Comprehensive task information with descriptions, priorities, due dates
- **Task Ratings**: Rate completed services for quality tracking
- **Archive System**: Keep completed tasks organized without cluttering active view

### 🔧 **Home Systems Tracking**
- **System Categories**: HVAC, Plumbing, Electrical, Exterior, Windows, Security
- **System Details**: Brand, installation date, last service, next service due
- **Health Monitoring**: Individual health scores for each system
- **Service History**: Track maintenance and repair history

### 📅 **Calendar & Scheduling**
- **Calendar View**: Month and week views for maintenance scheduling
- **Task Integration**: See scheduled tasks directly on calendar
- **Service Appointments**: Visual scheduling of service provider visits
- **Maintenance Reminders**: Track upcoming and overdue maintenance

### 👷 **Service Provider Management**
- **Provider Directory**: Maintain list of trusted service providers
- **Contact Information**: Phone numbers, service types, last service dates
- **Rating System**: Rate providers based on service quality
- **Service History**: Track which providers serviced which systems

### 📊 **Dashboard & Analytics**
- **Health Score Dashboard**: Visual representation of home system health
- **Maintenance Metrics**: Track upcoming tasks, overdue items, budget status
- **Progress Tracking**: Monitor completion rates and system improvements
- **Quick Actions**: Easy access to common tasks and system management

### 🔐 **Authentication & User Management**
- **User Registration**: Account creation with email and password
- **Secure Login**: JWT-based authentication system
- **Profile Management**: User profile with avatar and preferences
- **Demo Mode**: Showcase functionality without requiring registration

## Technical Architecture (MVP)

### **Frontend Stack**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, modern UI design
- **Context API** for state management
- **Axios** for API communication

### **Component Architecture**
- **Modular Design**: Reusable components with clear separation of concerns
- **Responsive Layout**: Mobile-first design that works on all devices
- **Accessibility**: WCAG-compliant components with proper ARIA labels
- **Performance**: Optimized rendering with React best practices

### **Data Management**
- **TypeScript Interfaces**: Comprehensive type definitions for all data models
- **API Services**: Organized service layer for backend communication
- **State Management**: Context-based state with proper error handling
- **Mock Data**: Development-ready with comprehensive mock data sets

## User Journeys (MVP)

### **New User Onboarding**
1. **Landing Page**: Marketing page with feature overview and pricing
2. **Registration**: Simple email/password registration process
3. **Home Profile Setup**: Enter basic home information and address
4. **System Setup**: Add home systems (HVAC, plumbing, etc.)
5. **First Tasks**: Create initial maintenance tasks

### **Daily Usage**
1. **Dashboard Review**: Check home health scores and upcoming tasks
2. **Task Management**: Move tasks through kanban board as they progress
3. **Calendar Check**: Review scheduled maintenance and appointments
4. **Provider Contact**: Access service provider information when needed

### **Maintenance Workflow**
1. **Task Creation**: Add new maintenance task to "To Do" column
2. **Scheduling**: Move to "Scheduled" when date is set
3. **Booking**: Move to "Booked" when service provider is confirmed
4. **Completion**: Move to "Complete" and rate the service
5. **Documentation**: Update system records with service details

## Success Metrics (MVP)

### **User Engagement**
- **Task Completion Rate**: Percentage of tasks moved to "Complete"
- **System Health Improvement**: Increase in overall home health scores
- **Provider Ratings**: Average rating of service providers
- **Return Usage**: Daily/weekly active users

### **Platform Health**
- **User Registration**: New user sign-ups per month
- **Feature Adoption**: Usage of different platform features
- **Mobile Usage**: Percentage of mobile vs desktop usage
- **Task Volume**: Average number of tasks per user

## Future Roadmap (Post-MVP)

### **Phase 2: Enhanced Features**
- **Booking Integration**: Direct booking with service providers
- **Payment Processing**: Handle payments and invoicing
- **Notification System**: Email/SMS reminders for maintenance
- **Advanced Analytics**: Detailed reporting and insights

### **Phase 3: Community Features**
- **Provider Marketplace**: Vetted service provider network
- **Referral System**: Provider-to-provider referrals
- **Community Boards**: Neighborhood-specific provider recommendations
- **Review System**: Comprehensive provider review platform

## Value Proposition Statement

**HubHiv transforms home management from reactive chaos to proactive control.**

Homeowners gain a comprehensive platform that organizes maintenance tasks, tracks system health, and manages service providers in one intuitive interface. By providing visual task management, proactive maintenance scheduling, and centralized home information, HubHiv helps homeowners maintain their property value, prevent costly repairs, and feel confident in their home management responsibilities.

**The result**: Homeowners save time, reduce stress, and maintain healthier homes through organized, proactive maintenance management.