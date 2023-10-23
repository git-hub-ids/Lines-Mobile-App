import React from "react";
import { StyleSheet, FlatList, View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { Button } from "components/common";
import Order from "components/orders/order";
import * as services from "services/orders";
import { translate } from "helpers/utils";
import { OrderStatus } from "../../types/enums";
import R from 'res/R';

export default class ProgressTabs extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            orders: [],
            selectedOrders: [],
            isLoading: false,
            isRefresh: false,
        };
    }

    componentDidMount = async () => {
        this.init();
        this.unsubscribe = this.props.tabsProps.navigation.addListener('focus', (e) => {
            this.init();
        });
        this.refreshInterval = setInterval(this.init, 120000);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (!this.state.isLoading && this.state.isRefresh)
            this.init();
    }

    componentWillUnmount() {
        this.unsubscribe();
        clearInterval(this.refreshInterval);
    }

    onRefresh = () => {
        this.setState({ isRefresh: true });
    }

    init = async () => {
        const { locationId, stepId } = this.props;
        var orders = [];
        try {
            this.setState({ isLoading: true }, async () => {
                var response = await services.getOrders(locationId, stepId, OrderStatus.Progress);
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
            let orders = this.state.orders;
            let selectedOrders = this.state.selectedOrders;
            if (item.checked) {
                if (selectedOrders.length == 0) {
                    selectedOrders = orders.filter(o => o.flowDataProductionId == item.flowDataProductionId);
                    let productionId = selectedOrders[0].flowDataProductionId;
                    orders = orders.map((order) => { order.flowDataProductionId == productionId ? order.checked = true : order.checked = false; return order; });
                }
                else {
                    item.checked = false;
                    global.toast.show(translate('msgCantSelectMultiOrders'), { type: "danger" });
                }
            }
            else {
                selectedOrders = [];
                orders = orders.map((order) => { order.checked = false; return order; });
            }
            this.setState({ orders, selectedOrders });
        }
    }

    view = () => {
        var selectedOrders = this.state.selectedOrders;
        if (selectedOrders.length > 0) {
            this.props.navigation.navigate('ProducedItems', { selectedOrders: selectedOrders, onBack: this.onBack });
        }
    }

    onBack = () => {
        this.setState({ isRefresh: true })
    }

    renderItem = (item) => {
        return (
            <Order status={OrderStatus.Progress} item={item} checked={this.checked} />
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
                        listKey='progress-list'
                        data={this.state.orders}
                        extraData={this.state.orders}
                        keyExtractor={(item) => item.flowDataDetailId}
                        renderItem={({ item, index }) => this.renderItem(item, index)}
                        ItemSeparatorComponent={this.renderSeparator}
                        contentContainerStyle={{ paddingBottom: 10, alignSelf: 'stretch' }}
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
                            <Button disabled={this.state.selectedOrders.length == 0} style={styles.btnFooter} text={translate('view')} onPress={this.view} />
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
