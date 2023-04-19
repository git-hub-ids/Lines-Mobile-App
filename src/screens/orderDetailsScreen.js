import React from "react";
import { StyleSheet, FlatList, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Screen, Button } from "components/common";
import { RawItemDetails, AddItemModal } from "components/orders";
import * as services from "services/orders";
import { translate, removeTime } from "helpers/utils";
import moment from "moment";
import { CheckType, ActionType } from "../types/enums";
import R from 'res/R';

export default class OrderDetailsScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            selectedOrders: [],
            details: [],
            showModal: false,
            isSending: false,
            isLoading: true
        };
    }

    componentDidMount = async () => {
        let selectedOrders = this.props.route.params?.selectedOrders;
        let details = [];
        let actionId = 0;
        if (selectedOrders && selectedOrders.length > 0) {
            let order = selectedOrders[0];
            this.props.navigation.setOptions({
                title: '',
                headerStyle: { backgroundColor: R.colors.lightGrey },
                headerTintColor: R.colors.darkGreen,
                headerRight: () => (
                    <TouchableOpacity style={styles.btnAdd} onPress={() => this.setState({ showModal: true })} >
                        <Icon name="add-outline" color="#fff" size={40} />
                    </TouchableOpacity>
                )
            });

            actionId = order.actionID;

            try {
                var response = await services.getOrderDetails(selectedOrders, CheckType.Checkin);
                if (response) {
                    details = response;
                    details = details.map((d) => { d.expiryDate ? d.expiryDate = moment(d.expiryDate, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY") : null; return d })
                }
            }
            catch (error) {
                global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
            }
        }
        this.setState({ selectedOrders, details, actionId, isLoading: false })
    }

    hideModal = () => {
        this.setState({ showModal: false });
    }

    addItem = (item) => {
        let details = this.state.details;
        details.push(item);
        this.setState({ details, showModal: false });
    }

    deleteItem = (itemId) => {
        let details = this.state.details;
        details = details.filter((item) => item.itemId != itemId);
        this.setState({ details });
    }

    start = async () => {
        if (!this.state.isSending) {
            this.setState({ isSending: true }, async () => {
                let selectedOrders = this.state.selectedOrders;
                let details = this.state.details;
                if (selectedOrders && selectedOrders.length > 0 && details && details.length > 0) {
                    details = details.map((d) => { d.expiryDate ? d.expiryDate = removeTime(d.expiryDate) : null; return d })
                    let warehouses = await services.getWarehouses(this.props.FromTab === 0 || this.props.FromTab === 7);

                    let res = await Promise.all(details.map(async (d) => {
                        let item = await services.getItem(d.itemId);
                        const isExpiryDateRequired = item.isExpiry;
                        if (isExpiryDateRequired == 1 && d.expiryDate == null) {
                            return d;
                        }
                    }));
                    if (res[0] != undefined) {
                        this.setState({ isSending: false });
                        return;
                    }
                    let whouses = details.map((d) => {
                        let selectedWhouse = warehouses.find((w) => w.id == d.fromWhouseId);
                        if (selectedWhouse == undefined || selectedWhouse == null || d.qty == 0) { this.setState({ isSending: false }); return d; }
                    });
                    if (whouses != null && whouses[0] != undefined) {
                        this.setState({ isSending: false });
                        return;
                    }
                    if (global.QtyError == true) { this.setState({ isSending: false }); return; }
                    let order = this.state.selectedOrders[0];
                    var data = { actionId: order.actionID, checkType: this.state.actionId == ActionType.Transfer ? CheckType.Checkout : CheckType.Checkin };
                    data.flowDataDetailTable = selectedOrders;
                    data.flowDataProdutionItems = details;
                    var response = await services.saveOrder(data);
                    this.props.navigation.goBack();
                    this.props.route.params.onBack();
                }
                else
                    global.toast.show(translate('msgNoOrderSelected'), { type: "danger" });

                this.setState({ isSending: false });
            })
        }
    }

    renderItem = ({ item, index }) => {
        return (
            <RawItemDetails item={item} actionId={this.state.actionId} delete={this.deleteItem} />
        )
    }

    renderFooter = () => {
        return (
            <View style={styles.footer}>
                <Button style={styles.btnFooter}
                    text={this.state.actionId == ActionType.Transfer ? translate('transfer') : translate('start')}
                    onPress={this.start} />
            </View>
        )
    }

    render() {
        const selectedOrders = this.state.selectedOrders;
        let order = null
        if (selectedOrders) {
            order = selectedOrders[0]
        }
        return (
            <Screen>
                {this.state.isLoading ?
                    (<ActivityIndicator color={R.colors.darkGreen} size={'large'} />)
                    :
                    <View style={{ flex: 1, }}>
                        <Text style={{ color: R.colors.darkGreen, fontWeight: 'bold', fontSize: 28, padding: 30, paddingTop:0, paddingBottom: 0 }}>Raw Materials </Text>
                        <View style={{ flex: 1, flexDirection: 'row', maxHeight: 120, padding: 30 }}>
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'white', padding: 15, borderRadius: 5, alignItems: 'center', marginEnd: 20, }}>
                                <Text style={{ color: R.colors.darkGreen, fontWeight: 'bold', fontSize: 20 }}>Produced Item: </Text>
                                <Text style={{ color: R.colors.darkGreen, fontSize: 18 }}>{order?.itemName}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'white', padding: 15, borderRadius: 5, alignItems: 'center', }}>
                                <Text style={{ color: R.colors.darkGreen, fontWeight: 'bold', fontSize: 20 }}>Quantity: </Text>
                                <Text style={{ color: R.colors.darkGreen, fontSize: 18 }}>{order?.qty}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 8 }}>
                            <FlatList
                                data={this.state.details}
                                keyExtractor={(item, index) => index}
                                renderItem={this.renderItem}
                                ListFooterComponent={this.renderFooter}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                        </View>
                    </View>
                }
                <AddItemModal
                    show={this.state.showModal}
                    hide={this.hideModal}
                    actionId={this.state.actionId}
                    add={this.addItem}
                    FromTab={5} />

            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    btnAdd: {
        backgroundColor: R.colors.darkGreen,
        width: 50,
        height: 50,
        borderRadius: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    search: {
        zIndex: 1005,
        elevation: 1005,
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'center',
        width: '80%',
        marginTop: -40,
        justifyContent: 'space-between'
    },
    txtSearch: {
        height: 60,
        width: '90%',
        backgroundColor: R.colors.grey,
        borderRadius: 15,
        padding: 20,
        fontSize: 20
    },
    btnSearch: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        backgroundColor: R.colors.lightGreen,
        borderRadius: 15
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFooter: {
        marginVertical: 20,
        minWidth: '20%',
        marginHorizontal: 50
    },
});
