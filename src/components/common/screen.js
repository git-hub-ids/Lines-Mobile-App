import React from "react";
import { SafeAreaView, StyleSheet, Text, SectionList, View, ActivityIndicator } from "react-native";
import { StatusBar } from 'expo-status-bar';
import R from 'res/R';

export default class LocationsScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="auto" />
                {this.props.children}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});
