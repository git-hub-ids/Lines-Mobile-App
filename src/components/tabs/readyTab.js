import React from "react";
import { StyleSheet, FlatList, View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { Button } from "components/common";
import Order from "components/orders/order";
import * as services from "services/orders";
import { translate } from "helpers/utils";
import { OrderStatus, CheckType } from "../../types/enums";
import R from 'res/R';

export default class ReadyTabs extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            orders: [],
            selectedOrders: [],
            isLoading: false,
            isSending: false,
            isRefresh: false
        };
    }

    componentDidMount = async () => {
        this.init();
        this.unsubscribe = this.props.tabsProps.navigation.addListener('focus', (e) => {
            this.init();
        });
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!this.state.isLoading && this.state.isRefresh)
            this.init();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onRefresh = () => {
        this.setState({ isRefresh: true });
    }

    init = async () => {
        const { locationId, stepId } = this.props;
        var orders = [];
        try {
            this.setState({ isLoading: true }, async () => {
                var response = await services.getOrders(locationId, stepId, OrderStatus.Ready);
                if (response)
                    orders = response;
                this.setState({ orders, selectedOrders: [], isLoading: false, isRefresh: false })
            })
        }
        catch (error) {
            global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
            this.setState({ orders, selectedOrders: [], isLoading: false, isRefresh: false })
        }
    }

    checked = (item) => {
        if (item) {
            var selectedOrders = this.state.selectedOrders;
            if (selectedOrders?.length > 0) {
                if (selectedOrders[0].actionID != item.actionID) {
                    item.checked = false;
                    global.toast.show(translate('msgCantSelectOrder'), { type: "danger" });
                    return
                }
            }
            if (item.checked) {
                selectedOrders.push(item)
            }
            else {
                selectedOrders = selectedOrders.filter(i => i != item)
            }
            this.setState({ selectedOrders });
        }
    }

    begin = () => {
        var selectedOrders = this.state.selectedOrders;
        if (selectedOrders.length > 0) {
            this.props.navigation.navigate('OrderDetails', { selectedOrders: selectedOrders, onBack: this.onBack });
        }
    }

    skip = async () => {
        if (!this.state.isSending) {
            this.setState({ isSending: true }, async () => {
                let selectedOrders = this.state.selectedOrders;
                if (selectedOrders && selectedOrders.length > 0) {
                    let order = this.state.selectedOrders[0];
                    var data = { actionId: order.actionID, checkType: CheckType.Skip };
                    data.flowDataDetailTable = selectedOrders;
                    data.flowDataProdutionItems = [];
                    await services.saveOrder(data);
                    this.setState({ isRefresh: true })
                }
                else
                    global.toast.show(translate('msgNoOrderSelected'), { type: "danger" });

                this.setState({ isSending: false });
            })
        }
    }

    onBack = () => {
        this.setState({ isRefresh: true })
    }

    renderItem = (item) => {
        return (
            <Order status={OrderStatus.Ready} item={item} checked={this.checked} />
        )
    }

    renderSeparator = () => {
        return (
            <View style={R.styles.separator} />
        )
    }

    render() {
        return (
            this.state.isLoading ?
                <ActivityIndicator color={R.colors.darkGreen} size={'large'} />
                :
                <>
                    <FlatList
                        listKey='ready-list'
                        data={this.state.orders}
                        keyExtractor={(item) => item.flowDataDetailId}
                        renderItem={({ item, index }) => this.renderItem(item, index)}
                        ItemSeparatorComponent={this.renderSeparator}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isRefresh}
                                onRefresh={this.onRefresh}
                            />
                        }
                    />
                    {this.state.orders?.length == 0 ?
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                {translate('msgNoOrdersYet')}
                            </Text>
                        </View>
                        : null}
                    {this.state.orders?.length > 0 ?
                        <View style={styles.footer}>
                            <Button
                                disabled={this.state.selectedOrders.length == 0}
                                style={styles.btnFooter}
                                text={translate('begin')}
                                onPress={this.begin} />
                            <Button
                                disabled={this.state.selectedOrders.length == 0}
                                secondary={true}
                                style={styles.btnFooter}
                                text={translate('skip')}
                                onPress={this.skip} />
                        </View>
                        : null}
                </>
        );
    }
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnFooter: {
        bottom: 20,
        minWidth: '20%',
        marginHorizontal: 50
    },
    btnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#fff",
        letterSpacing: 2,
    },
    empty: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        color: R.colors.darkGrey,
        fontSize: 24
    }
});
