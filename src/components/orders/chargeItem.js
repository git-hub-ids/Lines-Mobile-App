import React from "react";
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Keyboard } from "react-native";
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { translate } from "helpers/utils";
import R from "res/R";

export default class ChargeItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state =
        {
            qty: "",
            showError: false,
            checked: false
        };
    }

    onCheck = () => {
        if (this.state.qty > 0) {
            this.setState({ showError: false, checked: !this.state.checked }, () => {
                let item = this.props.item;
                let charge =
                {
                    checked: this.state.checked,
                    chargeProductionId: item.id,
                    chargesQty: this.state.qty,
                    chargesType: item.label,
                    chargeName: item.label
                }
                this.props.onCheck(charge);
            });
        }
        else { this.setState({ showError: true }) }
    }

    render() {
        const item = this.props.item;
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                <View style={styles.container} >
                    <Text style={styles.label}> {item.label}</Text>
                    <TextInput
                        placeholder={translate('quantity')}
                        value={this.state.qty}
                        style={styles.input}
                        keyboardType="numeric"
                        onChangeText={qty => this.setState({ qty })}
                        onSubmitEditing={() =>
                            Keyboard.dismiss()}
                        blurOnSubmit={true}
                    />
                    {this.state.showError ?
                        <Icon name='close' style={styles.error} />
                        : null
                    }
                    <CheckBox
                        uncheckedColor={R.colors.darkGreen}
                        checked={this.state.checked}
                        checkedColor={R.colors.darkGreen}
                        onPress={this.onCheck}
                        size={35}
                        checkedIcon="check-square"
                    />

                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 20,
        alignSelf: 'stretch',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        color: R.colors.darkGreen,
        width: 200
    },
    input: {
        flex: 1,
        backgroundColor: R.colors.grey,
        borderRadius: 10,
        padding: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: R.colors.darkGreen
    },
    error: {
        color: '#f00',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});