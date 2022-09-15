import React from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { Button, Modal } from "components/common";
import * as services from "services/orders";
import { translate } from "helpers/utils";
import { CheckType } from "../../types/enums";
import moment from "moment";
import R from "res/R";

export default class ItemsModal extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state =
        {
            order: null,
            items: [],
            isLoading: true
        };
    }

    async componentDidMount() {
        await this.loadItems();
    }

    async componentDidUpdate() {
        await this.loadItems();
    }

    loadItems = async () => {
        if (this.props.show && (this.props.order != this.state.order)) {
            let items = [];
            var response = await services.getOrderDetails([this.props.order], CheckType.Checkout);
            if (response) {
                items = response;
            }
            this.setState({ order: this.props.order, items, isLoading: false })
        }
    }

    renderItem = ({ item, index }) => {
        return (
            <View style={styles.container} >
                <View style={styles.body}>
                    <View style={styles.row}>
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
                                {translate('lotNumber')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.spec}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('quantity')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.qty}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('unit')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.unit}
                            </Text>
                        </View>
                    </View>
                    {this.props.actionId == 26 ?
                        <View style={styles.row}>
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('fromWarehouse')}:
                                </Text>
                                <Text style={styles.info}>
                                    {item.fromWhouseName}
                                </Text>
                            </View>
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('toWarehouse')}:
                                </Text>
                                <Text style={styles.info}>
                                    {item.toWhouseName}
                                </Text>
                            </View>
                        </View>
                        : null}
                    <View style={styles.row}>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('expiryDate')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.expiryDate ? moment(item.expiryDate).format("DD/MM/YYYY") : ""}
                            </Text>
                        </View>
                        {this.props.actionId != 26 ?
                            <View style={styles.group}>
                                <Text style={styles.title}>
                                    {translate('warehouse')}:
                                </Text>
                                <Text style={styles.info}>
                                    {item.fromWhouseName}
                                </Text>
                            </View>
                            : null}
                    </View>
                </View>
            </View>
        )
    }


    render() {
        return (
            <Modal show={this.props.show} hide={this.props.hide}>
                <View style={styles.body}>
                    <FlatList
                        listKey="items"
                        data={this.state.items}
                        keyExtractor={(item, index) => item.itemId}
                        renderItem={this.renderItem}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    />
                </View>
                <View style={styles.footer}>
                    <Button style={styles.button} text={translate('back')} onPress={() => { this.props.hide() }} />
                </View>
            </Modal>
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
    body: {
        backgroundColor: R.colors.lightGrey,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20
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
        fontSize: 20,
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
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        marginHorizontal: 10
    }
});