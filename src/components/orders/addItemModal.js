import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Keyboard, ActivityIndicator } from "react-native";
import DatePicker from 'react-native-date-picker'
import { Button, DropDownList, Modal } from "components/common";
import * as services from "services/orders";
import { translate } from "helpers/utils";
import moment from "moment";
import R from 'res/R';

export default class AddItemModal extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            items: [],
            item: {},
            units: [],
            unit: "",
            qty: "",
            spec: "",
            expiryDate: "",
            fromWhouseId: 0,
            toWhouseId: 0,
            openDatePicker: false,
            showWhouseError: false,
            isLoading: true
        };
    }

    componentDidMount = async () => {
        await this.init()
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevState.items.length == 0 && this.state.items.length == 0 && !this.state.isLoading)
            await this.init()
    }

    init = async () => {
        this.setState({ isLoading: true }, async () => {
            let items = await services.getItems(0, 20);
            let warehouses = await services.getWarehouses();
            this.setState({ items, warehouses, isLoading: false })
        })
    }

    setItem(item) {
        let units = item?.units;
        this.setState({ item, units })
    }

    setUnit(unitId) {
        var unit = this.state.units.find(u => u.id == unitId);
        this.setState({ unitId, unit: unit.label });
    }

    setFromWarehouse(fromWhouseId) {
        this.setState({ fromWhouseId }, () => {
            const { toWhouseId } = this.state;
            this.setState({ showWhouseError: toWhouseId > 0 && (fromWhouseId == toWhouseId) })
        });
    }

    setToWarehouse(toWhouseId) {
        this.setState({ toWhouseId }, () => {
            const { fromWhouseId } = this.state;
            this.setState({ showWhouseError: fromWhouseId > 0 && (fromWhouseId == toWhouseId) })
        });
    }

    add = () => {
        const { item, unitId, unit, fromWhouseId, toWhouseId, spec, qty, expiryDate, showWhouseError } = this.state;
        if (item && item.id > 0 && unitId > 0 && fromWhouseId > 0 && (this.props.actionId == 28 || (this.props.actionId == 26 && toWhouseId > 0)) && qty !== "" && !showWhouseError) {
            let detail = {
                itemId: item.id,
                unitId: unitId,
                unit,
                fromWhouseId: fromWhouseId,
                toWhouseId: toWhouseId,
                name: item.name,
                spec: spec,
                qty: qty,
                expiryDate: expiryDate
            }
            this.props.add(detail);
            this.reset();
        }
    }

    reset = () => {
        this.setState({
            qty: "",
            spec: "",
            expiryDate: "",
            fromWhouseId: 0,
            toWhouseId: 0
        })
    }

    render() {
        return (
            <Modal show={this.props.show} hide={this.props.hide}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                    {this.state.isLoading ?
                        <ActivityIndicator size={'large'} color={R.colors.darkGreen} />
                        :
                        <View style={styles.body}>
                            <View style={styles.row}>
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('itemName')}:
                                    </Text>
                                    <DropDownList
                                        placeholder={translate("selectItem")}
                                        isItems={true}
                                        zIndex={3000}
                                        zIndexInverse={1000}
                                        setValue={this.setItem.bind(this)}
                                        items={this.state.items} />
                                </View>
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('lotNumber')}:
                                    </Text>
                                    <TextInput
                                        value={this.state.spec}
                                        style={styles.input}
                                        keyboardType="number-pad"
                                        returnKeyType="next"
                                        onChangeText={spec => this.setState({ spec })}
                                        onSubmitEditing={() =>
                                            this.qtyInputRef &&
                                            this.qtyInputRef.focus()}
                                        blurOnSubmit={false}
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('quantity')}:
                                    </Text>
                                    <TextInput
                                        ref={(input) => { this.qtyInputRef = input; }}
                                        value={this.state.qty + ""}
                                        style={styles.input}
                                        keyboardType="numeric"
                                        onChangeText={qty => this.setState({ qty })}
                                        onSubmitEditing={() => Keyboard.dismiss()}
                                        blurOnSubmit={true}
                                    />
                                </View>
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('unit')}:
                                    </Text>
                                    <DropDownList
                                        placeholder={translate("selectUnit")}
                                        zIndex={3000}
                                        zIndexInverse={1000}
                                        setValue={this.setUnit.bind(this)}
                                        items={this.state.units} />
                                </View>
                            </View>
                            {this.props.actionId == 26 ?
                                <>
                                    <View style={styles.row}>
                                        <View style={styles.group}>
                                            <Text style={styles.title}>
                                                {translate('fromWarehouse')}:
                                            </Text>
                                            <DropDownList
                                                placeholder={translate("selectWhouse")}
                                                zIndex={1000}
                                                zIndexInverse={3000}
                                                setValue={this.setFromWarehouse.bind(this)}
                                                items={this.state.warehouses} />
                                        </View>
                                        <View style={styles.group}>
                                            <Text style={styles.title}>
                                                {translate('toWarehouse')}:
                                            </Text>
                                            <DropDownList
                                                placeholder={translate("selectWhouse")}
                                                zIndex={1000}
                                                zIndexInverse={3000}
                                                setValue={this.setToWarehouse.bind(this)}
                                                items={this.state.warehouses} />
                                        </View>
                                    </View>
                                    {this.state.showWhouseError ?
                                        <Text style={styles.error}>
                                            {translate('msgErrorSameWhouse')}
                                        </Text>
                                        : null}
                                </>
                                : null}
                            <View style={styles.row}>
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('expiryDate')}:
                                    </Text>
                                    <TouchableOpacity style={styles.input} onPress={() => this.setState({ openDatePicker: true })}>
                                        <Text> {this.state.expiryDate !== "" ? moment(this.state.expiryDate).format("DD/MM/YYYY") : ""}</Text>
                                    </TouchableOpacity>
                                </View>
                                {this.props.actionId != 26 ?
                                    <View style={styles.group}>
                                        <Text style={styles.title}>
                                            {translate('warehouse')}:
                                        </Text>
                                        <DropDownList
                                            placeholder={translate("selectWhouse")}
                                            zIndex={1000}
                                            zIndexInverse={3000}
                                            setValue={this.setFromWarehouse.bind(this)}
                                            items={this.state.warehouses} />
                                    </View>
                                    : null}
                            </View>
                            <View style={styles.footer}>
                                <Button style={styles.button} text={translate('add')} onPress={() => this.add()} />
                            </View>
                        </View>
                    }
                    <DatePicker
                        modal
                        mode="date"
                        open={this.state.openDatePicker}
                        date={this.state.expiryDate !== "" ? new Date(this.state.expiryDate) : new Date()}
                        onConfirm={(expiryDate) => {
                            this.setState({ expiryDate, openDatePicker: false })
                        }}
                        onCancel={() => {
                            this.setState({ openDatePicker: false })
                        }}
                    />
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    body: {
        backgroundColor: R.colors.lightGrey,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20,
        height: '100%'
    },
    row: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center'
    },
    group: {
        flexDirection: 'row',
        maxWidth: '50%',
        padding: 10
    },
    title: {
        width: '30%',
        color: R.colors.darkGrey,
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    info: {
        width: '70%',
        backgroundColor: R.colors.lightGrey,
        borderRadius: 10,
        color: R.colors.darkGreen,
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: R.colors.darkGreen
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        marginHorizontal: 10
    },
    error: {
        color: "#f00"
    }
});
