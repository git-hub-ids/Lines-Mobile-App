import React from "react";
import { StyleSheet, ActivityIndicator, Text, TextInput, View, Keyboard } from "react-native";
import { Button } from "components/common";
import * as storage from "helpers/storage";
import { API, IDSPIN } from '@env';
import R from 'res/R';

export default class APIURLForm extends React.PureComponent {

    constructor(props) {
        super(props);
        this.pinInputRef;
        this.state =
        {
            api: API,
            pin: '',
            isLoading: false
        };
    }

    async componentDidMount() {
        let api = await storage.getItem("api");
        if (!api || api === "")
            api = API;
        this.setState({ api })
    }

    changeApiValue = async () => {
        Keyboard.dismiss;
        var isValid = this.validatePin();
        if (isValid) {
            let api = this.state.api;
            if (api && api !== "") {
                this.setState({ isLoading: true }, async () => {
                    await storage.setItem("api", this.state.api);
                    global.toast.show("API Url Saved", { type: "success" });
                    this.setState({ isLoading: false })
                    if (this.props.restart)
                        this.props.restart()
                })
            }
            else
                global.toast.show("enter the API Url", { type: "danger" });
        }
    }

    validatePin = () => {
        let pin = this.state.pin;
        if (pin === '')
            global.toast.show("Please enter IDS pin", { type: "danger" });
        else if (pin !== IDSPIN)
            global.toast.show("Invalid pin", { type: "danger" });
        return pin === IDSPIN;
    }


    render() {
        return (
            <>
                <View style={{ margin: 30, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, paddingEnd: 20 }}> API URL:</Text>
                    <TextInput style={{ backgroundColor: '#fff', flex: 1, fontSize: 20, height: 60 }}
                        value={this.state.api}
                        onChangeText={(text) => this.setState({ api: text })}
                        blurOnSubmit={false}
                        returnKeyType="next"
                        onSubmitEditing={() =>
                            this.pinInputRef &&
                            this.pinInputRef.focus()}
                        blurOnSubmit={false}
                    />
                </View>
                <View style={{ margin: 30, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, paddingEnd: 20 }}> IDS Pin:</Text>
                    <TextInput style={{ backgroundColor: '#fff', flex: 1, fontSize: 20, height: 60 }}
                        ref={(input) => this.pinInputRef = input}
                        value={this.state.pin}
                        onChangeText={(text) => this.setState({ pin: text })}
                        blurOnSubmit={true}
                        onSubmitEditing={() => {
                            this.changeApiValue();
                        }} />
                </View>
                <Button text="Save" onPress={() => this.changeApiValue()} />
                {this.state.isLoading ?
                    <ActivityIndicator size={'large'} color={R.colors.darkGreen} />
                    : null}
            </>
        );
    }
}

const styles = StyleSheet.create({

});