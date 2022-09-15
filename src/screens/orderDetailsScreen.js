import React from "react";
import { StyleSheet, FlatList, View, ActivityIndicator, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Screen, Button } from "components/common";
import { RawItemDetails, AddItemModal } from "components/orders";
import * as services from "services/orders";
import { translate, removeTime } from "helpers/utils";
import { CheckType } from "../types/enums";
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
                title: order.itemName,
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
                    let order = this.state.selectedOrders[0];
                    var data = { actionId: order.actionID, checkType: this.state.actionId == 26 ? CheckType.Checkout : CheckType.Checkin };
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
                    text={this.state.actionId == 26 ? translate('transfer') : translate('start')}
                    onPress={this.start} />
            </View>
        )
    }

    render() {
        return (
            <Screen>
                {this.state.isLoading ?
                    (<ActivityIndicator color={R.colors.darkGreen} size={'large'} />)
                    :
                    <>
                        <FlatList
                            data={this.state.details}
                            keyExtractor={(item, index) => index}
                            renderItem={this.renderItem}
                            ListFooterComponent={this.renderFooter}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />
                    </>
                }
                <AddItemModal
                    show={this.state.showModal}
                    hide={this.hideModal}
                    actionId={this.state.actionId}
                    add={this.addItem} />

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
