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
    global["LocationId"] = 0;
    global["LocationTitle"] = "";
    this.props.navigation.setOptions({
      title: translate("send"),
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 24
      },
      headerStyle: { backgroundColor: R.colors.lightGrey },
      headerTintColor: R.colors.darkGreen,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => this.Back()}
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
  Back = () => {
    this.props.navigation.goBack()
    global["LocationId"] = global["StepLocationId"];
    global["LocationTitle"] = global["StepLocationTitle"];
  }
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

  send = async () => {
    let details = this.state.details;
    if (details && details.length > 0) {
      details = details.map((d) => {
        d.expiryDate ? (d.expiryDate = removeTime(d.expiryDate)) : null;
        return d;
      });
      let res = details.map((d) => {
        if (d.qty == 0) { this.setState({ isSending: false }); return d; }
         });
        if (res != null &&  res[0] != undefined) {
            return;
        }
      if (global.QtyError == true)
      return;
      var data = { actionId: 26, checkType: CheckType.Checkout };
      data.flowDataDetailTable = [];
      data.flowDataProdutionItems = details;
      var response = await services.saveOrder(data);
      this.setState({ details: [] });
    } else global.toast.show(translate("msgNoItemsAdded"), { type: "danger" });
  };

  renderItem = ({ item, index }) => {
    return (
      <EditableItemSpec type={"send"} item={item} delete={this.deleteItem} FromTab={0} />
    );
  };

  renderFooter = () => {
    return (
      <View style={styles.footer}>
        <Button
          style={styles.btnFooter}
          text={translate("send")}
          onPress={this.send}
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
          FromTab={0}
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
