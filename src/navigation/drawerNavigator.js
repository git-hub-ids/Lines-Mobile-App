import React, { useState } from 'react';
import { I18nManager, StyleSheet, Dimensions, View, Text, Image, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { StackActions } from '@react-navigation/native';
import Constants from "expo-constants";
import { MainStackNavigator } from "./stackNavigator";
import { SendScreen, ReceiveScreen, SettingsScreen } from 'screens';
import { AuthContext } from 'helpers/authProvider';
import { AppContext } from 'helpers/appProvider';
import { setI18nConfig, translate, getUniqueId } from "helpers/utils";

import R from 'res/R';

const height = Dimensions.get('screen').height;
const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
    const context = React.useContext(AuthContext);
    const appContext = React.useContext(AppContext);
    const [isArabic, setIsArabic] = useState(I18nManager.isRTL);
    const [isLoading, setIsLoading] = useState(false);
    const switchLanguage = async (value) => {
        setIsLoading(true);
        setIsArabic(previousState => !previousState);
        var lang = 'en-US', isRTL = false;
        if (value) {
            lang = 'ar-SA';
            isRTL = true;
        }
        await setI18nConfig(lang, isRTL);
        appContext.restart();
    }

    const logout = async () => {
        context.signOut();
    }

    const reset = (navigation) => {
        navigation.dispatch(StackActions.popToTop());
        navigation.closeDrawer();
    }

    return (
        <Drawer.Navigator
            screenOptions={{
                drawerPosition: I18nManager.isRTL ? 'left' : 'right',
                drawerStyle: styles.drawer,
                drawerLabelStyle: { color: '#fff' },
                drawerActiveBackgroundColor: R.colors.darkGreen
            }}
            drawerContent={(props) => {
                return (
                    <DrawerContentScrollView {...props}>
                        <DrawerItem labelStyle={[styles.text, styles.drawerItem]} label={translate('home')}
                            icon={() => <Image style={styles.icon} source={R.images.home} />}
                            onPress={() => reset(props.navigation)} />
                        <DrawerItemList {...props} />
                        <TouchableOpacity style={styles.button} onPress={switchLanguage}>
                            <Image style={styles.icon} source={R.images.language} />
                            <View style={styles.center}>
                                <Text style={[styles.text, styles.padding]}>
                                    {translate('language')}
                                </Text>
                                <Text style={styles.text}>{isArabic ? "Ar" : "En"}</Text>
                                <Switch
                                    style={{ margin: 10 }}
                                    trackColor={{ false: R.colors.grey, true: R.colors.grey }}
                                    thumbColor={R.colors.lightGreen}
                                    ios_backgroundColor={R.colors.grey}
                                    onValueChange={switchLanguage}
                                    value={isArabic}
                                />
                                <Text style={styles.text}>{isArabic ? "En" : "Ar"}</Text>
                                {isLoading ?
                                    <ActivityIndicator size={'small'} color='#fff' />
                                    : null
                                }
                            </View>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={[styles.text, styles.bold]} >{translate('deviceId')}: </Text>
                            <Text style={styles.text}>{" " + getUniqueId()}</Text>
                        </View>
                        <View style={styles.version}>
                            <Text style={[styles.text, styles.bold]} >{translate('version')}: </Text>
                            {/* {Constants.manifest.version} */}
                            <Text style={styles.text}>2.0</Text>
                        </View>
                        <DrawerItem labelStyle={[styles.text, styles.drawerItem]} label={translate('logout')}
                            icon={() => <Image style={styles.icon} source={R.images.logOut} />}
                            onPress={() => logout()} />
                    </DrawerContentScrollView>
                )
            }}>
            <Drawer.Screen
                name="Orders"
                component={MainStackNavigator}
                options={{
                    headerShown: false,
                    title: "",
                }}
            />
            <Drawer.Screen
                name="Send"
                component={SendScreen}
                options={{
                    title: translate("send"),
                    drawerIcon: () => (<Image style={styles.icon} source={R.images.send} />)
                }} />
            <Drawer.Screen
                name="Receive"
                component={ReceiveScreen}
                options={{
                    title: translate("receive"),
                    drawerIcon: () => (<Image style={styles.icon} source={R.images.receive} />)
                }} />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: translate("settings"),
                    drawerIcon: () => (<Image style={styles.icon} source={R.images.settings} />)
                }} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawer: {
        backgroundColor: R.colors.darkGreen,
        color: '#fff'
    },
    button: {
        flexDirection: 'row',
        margin: 20,
    },
    center: {
        marginTop: -20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: height - 550,
        marginHorizontal: 10,
        flexDirection: 'row'
    },
    icon: {
        width: 20,
        height: 20
    },
    version: {
        flexDirection: 'row',
        marginHorizontal: 10,
    },
    text: {
        color: '#fff',
        paddingHorizontal: 5
    },
    bold: {
        fontWeight: "bold"
    },
    padding: {
        paddingHorizontal: 30
    },
    drawerItem: {
        marginStart: -5,
    }
});