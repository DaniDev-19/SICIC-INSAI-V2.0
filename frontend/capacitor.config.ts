import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 've.gob.insai.sicic',
  appName: 'SICIC INSAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0d1f18',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d1f18',
      showSpinner: false,
    },
  },
};

export default config;

