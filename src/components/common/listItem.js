import React from "react";
import { StyleSheet, Text, TouchableOpacity, I18nManager } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import R from "res/R";

export default class ListItem extends React.PureComponent {
    render() {
        const item = this.props.item;
        const title = item.description ? item.description : item.latinName;
        return (
            <TouchableOpacity style={styles.container} onPress={() => this.props.onPress(item)}>
                <Text style={styles.title}>
                    {title}
                </Text>
                <Icon name={I18nManager.isRTL ? "chevron-back-outline" : "chevron-forward-outline"} color={R.colors.darkGreen} size={40}></Icon>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: -30,
        alignSelf: 'stretch',
        marginHorizontal: 50,
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    title: {
        color: R.colors.darkGreen,
        fontSize: 24,
        fontWeight: 'bold'
    }
});