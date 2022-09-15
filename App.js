import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Router } from "./src/navigation/router";
import { setI18nConfig } from 'helpers/utils';
import { AuthProvider } from 'helpers/authProvider';
import { AppProvider } from 'helpers/appProvider';

export default function App() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    // init I18 config
    await setI18nConfig(null, false);
    setIsLoading(false)
  });

  return (
    isLoading ? null :
      <AuthProvider>
        <AppProvider>
          <SafeAreaProvider>
            <Router />
          </SafeAreaProvider>
        </AppProvider>
      </AuthProvider>
  );
}
