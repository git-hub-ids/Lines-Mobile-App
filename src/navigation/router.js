import * as React from 'react';
import Toast from "react-native-toast-notifications";
import { NavigationContainer } from '@react-navigation/native';
import { AuthStackNavigator } from "./stackNavigator";
import { useAuthorization } from 'helpers/authProvider';
import { DrawerNavigator } from './drawerNavigator';

export const Router = () => {
    var context = useAuthorization();

    return (
        <NavigationContainer>
            {context.token == null ? <AuthStackNavigator /> : <DrawerNavigator />}
            <Toast ref={(ref) => global['toast'] = ref} />
        </NavigationContainer>
    );
};