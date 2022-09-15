import React from 'react';
import { View, Image, TouchableOpacity, I18nManager } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { translate } from "helpers/utils";
import R from "res/R";

const DrawerButton = () => {
    return (
        <View>
            <Image source={I18nManager.isRTL ? R.images.drawerRTL : R.images.drawer} style={{ width: 50, height: 50 }} />
        </View>
    );
};

function HeaderOptions(navigation, route, showDrawer = true) {
    return (
        {
            headerStyle: { backgroundColor: R.colors.darkGreen },
            headerTintColor: "#fff",
            title: translate(route),
            headerLeft: () => (
                route !== "myLocations" ?
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name={I18nManager.isRTL ? "chevron-forward-outline" : "chevron-back-outline"} color="#fff" size={40} />
                    </TouchableOpacity>
                    : null
            ),
            headerRight: () =>
                showDrawer ? (
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                        <DrawerButton />
                    </TouchableOpacity>
                )
                    : null
        }
    );
}

export default HeaderOptions


