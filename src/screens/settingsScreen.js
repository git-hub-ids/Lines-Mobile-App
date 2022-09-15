import React from "react";
import { I18nManager, TouchableOpacity, } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Screen } from "components/common";
import APIURLForm from "components/settings/apiUrlForm";
import { AppContext } from 'helpers/appProvider';
import R from 'res/R';

export default class SettingsScreen extends React.Component {
    static contextType = AppContext;

    constructor(props) {
        super(props);
    }

    restart = () => {
        this.context.restart();
    }

    async componentDidMount() {
        this.props.navigation.setOptions({
            headerStyle: { backgroundColor: R.colors.lightGrey },
            headerTintColor: R.colors.darkGreen,
            headerLeft: () => (
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
                    <Icon name={I18nManager.isRTL ? "chevron-forward-outline" : "chevron-back-outline"} color={R.colors.darkGreen} size={40} />
                </TouchableOpacity>)
        });
    }

    render() {
        return (
            <Screen>
                <APIURLForm restart={this.restart} />
            </Screen>
        );
    }
}