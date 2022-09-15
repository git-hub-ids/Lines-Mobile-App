import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import R from "res/R";

export default class Button extends React.PureComponent {
    render() {
        return (
            <TouchableOpacity
                style={[styles.container, this.props.style, this.props.disabled ? styles.grey : this.props.secondary ? styles.white : styles.green]}
                onPress={() => this.props.onPress()}
                disabled={this.props.disabled}
            >
                <Text style={(this.props.disabled || !this.props.secondary) ? styles.text : styles.textSecondary}>
                    {this.props.text}
                </Text>
                {this.props.children}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        minWidth: 120,
        height: 60,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    white: {
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: R.colors.darkGreen
    },
    green: {
        backgroundColor: R.colors.darkGreen,
    },
    grey: {
        backgroundColor: R.colors.darkGrey,
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    textSecondary: {
        color: R.colors.darkGreen,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});