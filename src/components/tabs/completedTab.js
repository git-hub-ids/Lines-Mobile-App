import React from "react";
import { StyleSheet, FlatList, View, Text, ActivityIndicator, RefreshControl } from "react-native";
import Order from "components/orders/order";
import * as services from "services/orders";
import * as lookups from "services/lookup";
import { translate } from "helpers/utils";
import { OrderStatus } from "../../types/enums";
import R from 'res/R';

export default class CompletedTabs extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            orders: [],
            isLoading: false,
            isRefresh: false,
            isLoadMore: false,
            canLoadMore: true,
            skip: 0,
            take: 10
        };
    }

    componentDidMount() {
        lookups.getCharges();
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

    init = async () => {
        var orders = [];
        try {
            this.setState({ isLoading: true }, async () => {
                let skip = 0, take = 10;
                var response = await this.getData(skip, take);
                if (response) {
                    orders = response;
                    skip += 10
                }
                this.setState({ orders, skip, take, isLoading: false, isRefresh: false })
            })
        }
        catch (error) {
            global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
            this.setState({ orders, isLoading: false, isRefresh: false })
        }
    }

    getData = async (skip, take) => {
        const { locationId, stepId } = this.props;
        return await services.getOrders(locationId, stepId, OrderStatus.Completed, skip, take, 1);
    }

    onRefresh = () => {
        this.setState({ isRefresh: true, canLoadMore: true });
    }

    loadMore = async () => {
        try {
            let { orders, skip, take, isLoadMore, canLoadMore } = this.state;
            if (!isLoadMore && canLoadMore) {
                this.setState({ isLoadMore: true }, async () => {
                    let response = await this.getData(skip, take)
                    if (response && response.length > 0) {
                        orders = orders.concat(response);
                        skip += 10
                    }
                    else
                        canLoadMore = false;

                    this.setState({ orders, skip, isLoadMore: false, canLoadMore })
                })
            }
        } catch { }
    }

    onBack = () => {
        this.setState({ isRefresh: true })
    }

    renderItem = (item, index) => {
        return (
            <Order key={index} navigation={this.props.navigation} onBack={this.onBack} status={OrderStatus.Completed} item={item} />
        )
    }

    renderSeparator = () => {
        return (
            <View style={R.styles.separator} />
        )
    }

    renderFooter = () => {
        if (!this.state.isLoadMore) return null;
        return (
            <ActivityIndicator color={R.colors.darkGreen} size='large' />
        );
    };

    render() {
        return (
            this.state.isLoading ?
                <ActivityIndicator color={R.colors.darkGreen} size={'large'} />
                :
                <>
                    <FlatList
                        removeClippedSubviews={false}
                        listKey='completed-list'
                        data={this.state.orders}
                        keyExtractor={(item, index) => item.flowDataDetailId + "-" + index}
                        renderItem={({ item, index }) => this.renderItem(item, index)}
                        ListFooterComponent={this.renderFooter}
                        ItemSeparatorComponent={this.renderSeparator}
                        contentContainerStyle={{ paddingBottom: 50, alignSelf: 'stretch' }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isRefresh}
                                onRefresh={this.onRefresh}
                            />
                        }
                        onEndReached={this.loadMore}
                        onEndReachedThreshold={5}
                    />
                    {this.state.orders?.length == 0 ?
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                {translate('msgNoOrdersYet')}
                            </Text>
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
