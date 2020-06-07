import * as React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import {AuthContext, IotlGlobals, IotlStrings} from './api/context';
import CreateAccountScreen from './screens/CreateAccountScreen';
import PresetStack from './stacks/PresetStack';
import AdjustStack from './stacks/AdjustStack';
import TimerStack from './stacks/TimerStack';
import SettingsStack from './stacks/SettingsStack';
import LanControlScreen from './screens/LanControlScreen';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

const App: () => React$Node = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(IotlGlobals.authToken);

  const TabStack = createBottomTabNavigator();
  const AuthStack = createStackNavigator();

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      console.log('app.js----');
      setUserToken(null);
    }, 500);
  }, []);

  const authContext = React.useMemo(() => {
    return {
      signIn: () => {
        setIsLoading(false);
        setUserToken('nusdsdll');
      },
      signUp: () => {
        setIsLoading(false);
        setUserToken('nusdsdll');
      },
      signOut: () => {
        setIsLoading(false);
        setUserToken(null);
      },
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {userToken ? (
          <TabStack.Navigator
            initialRouteName="Adjust"
            tabBarOptions={{
              activeTintColor: '#e91e63',
            }}>
            <TabStack.Screen
              name="Preset"
              component={PresetStack}
              options={{title: 'Presets', headerTitleAlign: 'center'}}
            />
            <TabStack.Screen
              name="Adjust"
              component={AdjustStack}
              options={{title: 'Adjust'}}
            />
            <TabStack.Screen
              name="Timer"
              component={TimerStack}
              options={{title: 'Timer'}}
            />
            <TabStack.Screen
              name="Settings"
              component={SettingsStack}
              options={{title: 'Settings'}}
            />
          </TabStack.Navigator>
        ) : (
          <AuthStack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            <AuthStack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{
                title: 'Sign In',
                animationEnabled: false,
              }}
              initialParams={{asd: 'qwewqe'}}
            />

            <AuthStack.Screen
              name="CreateAccountScreen"
              component={CreateAccountScreen}
              options={{title: 'Create Account'}}
            />
            <AuthStack.Screen
              name="LanControlScreen"
              component={LanControlScreen}
              options={{
                title: 'Lan Control',
                animationEnabled: true,
              }}
              initialParams={{asd: 'qwewqe'}}
            />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
