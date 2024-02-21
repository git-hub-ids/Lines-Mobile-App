import React from "react";
import {
  ScrollView,
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Screen, Button } from "components/common";
import { RawItemDetails, AddItemModal } from "components/orders";
import * as services from "services/orders";
import { translate, removeTime } from "helpers/utils";
import moment from "moment";
import { CheckType, ActionType } from "../types/enums";
import R from "res/R";
export default class OrderDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOrders: [],
      details: [],
      selectedOrderIndex: 0,
      showModal: false,
      isSending: false,
      isLoading: true,
    };
  }

  componentDidMount = async () => {
    let selectedOrders = this.props.route.params?.selectedOrders;
    let details = [];
    let actionId = 0;
    if (selectedOrders && selectedOrders.length > 0) {
      let order = selectedOrders[0];
      this.props.navigation.setOptions({
        title: (
          <Text
            style={{
              color: R.colors.darkGreen,
              fontWeight: "bold",
              fontSize: 28,
              padding: 30,
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            {translate("RawMaterials")}
          </Text>
        ),
        headerStyle: { backgroundColor: R.colors.lightGrey },
        headerTintColor: R.colors.darkGreen,
        // headerRight: () => (
        //     <TouchableOpacity style={styles.btnAdd} onPress={() => this.setState({ showModal: true })} >
        //         <Icon name="add-outline" color="#fff" size={40} />
        //     </TouchableOpacity>
        // )
      });

      actionId = order.actionID;

      try {
        var response = await services.getOrderDetails(
          selectedOrders,
          CheckType.Checkin
        );
        if (response) {
          details = response;
          details = details.map((d) => {
            d.expiryDate
              ? (d.expiryDate = moment(
                  d.expiryDate,
                  "YYYY-MM-DD HH:mm:ss"
                ).format("DD/MM/YYYY"))
              : null;
            return d;
          });
        }
      } catch (error) {
        global.toast.show(translate("msgErrorOccurred"), { type: "danger" });
      }
    }
    this.setState({ selectedOrders, details, actionId, isLoading: false });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  addItem = (item) => {
    let details = this.state.details;
    details.push(item);
    item.flowId = this.state.selectedOrderIndex;
    this.setState({ details, showModal: false, selectedOrderIndex: 0 });
  };

  // deleteItem = (itemId,key) => {

  //     let details = this.state.details;
  //     details = details.filter((item) => item.itemId != itemId);
  //     this.setState({ details });
  // }
  deleteItem = (flowDataId, itemId) => {
    let details = this.state.details;
    details = details.filter(
      (item) => !(item.itemId == itemId && item.flowId == flowDataId)
    );
    this.setState({ details });
  };

  start = async () => {
    if (!this.state.isSending) {
      this.setState({ isSending: true }, async () => {
        let selectedOrders = this.state.selectedOrders;
        let details = this.state.details;
        if (
          selectedOrders &&
          selectedOrders.length > 0 &&
          details &&
          details.length > 0
        ) {
          details = details.map((d) => {
            d.expiryDate ? (d.expiryDate = removeTime(d.expiryDate)) : null;
            return d;
          });
          let warehouses = await services.getWarehouses(
            this.props.FromTab === 0 || this.props.FromTab === 7
          );
          let res = await Promise.all(
            details.map(async (d) => {
              let item = await services.getItem(d.itemId);
              const isExpiryDateRequired = item.isExpiry;
              if (isExpiryDateRequired == 1 && d.expiryDate == null) {
                return d;
              }
            })
          );
          if (res[0] != undefined) {
            this.setState({ isSending: false });
            return;
          }
          let whouses = await Promise.all(
            details.map(async (d) => {
              let availableQty = 0;
              let selectedWhouse = warehouses.find(
                (w) => w.id == d.fromWhouseId
              );
              if (
                warehouses.length == 1 &&
                (selectedWhouse == undefined || selectedWhouse == null)
              ) {
                const whouseQty = await services.getAvailableQty(
                  d.itemId,
                  warehouses[0].id,
                  d.spec,
                  d.expiry
                );
                availableQty = whouseQty;
                if (d.qty > availableQty) {
                  this.setState({ isSending: false });
                  return d;
                }
              } else if (
                selectedWhouse == undefined ||
                selectedWhouse == null ||
                d.qty == 0
              ) {
                this.setState({ isSending: false });
                return d;
              }
            })
          );
          if (whouses != null && whouses[0] != undefined) {
            global.toast.show(translate("msgErrorQtyUnavailable"), {
              type: "danger",
            });
            this.setState({ isSending: false });
            return;
          }
          if (global.QtyError == true) {
            global.toast.show(translate("msgErrorQtyUnavailable"), {
              type: "danger",
            });
            this.setState({ isSending: false });
            return;
          }
          let order = this.state.selectedOrders[0];
          var data = {
            actionId: order.actionID,
            checkType:
              this.state.actionId == ActionType.Transfer
                ? CheckType.Checkout
                : CheckType.Checkin,
          };
          data.flowDataDetailTable = selectedOrders;
          data.flowDataProdutionItems = details;
          data.ProductionCenterID = global["LocationId"];
          var response = await services.saveOrder(data);
          this.props.navigation.goBack();
          this.props.route.params.onBack();
        } else
          global.toast.show(translate("msgNoOrderSelected"), {
            type: "danger",
          });

        this.setState({ isSending: false });
      });
    }
  };

  renderItem = ({ item, index }) => {
    return (
      <RawItemDetails
        item={item}
        actionId={this.state.actionId}
        delete={this.deleteItem}
      />
    );
  };

  // renderFooter = () => {
  //     return (
  //         <View style={styles.footer}>
  //             <Button style={styles.btnFooter}
  //                 text={this.state.actionId == ActionType.Transfer ? translate('transfer') : translate('start')}
  //                 onPress={this.start} />
  //         </View>
  //     )
  // }

  // render() {
  //     const selectedOrders = this.state.selectedOrders;
  //     let order = null
  //     if (selectedOrders) {
  //         order = selectedOrders[0]
  //     }
  //     return (
  //         <Screen>
  //             {this.state.isLoading ?
  //                 (<ActivityIndicator color={R.colors.darkGreen} size={'large'} />)
  //                 :
  //                 <View style={{ flex: 1, }}>
  //                                             <View style={{ flex: 1, flexDirection: 'row', maxHeight: 120, padding: 30 }}>
  //                         <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'white', padding: 15, borderRadius: 5, alignItems: 'center', marginEnd: 20, }}>
  //                             <Text style={{ color: R.colors.darkGreen, fontWeight: 'bold', fontSize: 20 }}>{translate('ProducedItem')}, </Text>
  //                             <Text style={{ color: R.colors.darkGreen, fontSize: 18 }}>{order?.itemName}</Text>
  //                         </View>
  //                         <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'white', padding: 15, borderRadius: 5, alignItems: 'center', }}>
  //                             <Text style={{ color: R.colors.darkGreen, fontWeight: 'bold', fontSize: 20 }}>{translate('quantity')}: </Text>
  //                             <Text style={{ color: R.colors.darkGreen, fontSize: 18 }}>{order?.qty}</Text>
  //                         </View>
  //                     </View>
  //                     <View style={{ flex: 8 }}>
  //                         <FlatList
  //                             data={this.state.details}
  //                             keyExtractor={(item, index) => index}
  //                             renderItem={this.renderItem}
  //                             ListFooterComponent={this.renderFooter}
  //                             contentContainerStyle={{ paddingBottom: 10 }}
  //                         />
  //                     </View>
  //                 </View>
  //             }
  //             <AddItemModal
  //                 show={this.state.showModal}
  //                 hide={this.hideModal}
  //                 actionId={this.state.actionId}
  //                 add={this.addItem}
  //                 FromTab={5} />

  //         </Screen>
  //     );
  // }
  render() {
    const selectedOrders = this.state.selectedOrders;

    const { width, height } = Dimensions.get("window");
    const buttonPosition = {
      top: height * 0.08, // Adjust the percentage as needed
      right: width * 0.06, // Adjust the percentage as needed
    };
    return (
      <Screen>
        {this.state.isLoading ? (
          <ActivityIndicator color={R.colors.darkGreen} size={"large"} />
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {selectedOrders.map((order, index) => {
              const orderDetails = this.state.details.filter(
                (detail) => detail.flowId === order.flowDataId
              );
              return (
                <React.Fragment key={index}>
                  {index <= selectedOrders.length - 1 && (
                    <View style={styles.separator} />
                  )}
                  <View style={styles.itemContainer}>
                    {/* Move quantity to the left */}
                    <View style={styles.leftContent}>
                      <Text style={styles.itemText}>
                        <Text style={styles.boldText}>
                          {translate("ProducedItem")}:{" "}
                        </Text>
                        <Text style={styles.item}>
                          {order.produceditemname}
                        </Text>
                      </Text>
                    </View>

                    {/* Move product name to the right */}
                    <View style={styles.rightContent}>
                      <Text style={styles.itemText}>
                        <Text style={styles.boldText}>
                          {translate("quantity")}:{" "}
                        </Text>
                        <Text style={styles.item}>
                          {order.producedqty}
                          {order.producedUnit}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Add a line and a title above the Add button */}

                  <View style={styles.titleContainer2}>
                    <View style={styles.titleLine} />
                    <Text style={styles.titleText}>Raw Materials</Text>
                  </View>

                  {/* Add button aligned to the right */}
                  <TouchableOpacity
                    style={[styles.addButton, styles.absoluteButton, buttonPosition]}
                    onPress={() =>
                      this.setState({
                        showModal: true,
                        selectedOrderIndex: order.flowDataId,
                      })
                    }
                  >
                    <Icon name="add-outline" color="#fff" size={30} />
                  </TouchableOpacity>

                  <View style={{ flex: 8 }}>
                    {orderDetails.map((item, itemIndex) => (
                      <RawItemDetails
                        key={itemIndex}
                        item={item}
                        actionId={this.state.actionId}
                        delete={() => this.deleteItem(item.flowId, item.itemId)}
                      />
                    ))}
                  </View>
                </React.Fragment>
              );
            })}
            {/* Start Button */}
            <View style={styles.footer}>
              <Button
                style={styles.btnFooter}
                text={
                  this.state.actionId == ActionType.Transfer
                    ? translate("transfer")
                    : translate("start")
                }
                onPress={this.start}
              />
            </View>
          </ScrollView>
        )}
        <AddItemModal
          show={this.state.showModal}
          hide={this.hideModal}
          actionId={this.state.actionId}
          add={this.addItem}
          FromTab={5}
        />
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },

  titleContainer2: {
    alignItems: 'center',
    marginTop: 10,
  },
  titleLine: {
    borderBottomWidth: 1,
    borderBottomColor: R.colors.darkGreen,
    width: "80%",
    marginBottom: 5,
  },
  titleText: {
    color: R.colors.darkGreen,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: R.colors.darkGreen,
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteButton: {
    position: 'absolute',
    top: 120, // Adjust the top positioning as needed
    right: 30, // Adjust the right positioning as needed
  },

  unit: {
    color: R.colors.darkGreen,
    fontSize: 25, // Adjust the font size for the unit as needed
    marginBottom: 5,
  },
  leftContent: {
    flex: 1,
    paddingRight: 10, // Add right padding for spacing
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    color: R.colors.darkGreen,
    fontSize: 20,
    marginBottom: 5,
  },
  boldText: {
    color: R.colors.darkGreen,
    fontWeight: "bold",
    fontSize: 20, // Adjust the font size as needed
    marginBottom: 5,
  },
  item: {
    color: R.colors.darkGreen,
    fontSize: 15,
    marginBottom: 5,
  },
  quantityText: {
    color: R.colors.darkGreen,
    fontSize: 35,
    marginBottom: 5,
  },
  quantity: {
    color: R.colors.darkGreen,
    fontSize: 25,
    marginBottom: 5,
  },
  AddRawMaterial: {
    color: R.colors.darkGreen,
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },

  btnAdd: {
    backgroundColor: R.colors.darkGreen,
    width: 50,
    height: 50,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    borderBottomWidth: 7,
    borderBottomColor: R.colors.darkGreen,
    marginHorizontal: 10,
  },

  search: {
    zIndex: 1005,
    elevation: 1005,
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
    width: "80%",
    marginTop: -40,
    justifyContent: "space-between",
  },
  txtSearch: {
    height: 60,
    width: "90%",
    backgroundColor: R.colors.grey,
    borderRadius: 15,
    padding: 20,
    fontSize: 20,
  },
  btnSearch: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    backgroundColor: R.colors.lightGreen,
    borderRadius: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnFooter: {
    marginVertical: 20,
    minWidth: "20%",
    marginHorizontal: 50,
  },
});
