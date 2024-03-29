import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Button, DropDownList, Modal } from "components/common";
import * as services from "services/orders";
import { translate } from "helpers/utils";
import { ActionType } from "../../types/enums";
import moment from "moment";
import R from "res/R";

export default class AddItemModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      warehouses: [],
      items: [],
      item: {},
      units: [],
      unit: "",
      availableQty: 0,
      qty: 0,
      spec: "",
      specs: [],
      specsOptions: [],
      expiryDate: "",
      isExpiryDateRequired: true,
      fromWhouseId: 0,
      toWhouseId: 0,
      openDatePicker: false,
      showWhouseError: false,
      showQtyError: false,
      showExpiryDateError: false,
      isLoading: true,
    };
  }

  componentDidMount = async () => {
    await this.init();
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (
      prevState.items.length == 0 &&
      this.state.items.length == 0 &&
      !this.state.isLoading
    )
      await this.init();
  };

  init = async () => {
    this.setState({ isLoading: true }, async () => {
      let items = await services.getItems(0, 20);
      let warehouses = await services.getWarehouses();
      this.setState({ items, warehouses, isLoading: false });
    });
  };

  setItem(item) {
    if (item) {
      const units = item.units;
      const specs = item.specExpiryList;
      const isExpiryDateRequired = item.isExpiry;
      const specsOptions = specs.map((i) => {
        return { id: i.spec, value: i.spec, label: i.spec };
      });
      this.setState({
        item,
        units,
        specs,
        isExpiryDateRequired,
        specsOptions,
      });
    }
  }

  setFromWarehouse(fromWhouseId) {
    const { specs, spec, warehouses, qty } = this.state;
    const selectedWhouse = warehouses.find((e) => e.id === fromWhouseId).label;
    const availableQty =
      specs.find((s) => s.whouseName === selectedWhouse && s.spec === spec)
        ?.stOnHand | 0;
    this.setState((state) => ({
      availableQty,
      fromWhouseId,
      showWhouseError: state.toWhouseId > 0 && fromWhouseId == state.toWhouseId,
      showQtyError: qty > availableQty,
    }));
  }

  setToWarehouse(toWhouseId) {
    this.setState((state) => ({
      toWhouseId,
      showWhouseError:
        state.fromWhouseId > 0 && state.fromWhouseId == toWhouseId,
    }));
  }

  setLotNumber(spec) {
    const { specs, warehouses, fromWhouseId, qty } = this.state;
    const selectedWhouse = warehouses.find((e) => e.id === fromWhouseId).label;
    const availableQty =
      specs.find((s) => s.whouseName === selectedWhouse && s.spec === spec)
        ?.stOnHand | 0;
    const info = specs.find((i) => i.spec === spec);
    if (info)
      this.setState({
        spec,
        availableQty,
        expiryDate: info.expiryDate
          ? moment(info.expiryDate).format("DD/MM/YYYY")
          : "",
        showQtyError: qty > availableQty,
      });
  }

  setQuantity(qty) {
    this.setState((state) => ({
      qty,
      showQtyError: qty > state.availableQty,
    }));
  }

  setUnit(unitId) {
    var unit = this.state.units.find((u) => u.id === unitId);
    this.setState({ unitId, unit: unit.label });
  }

  add = () => {
    const {
      item,
      unitId,
      unit,
      fromWhouseId,
      toWhouseId,
      spec,
      qty,
      expiryDate,
      isExpiryDateRequired,
      showWhouseError,
      showQtyError,
    } = this.state;

    if ((!expiryDate || expiryDate === '') && isExpiryDateRequired) {
      this.setState({ showExpiryDateError: true });
      return;
    }

    if (
      item &&
      item.id > 0 &&
      unitId > 0 &&
      fromWhouseId > 0 &&
      (this.props.actionId == ActionType.Production ||
        (this.props.actionId == ActionType.Transfer && toWhouseId > 0)) &&
      qty !== "" &&
      !showWhouseError &&
      !showQtyError
    ) {
      let detail = {
        itemId: item.id,
        unitId,
        unit,
        fromWhouseId,
        toWhouseId,
        name: item.name,
        spec,
        qty,
        expiryDate,
      };
      this.props.add(detail);
      this.reset();
    }
  };

  reset = () => {
    this.setState({
      qty: "",
      spec: "",
      expiryDate: "",
      fromWhouseId: 0,
      toWhouseId: 0,
    });
  };

  render() {
    return (
      <Modal show={this.props.show} hide={this.props.hide}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {this.state.isLoading ? (
            <ActivityIndicator size={"large"} color={R.colors.darkGreen} />
          ) : (
            <View style={styles.body}>
              <View style={styles.row}>
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("itemName")}:</Text>
                  <DropDownList
                    placeholder={translate("selectItem")}
                    isItems={true}
                    zIndex={3000}
                    zIndexInverse={1000}
                    setValue={this.setItem.bind(this)}
                    items={this.state.items}
                  />
                </View>
                {this.props.actionId === ActionType.Production && (
                  <View style={styles.group}>
                    <Text style={styles.title}>{translate("warehouse")}:</Text>
                    <DropDownList
                      placeholder={translate("selectWhouse")}
                      zIndex={1000}
                      zIndexInverse={3000}
                      setValue={this.setFromWarehouse.bind(this)}
                      items={this.state.warehouses}
                    />
                  </View>
                )}
              </View>
              <View style={styles.row}>
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("lotNumber")}:</Text>
                  <DropDownList
                    placeholder={translate("selectLotNumber")}
                    zIndex={3000}
                    zIndexInverse={1000}
                    setValue={this.setLotNumber.bind(this)}
                    items={this.state.specsOptions}
                  />
                </View>
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("quantity")}:</Text>
                  <TextInput
                    value={this.state.qty + ""}
                    style={styles.input}
                    keyboardType="numeric"
                    onChangeText={(qty) => this.setQuantity(qty)}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    blurOnSubmit={true}
                  />
                </View>
              </View>
              {this.state.showQtyError && (
                <View style={styles.errorBox}>
                  <View style={{ width: "50%" }} />
                  <View style={{ width: "50%" }}>
                    <Text style={styles.error}>
                      {translate("msgErrorQtyUnavailable")}
                    </Text>
                  </View>
                </View>
              )}
              {this.props.actionId === ActionType.Transfer && (
                <>
                  <View style={styles.row}>
                    <View style={styles.group}>
                      <Text style={styles.title}>
                        {translate("fromWarehouse")}:
                      </Text>
                      <DropDownList
                        placeholder={translate("selectWhouse")}
                        zIndex={1000}
                        zIndexInverse={3000}
                        setValue={this.setFromWarehouse.bind(this)}
                        items={this.state.warehouses}
                      />
                    </View>
                    <View style={styles.group}>
                      <Text style={styles.title}>
                        {translate("toWarehouse")}:
                      </Text>
                      <DropDownList
                        placeholder={translate("selectWhouse")}
                        zIndex={1000}
                        zIndexInverse={3000}
                        setValue={this.setToWarehouse.bind(this)}
                        items={this.state.warehouses}
                      />
                    </View>
                  </View>
                  {this.state.showWhouseError && (
                    <View style={styles.errorBox}>
                      <View style={{ width: "50%" }} />
                      <View style={{ width: "50%" }}>
                        <Text style={styles.error}>
                          {translate("msgErrorSameWhouse")}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
              <View style={styles.row}>
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("unit")}:</Text>
                  <DropDownList
                    placeholder={translate("selectUnit")}
                    zIndex={3000}
                    zIndexInverse={1000}
                    setValue={this.setUnit.bind(this)}
                    items={this.state.units}
                  />
                </View>
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("expiryDate")}:</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => this.setState({ openDatePicker: true })}
                    disabled
                  >
                    <Text>
                      {this.state.expiryDate && this.state.expiryDate !== ""
                        ? moment(this.state.expiryDate).format("DD/MM/YYYY")
                        : ""}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {this.state.showExpiryDateError && (
                <View style={styles.errorBox}>
                  <View style={{ width: "50%" }} />
                  <View style={{ width: "50%" }}>
                    <Text style={styles.error}>
                      {translate("msgExipryDateRequired")}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.footer}>
                <Button
                  style={styles.button}
                  text={translate("add")}
                  onPress={() => this.add()}
                />
              </View>
            </View>
          )}
          <DatePicker
            modal
            mode="date"
            open={this.state.openDatePicker}
            date={
              this.state.expiryDate && this.state.expiryDate !== ""
                ? new Date(this.state.expiryDate)
                : new Date()
            }
            onConfirm={(expiryDate) => {
              this.setState({ expiryDate, openDatePicker: false });
            }}
            onCancel={() => {
              this.setState({ openDatePicker: false });
            }}
          />
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: R.colors.lightGrey,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    height: "100%",
  },
  row: {
    flexDirection: "row",
    height: 70,
    alignItems: "center",
  },
  group: {
    flexDirection: "row",
    maxWidth: "50%",
    padding: 10,
  },
  title: {
    width: "30%",
    color: R.colors.darkGrey,
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
  info: {
    width: "70%",
    backgroundColor: R.colors.lightGrey,
    borderRadius: 10,
    color: R.colors.darkGreen,
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: R.colors.darkGreen,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginHorizontal: 10,
  },
  errorBox: {
    height: 30,
    flexDirection: "row",
  },
  error: {
    width: "70%",
    alignSelf: "flex-end",
    color: "#f00",
    paddingStart: 5,
  },
});
