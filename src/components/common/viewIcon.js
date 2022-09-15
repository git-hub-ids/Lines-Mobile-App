import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import R from "res/R";

export default class ViewIcon extends React.PureComponent {
    render() {
        return (
            <TouchableOpacity style={styles.container} onPress={() => this.props.onPress()}>
                <Icon name="eye" color="#fff" size={25}></Icon>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width:40, 
        height:40,
        marginTop:-20,
        alignItems:'center',
        justifyContent:'center',
        borderRadius: 10,
        backgroundColor: R.colors.darkGreen,
    }
});