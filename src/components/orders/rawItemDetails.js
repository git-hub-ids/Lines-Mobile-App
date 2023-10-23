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
            // expiry:[],
            openWarehouse: false,
            fromWhouseName: this.props.item.fromWhouseName,
            fromWhouseId: this.props.item.fromWhouseId,
            toWhouseId: this.props.item.toWhouseId,
            warehouses: [],
            showWhouseError: false,
            expiryDate: this.props.item?.expiryDate
            // ? moment(this.props.item?.expiryDate, "YYYY-MM-DD").format("DD/MM/YYYY")
            // : "",
            ,
            specs: [],
            specsOptions: [],
            isExpiryDateRequired: true,
            isValidDate: true,
            isExpanded: false,
            isLoaded: false,
            showQtyError: false,
            availableQty: 0,
        };
    }

    componentDidMount() {
        let item = this.props.item;
        this.setState({ expiryDate: item.expiryDate ? item.expiryDate : "", showQtyError: false });
    }

    expand = async () => {

        // this.setState({expiryDate: this.props.item?.expiryDate
        //     ? moment(this.props.item?.expiryDate, "YYYY-MM-DD").format("DD/MM/YYYY")
        //     : "",})
        this.setState({ showQtyError: false })
        let item = await services.getItem(this.state.item.itemId);
        const specs = item.specExpiryList;
        this.setState({ specs })

        // this.setState({
        //     expiryDate: this.state.expiryDate
        //         ? moment(this.state.expiryDate, "DD/MM/YYYY").format("YYYY-MM-DD")
        //         : "",
        // });


        const isExpiryDateRequired = item.isExpiry;
        // let specsOptions = null;
        //  if(specs != undefined)
        let specsOptions = specs.map((i) => {
            return { id: i.spec, value: i.spec, label: i.spec };
        });
        if ((this.state.expiryDate == '' || !this.state.expiryDate) && this.state.spec != '') {
            let expirys = specs.map((i) => {
                if (i.spec == this.state.spec)
                    return i;
            });
            if (expirys) {
                let expiry = expirys[0].expiryDate ? moment(expirys[0].expiryDate, "YYYY-MM-DD").format("YYYY-MM-DD")
                    : "";
                this.setState({ expiryDate: expiry })
            }
        }

        // let ExpiryOptions = specs.map((i) => {
        //     return { id:i.expiryDate? moment(i.expiryDate).format("DD/MM/YYYY"):"", value: i.expiryDate?moment(i.expiryDate).format("DD/MM/YYYY"):"", label: i.expiryDate?moment(i.expiryDate).format("DD/MM/YYYY"):"" };
        // });

        // this.setState({ spec: this.state.item.spec });
        // this.setLotNumber(this.state.item.spec);
        let expiry = this.state.expiryDate
            ? moment(this.state.expiryDate, "YYYY-MM-DD").format("YYYY-MM-DD")
            : "";
        let units = this.state.units;
        let warehouses = this.state.warehouses;
        if (!this.state.isLoaded) {
            units = await services.getUnits(this.props.item.itemId)
            warehouses = await services.getWarehouses(false);
        }
        var selectedWhouse = warehouses.find((w) => w.id == this.state.fromWhouseId);
        if (selectedWhouse == undefined || selectedWhouse == null)
            this.setState({
                fromWhouseId: 0
            })
        if (warehouses.length === 1) {
            this.setState({
                fromWhouseId: warehouses[0].id
            })

        }
        this.setState({ units, warehouses, isLoaded: true, isExpanded: !this.state.isExpanded, specs, specsOptions, isExpiryDateRequired, })
        let availableQty = 0;

        const whouseQty = await services.getAvailableQty(this.state.item.itemId, this.state.fromWhouseId, this.state.spec, expiry);
        availableQty = whouseQty;

        this.setState((state) => ({
            availableQty,
            showQtyError: this.state.qty > availableQty
        }));
        console.log('33333333333',this.state.showQtyError)

        global["QtyError"] = this.state.showQtyError;
    }

    setUnit(unitId) {
        let units = this.state.units;
        let unit = this.state.unit;
        if (units)
            unit = units.find(u => u.id == unitId);
        this.setState({ unit: unit.label, unitId });
    }

    async setFromWarehouse(fromWhouseId) {
        let availableQty = 0;
        let expiry = this.state.expiryDate
            ? moment(this.state.expiryDate, "YYYY-MM-DD").format("YYYY-MM-DD")
            : "";
        const whouseQty = await services.getAvailableQty(this.state.item.itemId, fromWhouseId, this.state.spec, expiry);
        availableQty = whouseQty;

        this.setState({ fromWhouseId }, () => {
            const { toWhouseId } = this.state;
            this.setState({ availableQty, showQtyError: this.state.qty > availableQty, showWhouseError: toWhouseId > 0 && (fromWhouseId == toWhouseId) })
        });
        console.log('444444444444',this.state.showQtyError)

        global["QtyError"] = this.state.showQtyError;
    }

    async setToWarehouse(toWhouseId) {

        this.setState({ toWhouseId }, () => {
            const { fromWhouseId } = this.state;
            this.setState({ showWhouseError: fromWhouseId > 0 && (fromWhouseId == toWhouseId), showQtyError: qty > availableQty })
        });
    }

    async setExpiryDate(expiryDate) {
        let isValidDate = validateDate(expiryDate);
        // let expiry = expiryDate
        // ? moment(expiryDate, "DD/MM/YYYY").format("YYYY-MM-DD")
        // : "";
        // const whouseQty = await services.getAvailableQty(this.state.item.itemId, this.state.fromWhouseId, this.state.spec, expiry);
        // let availableQty = whouseQty;
        // this.setState((state) => ({
        //     availableQty,
        //     showQtyError: this.state.qty > availableQty
        // }));
        this.setState({ expiryDate, isValidDate })
    }
    async setLotNumber(spec) {
        const { expiryDate, specs, warehouses, fromWhouseId, qty } = this.state;
        // const selectedWhouse = warehouses.find((e) => e.id === fromWhouseId).label;
        const info = specs.find((i) => i.spec === spec);
        if (info) {

            this.setState({
                spec,
                expiryDate: info.expiryDate
            });
            let expiry = info.expiryDate
                ? moment(info.expiryDate, "YYYY-MM-DD").format("YYYY-MM-DD")
                : "";
            // this.setState({
            //     expiryDate: info.expiryDate
            //         ? moment(info.expiryDate, "YYYY-MM-DD").format("DD/MM/YYYY")
            //         : ""
            // });
            let availableQty = 0;
            const whouseQty = await services.getAvailableQty(this.state.item.itemId, fromWhouseId, spec, expiry);
            availableQty = whouseQty;


            this.setState({
                spec,
                availableQty,
                showQtyError: qty > availableQty
            });
        }
        console.log('2222222222222',this.state.showQtyError)

        global["QtyError"] = this.state.showQtyError;
    }
    async setQuantity(qty) {
        await this.setState({
            qty: qty,
            showQtyError: qty > this.state.availableQty
        });
        console.log('111111111',this.state.showQtyError)
        global["QtyError"] = this.state.showQtyError;
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
        item.isValid = (!this.state.showQtyError && this.state.isValidDate && !this.state.showWhouseError && this.state.unitId > 0 && this.state.qty > 0 && this.state.fromWhouseId > 0)
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
        this.setState({ spec, qty, unit, unitId, fromWhouseId, toWhouseId, showWhouseError, expiryDate, showQtyError: false });
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
                                <DropDownList
                                    placeholder={translate("selectLotNumber")}
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    setValue={this.setLotNumber.bind(this)}
                                    value={this.state.spec}
                                    items={this.state.specsOptions}
                                />
                                {/* <TextInput
                                    value={this.state.spec}
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    returnKeyType="next"
                                    onChangeText={spec => this.setLotNumber({ spec })}
                                    onSubmitEditing={() =>
                                        this.qtyInputRef &&
                                        this.qtyInputRef.focus()}
                                    blurOnSubmit={false}
                                /> */}
                            </View>
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('expiryDate')}:
                                </Text>
                                {/* <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => this.setState({ openDatePicker: true })}
                                    disabled
                                >
                                    <Text>
                                        {this.state.expiryDate && this.state.expiryDate !== ""
                                            ? moment(this.state.expiryDate, "DD-MM-YYYY").format("DD/MM/YYYY")
                                            : ""}
                                    </Text>
                                </TouchableOpacity> */}
                                <Text style={styles.info}>
                                    {this.state.expiryDate !== "" ? moment(this.state.expiryDate, "YYYY-MM-DD").format("DD/MM/YYYY") : ""}
                                </Text>
                                {/* <DropDownList
                                    placeholder={translate("selectExpiry")}
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    setValue={this.setExpiryDate.bind(this)}
                                    value={this.state.expiryDate}
                                    items={this.state.expiry}
                                /> */}
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
                                    onChangeText={(qty) => this.setQuantity(qty)}
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    blurOnSubmit={true}
                                />
                            </View>
                            {this.state.showQtyError && (
                                <View style={styles.errorBox}>
                                    <View style={{ width: "50%" }}>
                                        <Text style={styles.error}>
                                            {translate("msgErrorQtyUnavailable")}
                                        </Text>
                                    </View>
                                </View>
                            )}
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
        margin: 15
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