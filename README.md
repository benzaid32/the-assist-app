# The Assist App

A nonprofit iOS application connecting people who need assistance with essential bill payments (rent, utilities, tuition) to monthly subscribers who want to make a difference through micro-donations.

![The Assist App](https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg?auto=compress&cs=tinysrgb&w=600)

## Overview

The Assist App is a mobile platform that facilitates direct financial assistance between subscribers and applicants in need. Subscribers contribute monthly donations ($1-$20/month) which are pooled and distributed to randomly selected, verified applicants for rent, utilities, or tuition assistance.

## Features

### For Applicants
- Simple application process with basic identity verification
- Secure document upload for ID, bills, lease, and tuition verification
- Real-time application status tracking with clear indicators
- Comprehensive error handling and loading states
- Professional, minimalist UI with clear instructions

### For Subscribers
- Flexible donation tiers ($1, $5, $20 monthly)
- Premium exclusive content:
  - Impact Dashboard showing personalized impact metrics
  - Premium Resource Library with educational content
  - Community impact tracking with detailed statistics
- Social sharing capabilities for spreading awareness
- Community feed with anonymized thank-you messages
- Seamless subscription management with App Store guidelines compliance

### For Administrators
- Secure document review interface
- Role-based admin controls
- Applicant review and approval workflow
- Manual payout processing
- Enterprise-grade security with Firebase

## Tech Stack

- React Native with Expo (managed workflow)
- Firebase ecosystem:
  - Firebase Authentication for secure user management
  - Firestore for database with enterprise-grade security rules
  - Firebase Storage for secure document uploads
  - Firebase Cloud Functions with robust error handling and rate limiting
  - Type-safe database access with integrity checks
- Stripe API for subscription management with:
  - Server-side validation
  - Subscription integrity monitoring
  - Automated reconciliation with Firestore
  - Rate limiting for security
- React Navigation v7 for app navigation
- Enterprise-grade architecture following MVVM/Clean patterns
- Type-safe styling with strong accessibility support

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Expo CLI
- Firebase CLI (for deployment and local emulation)
- React Native environment set up for iOS development
- Xcode 14+ (for iOS builds)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/the-assist-app.git
cd TheAssistApp
```

2. Install dependencies:
```bash
npm install
# or with yarn
yarn install
```

3. Configure Firebase credentials
   - Create a `.env` file in the root directory
   - Add your Firebase configuration
   - Ensure all environment variables are properly set

4. Run the app with Expo
```bash
npx expo start
```

5. Run on iOS simulator or device
```bash
# Open in iOS simulator
i

# Or scan QR code with Expo Go app on your device
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id

# App Configuration
APP_NAME=TheAssistApp
APP_ENV=development
BUNDLE_ID=org.theassistapp.assistapp

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Project Structure

```
TheAssistApp/
├── src/
│   ├── assets/            # Static assets (images, fonts)
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   └── dashboard/     # Dashboard-specific components
│   ├── constants/         # Constants and theme definitions
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── app/           # Main application screens
│   │   └── auth/          # Authentication screens
│   ├── services/          # Service modules
│   │   └── DocumentUploadService.ts # Document upload service
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── storage.rules          # Firebase Storage security rules
└── firebase.json          # Firebase configuration
```

## Development Guidelines

### Code Style

- Use TypeScript for type safety with no use of `any` type
- Follow enterprise-grade development guidelines
- Use `StyleSheet.create` for styling with consistent naming
- Implement comprehensive error handling for all async operations
- Follow iOS development guidelines for secure data handling

### Components

- Keep components small and focused with a single responsibility
- Use TypeScript interfaces for props with complete type definitions
- Implement proper loading, error, and empty states for all UI components
- Follow the black and white minimalist design scheme

### Navigation

- Use React Navigation v7 with a flat navigator structure
- Register all screens explicitly with proper typing
- Implement robust error handling for all navigation operations
- Use proper state management to prevent updates after component unmounting

### State Management

- Use React Context for global state
- Implement proper data fetching with loading and error states
- Use Firebase for persistent data storage with proper security rules

### Document Upload

- Validate documents for file type and size (max 20MB)
- Implement secure storage with Firebase Storage
- Provide clear status indicators for upload progress
- Handle all error cases with user-friendly messages

## Security Considerations

- All database operations protected by Firebase Security Rules
- Backend validation of document uploads before storage
- Advanced subscription security:
  - Server-side validation against Stripe records
  - Automated integrity checks every 6 hours
  - Rate limiting for subscription endpoints
  - Data consistency validation between systems
- Secure authentication flows with email verification
- HTTPS-only API endpoints
- No sensitive data exposed to clients
- Document access restricted by user role
- Payment processing isolated to secure backend

## Testing

```bash
npm run test
```

## Deployment

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Email: support@theassistapp.org
- Website: https://theassistapp.org