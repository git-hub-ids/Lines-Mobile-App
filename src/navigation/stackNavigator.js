import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen, LocationsScreen, StepsScreen, OrdersScreen, OrderDetailsScreen, ProducedItemsScreen, SearchScreen } from 'screens';
import HeaderOptions from './header';
import { translate } from "helpers/utils";
import R from "res/R";

const Stack = createStackNavigator();

const AuthStackNavigator = () => {
    return (
        <Stack.Navigator >
            <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

const MainStackNavigator = ({ navigation }) => {
    return (
        <Stack.Navigator >
            {global.locations?.length > 1 ?
                <Stack.Screen
                    navigationProps={navigation}
                    options={HeaderOptions(navigation, "myLocations")}
                    name="Locations"
                    component={LocationsScreen} />
                : null}
            {global.steps?.length != 1 ?
                <Stack.Screen
                    navigationProps={navigation}
                    options={HeaderOptions(navigation, "mySteps")}
                    name="Steps"
                    component={StepsScreen} />
                : null}
            <Stack.Screen
                navigationProps={navigation}
                options={HeaderOptions(navigation, "myOrders")}
                name="Orders"
                component={OrdersScreen} />
            <Stack.Screen
                navigationProps={navigation}
                name="OrderDetails"
                component={OrderDetailsScreen} />
            <Stack.Screen
                navigationProps={navigation}
                name="ProducedItems"
                component={ProducedItemsScreen} />
            <Stack.Screen
                navigationProps={navigation}
                name="Search"
                options={HeaderOptions(navigation, "search", false)}
                component={SearchScreen} />
        </Stack.Navigator>
    )
}

export { AuthStackNavigator, MainStackNavigator }