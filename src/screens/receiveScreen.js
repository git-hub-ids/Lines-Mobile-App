import React from "react";
import {
  StyleSheet,
  FlatList,
  View,
  I18nManager,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Screen, Button } from "components/common";
import { AddItemModal } from "components/orders";
import { EditableItemSpec } from "components/items";
import * as services from "services/orders";
import { translate, removeTime } from "helpers/utils";
import { CheckType } from "../types/enums";
import R from "res/R";

export default class SendScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      details: [],
      showModal: false,
    };
  }

  componentDidMount = async () => {
    this.props.navigation.setOptions({
      title: translate("receive"),
      headerStyle: { backgroundColor: R.colors.lightGrey },
      headerTintColor: R.colors.darkGreen,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => this.props.navigation.goBack()}
        >
          <Icon
            name={
              I18nManager.isRTL
                ? "chevron-forward-outline"
                : "chevron-back-outline"
            }
            color="#fff"
            size={40}
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => this.setState({ showModal: true })}
        >
          <Icon name="add-outline" color="#fff" size={40} />
        </TouchableOpacity>
      ),
    });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  addItem = (item) => {
    let details = this.state.details;
    // item by default has from Warehouse Id
    // receive item to warehouse
    // replace the selected wharehouse id, from -> to
    item.toWhouseId = item.fromWhouseId;
    item.fromWhouseId = 0;
    details.push(item);
    this.setState({ details, showModal: false });
  };

  deleteItem = (itemId) => {
    let details = this.state.details;
    details = details.filter((item) => item.itemId != itemId);
    this.setState({ details });
  };

  receive = async () => {
    let details = this.state.details;
    if (details && details.length > 0) {
      details = details.map((d) => {
        d.expiryDate ? (d.expiryDate = removeTime(d.expiryDate)) : null;
        return d;
      });
      var data = { actionId: 26, checkType: CheckType.Checkout };
      data.flowDataDetailTable = [];
      data.flowDataProdutionItems = details;
      var response = await services.saveOrder(data);
      this.setState({ details: [] });
    } else global.toast.show(translate("msgNoItemsAdded"), { type: "danger" });
  };

  renderItem = ({ item, index }) => {
    return (
      <EditableItemSpec type={"receive"} item={item} delete={this.deleteItem} />
    );
  };

  renderFooter = () => {
    return (
      <View style={styles.footer}>
        <Button
          style={styles.btnFooter}
          text={translate("receive")}
          onPress={this.receive}
        />
      </View>
    );
  };

  render() {
    return (
      <Screen>
        <FlatList
          data={this.state.details}
          keyExtractor={(item, index) => index}
          renderItem={this.renderItem}
          ListFooterComponent={this.renderFooter}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        <AddItemModal
          actionId={28}
          show={this.state.showModal}
          hide={this.hideModal}
          add={this.addItem}
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
