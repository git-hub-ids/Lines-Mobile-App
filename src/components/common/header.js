import React from "react";
import {StyleSheet, View} from "react-native";
import R from "res/R";

export default class Header extends React.PureComponent {
    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 70,
        zIndex:0,
        elevation:0,
        backgroundColor: R.colors.darkGreen,
        borderBottomStartRadius:20,
        borderBottomEndRadius:20,
    },
});