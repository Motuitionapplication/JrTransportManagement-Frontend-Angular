# JR Transport Management System PWA

A comprehensive Progressive Web Application (PWA) built with Angular 15 for managing transport operations. This system handles vehicle management, driver management, route planning, fleet tracking, and customer service with full offline support.

![JR Transport Management](src/assets/playschool-logo.svg)

## 🚀 Features

- **📱 Progressive Web App (PWA)** - Installable on mobile and desktop devices
- **🔄 Offline Support** - Works without internet connection with data caching
- **� Vehicle Management** - Complete vehicle registration and maintenance tracking
- **👨‍💼 Driver Management** - Driver profiles, licenses, and schedules
- **🛣️ Route Management** - Route planning, optimization, and tracking
- **� Fleet Tracking** - Real-time vehicle location and status monitoring
- **� Customer Service** - Customer profiles, bookings, and communication
- **📊 Analytics Dashboard** - Overview with key metrics and insights
- **🎨 Modern UI** - Beautiful, responsive design with Angular Material
- **⚡ Fast Loading** - Optimized performance with service worker caching

## 🛠️ Technology Stack

- **Frontend**: Angular 15, TypeScript, SCSS
- **UI Components**: Angular Material, Bootstrap, FontAwesome
- **PWA**: Angular Service Worker, Web App Manifest
- **Forms**: Angular Reactive Forms with validation
- **Styling**: Custom CSS with CSS Variables, Flexbox, Grid
- **Build Tools**: Angular CLI, Webpack

## 📱 PWA Features

- **Installable**: Can be installed on mobile and desktop devices
- **Offline-First**: Works without internet connection
- **Background Sync**: Syncs data when connection is restored
- **Push Notifications**: Real-time notifications for important updates
- **Custom Splash Screen**: Branded loading experience
- **Responsive Design**: Optimized for all screen sizes

## 🏗️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v15 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd JRTransportManagement
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Navigate to `http://localhost:4200/`

## 🚀 Building and Deployment

### Development Build
```bash
ng build
```

### Production Build with PWA
```bash
ng build --prod --service-worker
```

### Testing PWA Locally
```bash
# Build the PWA
ng build --prod --service-worker

# Serve locally (required for service worker testing)
npx http-server dist/jr-transport-management -p 8080 -c-1
```

Navigate to `http://localhost:8080` to test the PWA features including offline functionality.

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:pwa` - Build PWA with service worker
- `npm run serve:pwa` - Serve PWA locally for testing
- `npm test` - Run unit tests
- `npm run lint` - Run linting
- `npm run e2e` - Run end-to-end tests

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                 # Core functionality
│   │   └── services/         # Core services (PWA, Offline)
│   ├── shared/               # Shared components
│   │   └── splash-screen/    # Custom splash screen
│   ├── features/             # Feature modules
│   │   ├── dashboard/        # Analytics dashboard
│   │   ├── students/         # Student management
│   │   ├── teachers/         # Teacher management
│   │   ├── classes/          # Class management
│   │   ├── attendance/       # Attendance tracking
│   │   └── communication/    # Parent communication
│   ├── models/               # TypeScript interfaces
│   └── services/             # Application services
├── assets/                   # Static assets
│   ├── icons/                # PWA icons
│   └── transport-logo.svg    # Custom transport logo
├── manifest.webmanifest      # PWA manifest
└── ngsw-config.json          # Service worker configuration
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with custom branding
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: CSS animations and transitions for better UX
- **Loading States**: Visual feedback during data operations
- **Error Handling**: User-friendly error messages and recovery options
- **Accessibility**: WCAG compliant with proper ARIA labels

## 📱 Mobile Experience

- **App-like Experience**: Full-screen mode when installed
- **Touch Optimized**: Large touch targets and gesture support
- **Fast Loading**: Instant loading with service worker caching
- **Offline Notifications**: Clear offline/online status indicators
- **Install Prompt**: Smart install prompts for PWA installation

## 🔧 Development Guidelines

### Code Style
- Follow Angular style guide and best practices
- Use TypeScript strict mode for type safety
- Implement reactive forms for all user inputs
- Use Angular Material components for consistency
- Write unit tests for all components and services

### PWA Development
- Test offline functionality regularly
- Optimize service worker caching strategies
- Monitor PWA performance metrics
- Test installation flows on different devices
- Validate manifest.json configurations

## 🚀 Deployment

### Production Deployment
1. Build the production PWA:
```bash
ng build --prod --service-worker
```

2. Deploy the `dist/jr-transport-management` folder to your web server

3. Ensure HTTPS is enabled (required for PWA features)

4. Configure proper caching headers for optimal performance

### PWA Requirements
- Must be served over HTTPS in production
- Requires valid SSL certificate
- Service worker must be properly registered
- Manifest.json must be accessible and valid

## 📊 Performance

- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Service Worker**: Precaches critical resources
- **Code Splitting**: Lazy-loaded feature modules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the excellent PWA support
- Material Design for the UI components
- Contributors and the open-source community

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for PlaySchool Management by the Development Team**
