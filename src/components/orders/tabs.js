import React, { useEffect, useState } from 'react';
import { I18nManager, Dimensions, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ReadyTab from './readyTab';
import ProgressTab from './progressTab';
import CompletedTab from './completedTab';
import { translate } from "helpers/utils";
import R from 'res/R';

const width = Dimensions.get('screen').width;
const Tab = createMaterialTopTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
    const [clickCount, setClickCount] = useState(0);
    return (
        <View style={styles.tabHeader}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        setClickCount(clickCount + 1)
                        navigation.navigate(route.name, { clickCount });
                    }
                };

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={[styles.tabItem, isFocused ? styles.activeTabItem : styles.inactiveTabItem]}
                    >
                        <Text style={isFocused ? styles.activeTitle : styles.title}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function tabsOrder(params) {
    if (I18nManager.isRTL)
        return (
            <>
                <Tab.Screen children={(props) => <CompletedTab {...params} tabsProps={props} />} name="Completed" options={{ title: translate("completed"), lazy: true }} />
                <Tab.Screen children={(props) => <ProgressTab {...params} tabsProps={props} />} name="Progress" options={{ title: translate("processed"), lazy: true }} />
                <Tab.Screen children={(props) => <ReadyTab {...params} tabsProps={props} />} name="Ready" options={{ title: translate("ready"), lazy: true }} />
            </>
        )
    return (
        <>
            <Tab.Screen children={(props) => <ReadyTab {...params} tabsProps={props} />} name="Ready" options={{ title: translate("ready"), lazy: true }} />
            <Tab.Screen children={(props) => <ProgressTab {...params} tabsProps={props} />} name="Progress" options={{ title: translate("processed"), lazy: true }} />
            <Tab.Screen children={(props) => <CompletedTab {...params} tabsProps={props} />} name="Completed" options={{ title: translate("completed"), lazy: true }} />
        </>
    )
}

function Tabs(props) {
    return (
        <Tab.Navigator initialRouteName='Ready' style={styles.tabs} tabBar={(props) => <MyTabBar {...props} />}>
            {tabsOrder(props)}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabs: {
        marginTop: 50,
        marginHorizontal: 50,
        backgroundColor: R.colors.grey,
        borderRadius: 10,
    },
    tabHeader: {
        flexDirection: 'row',
        borderColor: R.colors.grey,
        borderRadius: 10,
        borderWidth: 10,
        height: 70
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveTabItem: {
        backgroundColor: R.colors.grey,
        borderColor: R.colors.grey,
        borderRadius: 10,
    },
    activeTabItem: {
        backgroundColor: R.colors.darkGreen,
        borderColor: R.colors.grey,
        borderRadius: 10,
    },
    activeTitle: {
        borderColor: R.colors.grey,
        color: R.colors.grey,
        fontSize: 24,
        textTransform: 'none',
        fontWeight: 'bold',
        borderRadius: 20,
    },
    title: {
        color: R.colors.darkGreen,
        fontSize: 24,
        textTransform: 'none',
        fontWeight: 'bold',
    },
    tabViewItem: {
        width: width - 100,
        marginTop: 30
    }
});

export default Tabs;