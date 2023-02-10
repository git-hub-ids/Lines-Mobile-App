import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Ionicons } from "@expo/vector-icons";
import { Button, DropDownList } from "components/common";
import { translate, validateDate } from "helpers/utils";
import * as services from "services/orders";
import moment from "moment";
import R from "res/R";

export default class EditableItemSpec extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      item: { ...this.props.item },
      openUnit: false,
      availableQty: 0,
      qty: this.props.item?.qty,
      spec: this.props.item?.spec,
      specs: [],
      specsOptions: [],
      unit: this.props.item?.unit,
      unitId: this.props.item?.unitId,
      units: [],
      openWarehouse: false,
      fromWhouseName: this.props.item.fromWhouseName,
      fromWhouseId: this.props.item.fromWhouseId,
      toWhouseId: this.props.item.toWhouseId,
      warehouses: [],
      showWhouseError: false,
      showQtyError: false,
      expiryDate: "",
      isExpiryDateRequired: false,
      isValidDate: true,
      openDatePicker: false,
      isExpanded: false,
      isLoaded: false,
    };
  }

  componentDidMount() {
    let item = this.props.item;
    this.setState({ expiryDate: item.expiryDate ? item.expiryDate : "" });
  }

  expand = async () => {
    let { units, specs, specsOptions, warehouses, isExpiryDateRequired } =
      this.state;
    if (!this.state.isLoaded) {
      item = await services.getItem(this.props.item.itemId);
      units = item?.units;
      specs = item?.specExpiryList;
      specsOptions = specs?.map((i) => {
        return { id: i.spec, value: i.spec, label: i.spec };
      });
      warehouses = await services.getWarehouses();
      isExpiryDateRequired = item?.isExpiry;
    }
    this.setState({
      units,
      specs,
      specsOptions,
      warehouses,
      isExpiryDateRequired,
      isLoaded: true,
      isExpanded: !this.state.isExpanded,
    });
  };

  setUnit(unitId) {
    let { units, unit } = this.state.units;
    if (units) unit = units.find((u) => u.id == unitId);
    this.setState({ unit: unit.label, unitId });
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
        expiryDate: moment(info.expiryDate).format("DD/MM/YYYY"),
        showQtyError: qty > availableQty,
      });
  }

  setQuantity(qty) {
    this.setState((state) => ({
      qty,
      showQtyError: qty > state.availableQty,
    }));
  }

  setExpiryDate(expiryDate) {
    isValidDate = validateDate(expiryDate);
    this.setState({ expiryDate, isValidDate, openDatePicker: false });
  }

  done = () => {
    var item = this.props.item;
    item.spec = this.state.spec;
    item.qty = this.state.qty;
    item.unitId = this.state.unitId;
    item.unit = this.state.unit;
    item.fromWhouseId = this.state.fromWhouseId;
    item.toWhouseId = this.state.toWhouseId;
    item.expiryDate = this.state.expiryDate;
    item.isValid =
      this.state.isValidDate &&
      !this.state.showWhouseError &&
      !this.state.showQtyError &&
      this.state.unitId > 0;
    if (item.isValid) this.setState({ isExpanded: false });
  };

  reset = () => {
    let defaultItem = this.state.item;
    let item = this.props.item;
    item = defaultItem;
    let spec = item.spec;
    let qty = item.qty;
    let unitId = item.unitId;
    let unit = item.unit;
    let fromWhouseId = item.fromWhouseId;
    let toWhouseId = item.toWhouseId;
    let expiryDate = item.expiryDate;
    let showWhouseError = fromWhouseId == toWhouseId;
    //let isValidDate = item.expiryDate && item.expiryDate !== "" && validateDate(item.expiryDate);
    this.setState({
      spec,
      qty,
      unit,
      unitId,
      fromWhouseId,
      toWhouseId,
      showWhouseError,
      expiryDate,
    });
  };

  render() {
    const item = this.props.item;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.row} onPress={this.expand}>
            <Text style={styles.headerTitle}>{item.name}</Text>
            <Text style={styles.headerSubTitle}>
              {item.qty + " " + item.unit}
            </Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnExpand} onPress={this.expand}>
              <Ionicons
                name={this.state.isExpanded ? "chevron-up" : "chevron-down"}
                size={30}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => this.props.delete(item.itemId)}
            >
              <Ionicons name="trash-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {this.state.isExpanded ? (
          <View style={styles.body}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" />
            <View style={styles.row}>
              <View style={styles.group}>
                <Text style={styles.title}>{translate("itemName")}:</Text>
                <Text style={styles.info}>{item.name}</Text>
              </View>
              <View style={styles.group}>
                <Text style={styles.title}>{translate("lotNumber")}:</Text>
                <DropDownList
                  placeholder={translate("selectLotNumber")}
                  zIndex={3000}
                  zIndexInverse={1000}
                  value={this.state.spec}
                  setValue={this.setLotNumber.bind(this)}
                  items={this.state.specsOptions}
                />
              </View>
            </View>
            <View style={styles.row}>
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
              <View style={styles.group}>
                <Text style={styles.title}>{translate("unit")}:</Text>
                <DropDownList
                  placeholder={translate("selectUnit")}
                  zIndex={3000}
                  zIndexInverse={1000}
                  value={this.state.unitId}
                  setValue={this.setUnit.bind(this)}
                  items={this.state.units}
                />
              </View>
            </View>
            {this.state.showQtyError && (
              <View style={styles.errorBox}>
                <View style={{ width: "50%" }}>
                  <Text style={styles.error}>
                    {translate("msgErrorQtyUnavailable")}
                  </Text>
                </View>
              </View>
            )}
            {this.props.actionId == 26 ? (
              <>
                <View style={styles.row}>
                  <View style={styles.group}>
                    <Text style={styles.title}>
                      {translate("fromWarehouse")}:
                    </Text>
                    <DropDownList
                      placeholder={translate("selectWhouse")}
                      zIndex={3000}
                      zIndexInverse={1000}
                      value={this.state.fromWhouseId}
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
                      value={this.state.toWhouseId}
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
            ) : null}
            <View style={styles.row}>
              <View style={styles.group}>
                <Text style={styles.title}>{translate("expiryDate")}:</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => this.setState({ openDatePicker: true })}
                >
                  <Text>
                    {this.state.expiryDate !== ""
                      ? moment(this.state.expiryDate).format("DD/MM/YYYY")
                      : ""}
                  </Text>
                </TouchableOpacity>
              </View>
              {this.props.actionId != 26 ? (
                <View style={styles.group}>
                  <Text style={styles.title}>{translate("warehouse")}:</Text>
                  <DropDownList
                    placeholder={translate("selectWhouse")}
                    zIndex={1000}
                    zIndexInverse={3000}
                    value={
                      this.props.type === "receive"
                        ? this.state.toWhouseId
                        : this.state.fromWhouseId
                    }
                    setValue={
                      this.props.type === "receive"
                        ? this.setToWarehouse.bind(this)
                        : this.setFromWarehouse.bind(this)
                    }
                    items={this.state.warehouses}
                  />
                </View>
              ) : null}
            </View>
            {this.state.showExpiryDateError && (
              <View style={styles.errorBox}>
                <View style={{ width: "50%" }}>
                  <Text style={styles.error}>
                    {translate("msgExipryDateRequired")}
                  </Text>
                </View>
                <View style={{ width: "50%" }} />
              </View>
            )}
            {!this.state.isValidDate ? (
              <View style={styles.errorRow}>
                <Text style={styles.error}>{translate("msgInvalidDate")}</Text>
              </View>
            ) : null}
            <View style={styles.footer}>
              <Button
                style={styles.button}
                text={translate("saveChanges")}
                onPress={() => this.done()}
              />
              <Button
                style={styles.button}
                text={translate("reset")}
                onPress={() => this.reset()}
              />
            </View>
          </View>
        ) : null}
        <DatePicker
          modal
          mode="date"
          open={this.state.openDatePicker}
          date={
            this.state.expiryDate !== ""
              ? new Date(this.state.expiryDate)
              : new Date()
          }
          onConfirm={(expiryDate) => {
            this.setExpiryDate(expiryDate);
          }}
          onCancel={() => {
            this.setState({ openDatePicker: false });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 20,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  headerTitle: {
    color: R.colors.darkGreen,
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  headerSubTitle: {
    color: R.colors.darkGreen,
    fontSize: 20,
    marginStart: 10,
  },
  btnExpand: {
    width: 40,
    height: 40,
    backgroundColor: R.colors.darkGreen,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  btnDelete: {
    width: 40,
    height: 40,
    backgroundColor: R.colors.darkGreen,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  body: {
    backgroundColor: R.colors.lightGrey,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
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
    width: "32%",
    color: R.colors.darkGrey,
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
  info: {
    width: "68%",
    maxWidth: "68%",
    backgroundColor: R.colors.lightGrey,
    borderRadius: 10,
    color: R.colors.darkGreen,
    fontSize: 18,
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
  errorRow: {
    height: 40,
    padding: 10,
  },
  errorBox: {
    height: 30,
    flexDirection: "row",
  },
  error: {
    fontSize: 14,
    color: "#f00",
    width: "70%",
    alignSelf: "flex-end",
    paddingStart: 5,
  },
});
