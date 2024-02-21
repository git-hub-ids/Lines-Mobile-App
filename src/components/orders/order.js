import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { CheckBox } from "react-native-elements";
import * as services from "services/orders";
import { Button } from "components/common";
import { AddChargeModal } from "components/charges";
import { translate } from "helpers/utils";
import { OrderStatus } from "../../types/enums";
import moment from "moment";
import R from "res/R";

export default class Order extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      showModal: false,
    };
  }
  // addLineBreaks = (str, n) =>{
  //     const chunks = [];
  //     for (let i = 0; i < str.length; i += n) {
  //       chunks.push(str.substring(i, i + n));
  //     }
  //     return chunks.join("\n");
  //   }
  // in case ready or progress tab
  onCheck = () => {
    this.props.item.checked = !this.props.item.checked;
    this.props.checked(this.props.item);
  };

  saveCharge = async (charges) => {
    if (charges && charges.length > 0) {
      var data = {
        flowDataDetailTable: [
          {
            flowDataDetailId: this.props.item.flowDataDetailId,
            flowDataProductionId: this.props.item.flowDataProductionId,
          },
        ],
        chargesTable: charges,
      };
      await services.saveCharges(data);
      this.props.item.charges = charges;
      this.setState({ showModal: false });
    }
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const item = this.props.item;
    return (
      <View style={styles.container}>
        <View style={styles.details}>
          <View>
            <View style={{ marginLeft: -20 }}>
              {this.props.status !== OrderStatus.Completed ? (
                <CheckBox
                  uncheckedColor={R.colors.darkGreen}
                  checked={item.checked ? item.checked : false}
                  checkedColor={R.colors.darkGreen}
                  onPress={this.onCheck}
                  size={35}
                  checkedIcon="check-square"
                />
              ) : null}
            </View>
            <View style={styles.group}>
              <Text style={styles.title}>{translate("workflowName")}:</Text>
              <Text style={styles.info}>{item.templateName}</Text>
            </View>
            <View style={styles.group}>
              {this.props.status === OrderStatus.Ready ? (
                <Text style={styles.title}>{translate("endProduct")}:</Text>
              ) : (
                <Text style={styles.title}>{translate("itemName")}:</Text>
              )}
              <Text style={styles.info}>{item.itemName}</Text>
            </View>
            
            <View style={styles.group}>
              {this.props.status === OrderStatus.Ready ? (
                <Text style={styles.title}>{translate("readyDate")}:</Text>
              ) : (
                <></>
              )}
              <Text style={styles.info}>{item.readyDate}</Text>
            </View>
            <View style={styles.group}>
           
                <Text style={styles.title}>
                  {translate("PhaseProducedItem")}:
                </Text>
                <Text style={styles.info}>{item.produceditemname}</Text>
            </View>
            <View style={styles.group}>
              {(this.props.status === OrderStatus.Ready || this.props.status === OrderStatus.Completed) &&
              global["ShowOnlyName"] == 0 ? (
                <>
                  <Text style={styles.title}>{translate("quantity")}:</Text>
                  <Text style={styles.info}>{item.producedqty}</Text>
                </>
              ) : (
                <></>
              )}
            </View>
            <View style={styles.group}>
              <Text style={styles.title}>{translate("soNumber")}:</Text>
              <Text style={styles.info}>{item.soNumber}</Text>
            </View>
            <View style={styles.group}>
              <Text style={styles.title}>{translate("poNumber")}:</Text>
              <Text style={styles.info}>{item.poNumber}</Text>
            </View>
            {item.statusID == 2 ? (
              <View style={styles.group}>
                <Text style={styles.title}>{translate("piNumber")}:</Text>
                <Text style={styles.info}>{item.piNumber}</Text>
              </View>
            ) : (
              <></>
            )}
            <View style={styles.group}>
              <Text style={styles.title}>{translate("clientName")}:</Text>
              <Text style={styles.info}>{item.peopleName}</Text>
            </View>
            {item.statusID == 2 ? (
              <View style={styles.group}>
                <Text style={styles.title}>{translate("finishedDate")}:</Text>
                <Text style={styles.info}>
                  {item.finishDate
                    ? moment(item.finishDate).format("DD/MM/YYYY HH:mm:ss")
                    : ""}
                </Text>
              </View>
            ) : (
              <View style={styles.group}>
                <Text style={styles.title}>{translate("expectedDate")}:</Text>
                <Text style={styles.info}>
                  {item.expectedDate
                    ? moment(item.expectedDate).format("DD/MM/YYYY HH:mm:ss")
                    : ""}
                </Text>
              </View>
            )}
          </View>
          {/* {this.props.status !== OrderStatus.Completed ?
                        <View>
                            <CheckBox
                                uncheckedColor={R.colors.darkGreen}
                                checked={item.checked ? item.checked : false}
                                checkedColor={R.colors.darkGreen}
                                onPress={this.onCheck}
                                size={35}
                                checkedIcon="check-square"
                            />
                        </View>
                        : null
                    } */}
          {
            /* charges field */
            this.props.status == OrderStatus.Completed &&
            item?.actionID == 28 ? (
              <View style={styles.charges}>
                <Text style={styles.title}>{translate("charges")}:</Text>
                <View>
                  {item.charges.map((charge) => (
                    <Text style={[styles.info, { paddingStart: 0 }]}>
                      {charge.chargesType + ": " + charge.chargesQty}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null
          }
        </View>
        {this.props.status == OrderStatus.Completed &&
        item?.actionID != 26 &&
        item.charges?.length == 0 ? (
          <>
            <View style={styles.footer}>
              <Button
                style={styles.button}
                text={translate("addCharge")}
                secondary={true}
                onPress={() => this.setState({ showModal: true })}
              />
            </View>
            <AddChargeModal
              show={this.state.showModal}
              hide={this.hideModal}
              action={this.saveCharge}
            />
          </>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    alignSelf: "stretch",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  group: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    flexDirection: "row",
  },
  title: {
    color: R.colors.darkGrey,
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    paddingStart: 10,
    color: R.colors.darkGreen,
    fontSize: 20,
    fontWeight: "bold",
  },
  checkBox: {
    width: 100,
    height: 100,
  },
  button: {
    marginHorizontal: 10,
    maxHeight: 55,
  },
  btnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  charges: {
    width: "30%",
  },
  footer: {
    flex: 1,
    marginTop: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#a8a8a8",
  },
});