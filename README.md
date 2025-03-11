# ClassTeamUp 

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

ClassTeamUp is a modern web application designed to streamline the team formation process in educational settings. Built for instructors and students, it automatically creates optimal teams based on skills, preferences, and availability.

## 🚀 Current Status

ClassTeamUp is currently in active development with the following features completed:

- ✅ User authentication with Supabase
- ✅ Student profile creation and skill management
- ✅ Team formation algorithm for instructors
- ✅ Student and instructor dashboards
- ✅ Team membership management
- ✅ Visual skill representation with proficiency levels
- ✅ Team viewing functionality for students and instructors
- 🔄 Notification system (Planned - see roadmap below)

## ✨ Features

### For Instructors
- **Smart Team Formation** - Create balanced teams based on student skills and preferences
- **Customizable Rules** - Set team size, required skills, and diversity preferences
- **Team Management** - View all teams and their compositions in one place

### For Students
- **Skill Profiles** - Showcase skills with proficiency levels
- **Team Discovery** - Find teammates with complementary skills
- **Availability Settings** - Set your availability for team meetings
- **Team Dashboard** - View your team and connect with teammates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher) or [Yarn](https://yarnpkg.com/) (v1.22 or higher)
- [Git](https://git-scm.com/) for cloning the repository

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GGP0615/classteamup.git
cd classteamup
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

### Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com/)

2. Copy the `.env.example` file to create a new `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the Application

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔧 Database Setup

ClassTeamUp uses a Supabase database with the following tables:

- `users` - Store user profiles (students and instructors)
- `courses` - Information about academic courses
- `course_enrollments` - Student enrollments in courses
- `skills` - Catalogue of available skills
- `student_skills` - Junction table for user skills and proficiency levels
- `teams` - Created teams information
- `team_members` - Members assigned to teams
- `team_formation_rules` - Rules for team formation
- `team_required_skills` - Skills required for specific teams

### Planned Database Additions

As part of our roadmap, we're planning to add:

- `notifications` - User notification management
- `team_invitations` - Team invitation management

## 🗺️ Implementation Roadmap

### Recently Completed

- **UI/UX Enhancements**
  - Improved team view interface with skill visualization
  - Added profile completion indicators
  - Enhanced dashboard layouts for better usability

- **Team Management**
  - Fixed team member display in student dashboard
  - Added team formation visualization
  - Implemented team member skill displays

### Currently In Development

- **Notification System**
  - Database schema design for notifications
  - Backend API for notification management 
  - Frontend components for notification display
  - Integration points for team events

### Next Up

- **Real-time Updates**
  - Implement real-time student availability tracking
  - Add live notifications for team assignments

- **Enhanced Team Formation**
  - Add machine learning algorithms for better team matching
  - Create team formation templates for recurring use

## 👩‍🏫 Using ClassTeamUp

### For Instructors

1. **Sign Up / Sign In**:
   - Create an account as an instructor or sign in with your credentials
   - You'll be directed to the instructor dashboard

2. **Team Formation**:
   - Navigate to the "Team Formation" section
   - Set team formation rules including:
     - Minimum and maximum team size
     - Required skills for teams
     - Skill diversity preferences
   - Click "Form Teams Now" to create balanced teams

3. **Manage Teams**:
   - View all formed teams in the "Teams" section
   - See team member details including skills and contact information

### For Students

1. **Create Your Profile**:
   - Sign up as a student
   - Complete your profile with:
     - Personal information
     - Skills and proficiency levels
     - Availability for team meetings

2. **Find a Team**:
   - Toggle your "Looking for Team" status to make yourself available
   - Browse other students to find potential teammates

3. **Team Dashboard**:
   - Once assigned to a team, view your team details
   - See teammate information and skills
   - Browse skill visualizations with proficiency levels

## 🛠️ Technology Stack

- **Frontend**:
  - [Next.js](https://nextjs.org/) - React framework
  - [TypeScript](https://www.typescriptlang.org/) - Type safety
  - [TailwindCSS](https://tailwindcss.com/) - Styling

- **Backend**:
  - [Supabase](https://supabase.com/) - Database and Authentication
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless functions

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the code style guidelines.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - [gnanendraprasadgopi0615@gmail.com](mailto:gnanendraprasadgopi0615@gmail.com)

Project Link: [https://github.com/GGP0615/classteamup](https://github.com/GGP0615/classteamup)

---

Made with ❤️ by G
