import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button } from "components/common";
import { AddChargeModal }  from "components/charges"
import { translate } from "helpers/utils";
import { OrderStatus, CheckType } from "../../types/enums";
import * as services from "services/orders";
import moment from "moment";
import R from "res/R";

export default class SearchItem extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            showModal: false,
            isBusy: false,
        };
    }

    onBack = () => {
        this.props.onBack();
        this.props.navigation.goBack();
    }

    begin = () => {
        let selectedOrders = [this.props.item]
        this.props.navigation.navigate('OrderDetails', { selectedOrders: selectedOrders, onBack: this.onBack });
    }

    skip = () => {
        if (!this.state.isBusy) {
            this.setState({ isBusy: true }, async () => {
                let order = this.props.item;
                var data = { actionId: order.actionID, checkType: CheckType.Skip };
                data.flowDataDetailTable = [order];
                data.flowDataProdutionItems = [];
                await services.saveOrder(data);
                this.setState({ isBusy: false });
                this.onBack();
            })
        }
    }

    view = () => {
        let selectedOrders = [this.props.item]
        this.props.navigation.navigate('ProducedItems', { selectedOrders: selectedOrders, onBack: this.onBack });
    }

    hideModal = () => {
        this.setState({ showModal: false });
    }

    saveCharge = async (charges) => {
        if (charges && charges.length > 0) {
            var data = {
                flowDataDetailTable: [{
                    flowDataDetailId: this.props.item.flowDataDetailId,
                    flowDataProductionId: this.props.item.flowDataProductionId
                }],
                chargesTable: charges
            }
            await services.saveCharges(data);
            this.props.item.charges = charges;
            this.setState({ showModal: false });
        }
    }

    render() {
        const item = this.props.item;
        return (
            <View style={styles.container}>
                <View style={styles.details} >
                    <View >
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('workflowName')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.templateName}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('itemName')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.itemName}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('soNumber')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.soNumber}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('poNumber')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.poNumber}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('clientName')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.peopleName}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('expectedDate')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.expectedDate ? moment(item.expectedDate).format("DD/MM/YYYY HH:mm:ss") : ""}
                            </Text>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.title}>
                                {translate('status')}:
                            </Text>
                            <Text style={styles.info}>
                                {item.statusID == OrderStatus.Ready ? translate('ready') : item.statusID == OrderStatus.Progress ? translate('processed') : translate('completed')}
                            </Text>
                        </View>
                    </View>
                    {   /* charges field */
                        item.statusID == OrderStatus.Completed && item?.actionID == 28 ?
                            <View style={styles.charges}>
                                <Text style={styles.title}>{translate('charges')}:</Text>
                                <View>
                                    {item.charges.map((charge) =>
                                        (<Text style={[styles.info, { paddingStart: 0 }]}>{charge.chargesType + ": " + charge.chargesQty}</Text>)
                                    )}
                                </View>
                            </View>
                            : null
                    }
                    <View style={styles.actionContainer}>
                        {item.statusID == OrderStatus.Ready ?
                            <>
                                <Button text={translate("begin")} onPress={this.begin} />
                                <Button text={translate("skip")} secondary={true} onPress={this.skip} />
                            </>
                            : item.statusID == OrderStatus.Progress ?
                                <Button text={translate("view")} onPress={this.view} />
                                : item.actionID != 26 && item.charges?.length == 0 ?
                                    <Button text={translate('addCharge')} onPress={() => this.setState({ showModal: true })} />
                                    : null
                        }
                    </View>
                </View>
                {item.statusID == OrderStatus.Completed && item.actionID != 26 && item.charges?.length == 0 ?
                    <AddChargeModal
                        show={this.state.showModal}
                        hide={this.hideModal}
                        action={this.saveCharge} />
                    : null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        alignSelf: 'stretch',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    group: {
        flexDirection: 'row'
    },
    title: {
        color: R.colors.darkGrey,
        fontSize: 20,
        fontWeight: 'bold'
    },
    info: {
        paddingStart: 10,
        color: R.colors.darkGreen,
        fontSize: 20,
        fontWeight: 'bold'
    },
    button: {
        marginHorizontal: 10,
        maxHeight: 55
    },
    btnText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    charges: {
        width: '30%'
    },
    actionContainer: {
        alignContent: 'center',
        justifyContent: 'space-between'
    }
});