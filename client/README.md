# Stroke App - Communication Assistant

A Progressive Web App (PWA) designed to help stroke patients communicate effectively by storing contacts, phrases, foods, and emergency information locally on their device.

## 🚀 Features

- **Offline-First**: All data stored locally using IndexedDB
- **PWA Support**: Install as a mobile app on any device
- **Emergency Information**: Quick access to emergency contacts and medical information
- **Contact Management**: Store and organize important contacts
- **Phrase Library**: Common phrases for communication
- **Food Preferences**: Track food likes/dislikes and dietary needs
- **Image Support**: Upload and store images for contacts and items
- **Mobile Optimized**: Touch-friendly interface with accessibility features

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB with Dexie.js
- **PWA**: Vite PWA Plugin with Workbox
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📱 PWA Features

- Installable on mobile devices
- Offline functionality
- App-like experience
- Push notifications (future)
- Background sync (future)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd local-strokeapp/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - For mobile testing, use your local IP address

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
client/
├── public/                 # Static assets
│   ├── image/             # App images
│   └── emergency.json     # Initial emergency data
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## 🎨 Customization

### Colors

The app uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue shades for main UI elements
- **Emergency**: Red shades for emergency features
- **Success**: Green shades for positive actions
- **Warning**: Orange/yellow shades for warnings

### Fonts

- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono

### Mobile Optimizations

- Touch targets minimum 44px
- Safe area insets for notched devices
- Prevent zoom on input focus
- Overscroll behavior control

## 🔧 Configuration Files

### Vite Configuration (`vite.config.js`)
- React plugin setup
- PWA plugin with Workbox
- Build optimization
- Development server settings

### Tailwind Configuration (`tailwind.config.js`)
- Custom color palette
- Typography settings
- Animation keyframes
- Mobile-first utilities
- Custom plugins

### PostCSS Configuration (`postcss.config.js`)
- Tailwind CSS processing
- Autoprefixer for browser compatibility

## 📊 Database Schema

The app uses IndexedDB with the following stores:

- **emergencies**: Emergency body parts and symptoms
- **contacts**: Contact information with relationships
- **foods**: Food preferences and categories
- **phrases**: Communication phrases
- **orders**: Order management (future)
- **activities**: Activity tracking (future)

## 🔒 Data Privacy

- All data is stored locally on the user's device
- No data is sent to external servers
- Images are converted to Base64 and stored locally
- Data can be exported/imported as JSON files

## 🚨 Emergency Features

- Quick access to emergency numbers (911, 999)
- Body part selection for symptom identification
- Emergency contact buttons
- Offline access to all emergency information

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Customize the name and tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Tap "Add"

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint with custom rules for:
- React best practices
- Code quality
- Consistent formatting
- Accessibility considerations

## 🔮 Future Features

- [ ] Push notifications
- [ ] Background sync
- [ ] Voice commands
- [ ] Speech-to-text
- [ ] Multi-language support
- [ ] Cloud backup (optional)
- [ ] Family member access
- [ ] Medical history tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Note**: This app is designed for medical communication assistance. Always consult with healthcare professionals for medical advice. 