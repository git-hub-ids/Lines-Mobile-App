import React from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Screen, Button } from "components/common";
import { AddProducedItemModal } from "components/orders";
import { EditableItem } from "components/items";
import * as services from "services/orders";
import { translate, removeTime } from "helpers/utils";
import { CheckType } from "../types/enums";
import R from "res/R";

export default class ProducedItemsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOrders: [],
      details: [],
      actionId: 0,
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
      actionId = order.actionID;
      try {
        var response = await services.getOrderDetails(
          selectedOrders,
          CheckType.Checkout
        );
        if (response) {
          details = response;
        }
      } catch (error) {
        global.toast.show(translate("msgErrorOccurred"), { type: "danger" });
      }

      var hidePlus = actionId == 28 && details.length >= 1;
      this.props.navigation.setOptions({
        title: order.itemName,
        headerStyle: { backgroundColor: R.colors.lightGrey },
        headerTintColor: R.colors.darkGreen,
        headerRight: () => this.setHeaderRight(hidePlus),
      });
    }
    this.setState({ selectedOrders, details, actionId, isLoading: false });
  };

  componentDidUpdate(prevProps, prevState) {
    var hidePlus = this.state.actionId == 28 && this.state.details.length >= 1;
    this.props.navigation.setOptions({
      headerRight: () => this.setHeaderRight(hidePlus),
    });
  }

  setHeaderRight = (hide) => {
    if (!hide) {
      return (
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => this.setState({ showModal: true })}
        >
          <Icon name="add-outline" color="#fff" size={40} />
        </TouchableOpacity>
      );
    } else null;
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  addItem = (item) => {
    let details = this.state.details;
    details.push(item);
    this.setState({ details, showModal: false });
  };

  deleteItem = (itemId) => {
    let details = this.state.details;
    details = details.filter((item) => item.itemId != itemId);
    this.setState({ details });
  };

  finish = async () => {
    if (!this.state.isSending) {
      this.setState({ isSending: true }, async () => {
        let selectedOrders = this.state.selectedOrders;
        let order = selectedOrders[0];
        let details = this.state.details;
        if (order && details && details.length > 0) {
          details = details.map((d) => {
            d.expiryDate ? (d.expiryDate = removeTime(d.expiryDate)) : null;
            return d;
          });
          let warehouses = await services.getWarehouses(this.props.FromTab === 0 || this.props.FromTab === 7);
          let whouses = details.map((d) => {
              let selectedWhouse = warehouses.find((w) => w.id == d.fromWhouseId);
              if (selectedWhouse == undefined || selectedWhouse == null || d.qty == 0) { this.setState({ isSending: false }); return d; }
               });
              if (whouses != null &&  whouses[0] != undefined) {
                  this.setState({ isSending: false });
                  return;
              }
              let res = await Promise.all(details.map(async (d) => {
                let item = await services.getItem(d.itemId); 
                const isExpiryDateRequired = item.isExpiry;
                if(isExpiryDateRequired == 1 && d.expiryDate == null ){
                    return d;
                }
             }));
             if(res[0] != undefined){
                this.setState({ isSending: false });
                return ;
             }
              if (global.ExpiryDateError == true)
              {this.setState({ isSending: false });return;}
          var data = {
            actionId: order.actionID,
            checkType: CheckType.Checkout,
          };
          data.flowDataDetailTable = selectedOrders;
          data.flowDataProdutionItems = details;
          data.ProductionCenterID = global["LocationId"];
          var response = await services.saveOrder(data);
          this.props.navigation.goBack();
          this.props.route.params.onBack();
        }
        this.setState({ isSending: false });
      });
    }
  };

  renderItem = ({ item, index }) => {
    return (
      <EditableItem
        item={item}
        actionId={this.state.actionId}
        delete={this.deleteItem}
        FromTab={1}
      />
    );
  };

  renderFooter = () => {
    return (
      <View style={styles.footer}>
        <Button
          style={styles.btnFooter}
          text={translate("finish")}
          onPress={this.finish}
        />
      </View>
    );
  };

  render() {
    return (
      <Screen>
        {this.state.isLoading ? (
          <ActivityIndicator color={R.colors.darkGreen} size={"large"} />
        ) : (
          <FlatList
            data={this.state.details}
            keyExtractor={(item, index) => index}
            renderItem={this.renderItem}
            ListFooterComponent={this.renderFooter}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        )}
        <AddProducedItemModal
          show={this.state.showModal}
          hide={this.hideModal}
          actionId={this.state.actionId}
          add={this.addItem}
          FromTab={1}
        />
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
    alignItems: "center",
    justifyContent: "center",
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
