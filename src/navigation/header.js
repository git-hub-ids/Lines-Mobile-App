import React from 'react';
import { View, Image, TouchableOpacity, I18nManager,Text ,StyleSheet } from "react-native";
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
            headerTitle: () => (              
                <Text style={styles.headerTitle}>
                 {translate(route)}
                </Text>
              ),
            headerLeft: () => (
                
                route !== "myLocations" ?
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name={I18nManager.isRTL ? "chevron-forward-outline" : "chevron-back-outline"} color="#fff" size={40} />
                    </TouchableOpacity>
                    : null
            ),
            headerRight: () => 
                showDrawer ? (
                    <View style={styles.headerContainer}>
                   { route !== "myLocations" ? <Text style={styles.headerTitle}>{global["LocationTitle"]}</Text> : <></>}
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                        <DrawerButton />
                    </TouchableOpacity>
                    </View>
                )
                    : (<View style={styles.headerContainer}>{ route !== "myLocations" ? <Text style={styles.headerTitle}>{global["LocationTitle"]}</Text> : <></>}</View>)
        }
    );
}
const styles = StyleSheet.create({
    headerTitle: {
      fontWeight: 'bold',
      fontSize: 24, // You can adjust the font size as needed
      color: '#fff', // You can set the desired color
      marginRight: 20
    },
    headerContainer: {
        flexDirection: 'row',

      },
    // ...
  });
export default HeaderOptions


