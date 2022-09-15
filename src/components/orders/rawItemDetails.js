import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Keyboard } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Button, DropDownList } from "components/common";
import { translate, validateDate } from "helpers/utils";
import * as services from "services/orders";
import moment from "moment";
import R from "res/R";

export default class RawItemDetails extends React.PureComponent {

    constructor(props) {
        super(props);
        this.qtyInputRef = React.createRef();
        this.state =
        {
            item: { ... this.props.item },
            openUnit: false,
            qty: this.props.item?.qty,
            spec: this.props.item?.spec,
            unit: this.props.item?.unit,
            unitId: this.props.item?.unitId,
            units: [],
            openWarehouse: false,
            fromWhouseName: this.props.item.fromWhouseName,
            fromWhouseId: this.props.item.fromWhouseId,
            toWhouseId: this.props.item.toWhouseId,
            warehouses: [],
            showWhouseError: false,
            expiryDate: "",
            isValidDate: true,
            isExpanded: false,
            isLoaded: false
        };
    }

    componentDidMount() {
        let item = this.props.item;
        console.log(item)
        this.setState({ expiryDate: item.expiryDate ? item.expiryDate : "" });
    }

    expand = async () => {
        let units = this.state.units;
        let warehouses = this.state.warehouses;
        if (!this.state.isLoaded) {
            units = await services.getUnits(this.props.item.itemId)
            warehouses = await services.getWarehouses()
        }
        this.setState({ units, warehouses, isLoaded: true, isExpanded: !this.state.isExpanded })
    }

    setUnit(unitId) {
        let units = this.state.units;
        let unit = this.state.unit;
        if (units)
            unit = units.find(u => u.id == unitId);
        this.setState({ unit: unit.label, unitId });
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

    setExpiryDate(expiryDate) {
        isValidDate = validateDate(expiryDate);
        this.setState({ expiryDate, isValidDate })
    }

    done = () => {
        var item = this.props.item;
        item.spec = this.state.spec;
        item.qty = this.state.qty;
        item.unitId = this.state.unitId;
        item.unit = this.state.unit;
        item.fromWhouseId = this.state.fromWhouseId;
        item.toWhouseId = this.state.toWhouseId;
        item.expiryDate = this.state.expiryDate;
        item.isValid = (this.state.isValidDate && !this.state.showWhouseError && this.state.unitId > 0)
        if (item.isValid)
            this.setState({ isExpanded: false });
    }

    reset = () => {
        let defaultItem = this.state.item;
        let item = this.props.item;
        item = defaultItem;
        let spec = item.spec;
        let qty = item.qty;
        let unitId = item.unitId;
        let unit = item.unit;
        let fromWhouseId = item.fromWhouseId;
        let toWhouseId = item.toWhouseId;
        let expiryDate = item.expiryDate;
        let showWhouseError = fromWhouseId == toWhouseId;
        //let isValidDate = item.expiryDate && item.expiryDate !== "" && validateDate(item.expiryDate);
        this.setState({ spec, qty, unit, unitId, fromWhouseId, toWhouseId, showWhouseError, expiryDate });
    }

    render() {
        const item = this.props.item;
        return (
            <View style={styles.container} >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.row} onPress={this.expand}>
                        <Text style={styles.headerTitle}>
                            {item.name}
                        </Text>
                        <Text style={styles.headerSubTitle}>
                            {item.qty + " " + item.unit}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.btnExpand} onPress={this.expand}>
                            <Ionicons name={this.state.isExpanded ? 'chevron-up' : 'chevron-down'} size={30} color='#fff' />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => this.props.delete(item.itemId)}>
                            <Ionicons name="trash-outline" size={30} color='#fff' />
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.isExpanded ?
                    <>
                        <View style={styles.body}>
                            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" />
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('itemName')}:
                                </Text>
                                <Text style={styles.info}>
                                    {item.name}
                                </Text>
                            </View>
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('unit')}:
                                </Text>
                                <DropDownList
                                    placeholder={translate("selectUnit")}
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    value={this.state.unitId}
                                    setValue={this.setUnit.bind(this)}
                                    items={this.state.units} />
                            </View>
                            {this.props.actionId == 26 ?
                                <>
                                    <View style={styles.group}>
                                        <Text style={styles.title}>
                                            {translate('fromWarehouse')}:
                                        </Text>
                                        <DropDownList
                                            placeholder={translate("selectWhouse")}
                                            zIndex={3000}
                                            zIndexInverse={1000}
                                            value={this.state.fromWhouseId}
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
                                            value={this.state.toWhouseId}
                                            setValue={this.setToWarehouse.bind(this)}
                                            items={this.state.warehouses} />
                                    </View>
                                    {this.state.showWhouseError ?
                                        <View style={styles.errorRow}>
                                            <Text style={styles.error}>
                                                {translate('msgErrorSameWhouse')}
                                            </Text>
                                        </View>
                                        : null
                                    }
                                </>
                                : null}
                            {this.props.actionId != 26 ?
                                <View style={styles.group}>
                                    <Text style={styles.title}>
                                        {translate('warehouse')}:
                                    </Text>
                                    <DropDownList
                                        placeholder={translate("selectWhouse")}
                                        zIndex={1000}
                                        zIndexInverse={3000}
                                        value={this.props.type === 'receive' ? this.state.toWhouseId : this.state.fromWhouseId}
                                        setValue={this.props.type === 'receive' ? this.setToWarehouse.bind(this) : this.setFromWarehouse.bind(this)}
                                        items={this.state.warehouses} />
                                </View>
                                : null}
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
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('expiryDate')}:
                                </Text>
                                <Text style={styles.info}>
                                    {this.state.expiryDate !== "" ? moment(this.state.expiryDate).format("DD/MM/YYYY") : ""}
                                </Text>
                            </View>
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
                            {!this.state.isValidDate ?
                                <View style={styles.errorRow}>
                                    <Text style={styles.error}>
                                        {translate('msgInvalidDate')}
                                    </Text>
                                </View>
                                : null}
                        </View>
                        <View style={styles.footer}>
                            <Button style={styles.button} text={translate('saveChanges')} onPress={() => this.done()} />
                            <Button style={styles.button} text={translate('reset')} onPress={() => this.reset()} />
                        </View>
                    </>
                    : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20
    },
    headerTitle: {
        color: R.colors.darkGreen,
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
    headerSubTitle: {
        color: R.colors.darkGreen,
        fontSize: 20,
        marginStart: 10
    },
    btnExpand: {
        width: 40,
        height: 40,
        backgroundColor: R.colors.darkGreen,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5
    },
    btnDelete: {
        width: 40,
        height: 40,
        backgroundColor: R.colors.darkGreen,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5
    },
    body: {
        flex: 1,
        flexWrap: "wrap",
        flexDirection: 'row',
        backgroundColor: R.colors.lightGrey,
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        height: 70,
        alignItems: 'center'
    },
    group: {
        flexDirection: 'row',
        width: '50%',
        padding: 10,
        paddingHorizontal: 50
    },
    title: {
        width: '32%',
        color: R.colors.darkGrey,
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    info: {
        width: '68%',
        maxWidth: '68%',
        backgroundColor: R.colors.lightGrey,
        borderRadius: 10,
        color: R.colors.darkGreen,
        fontSize: 16,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: R.colors.darkGreen
    },
    footer: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin:15
    },
    button: {
        marginHorizontal: 10
    },
    error: {
        fontSize: 14,
        color: "#f00"
    },
    errorRow: {
        height: 40,
        padding: 10
    }
});