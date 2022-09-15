import React from "react";
import { StyleSheet, View, KeyboardAvoidingView, FlatList } from "react-native";
import { Button, Modal } from "components/common";
import ChargeItem from "./chargeItem";
import { translate } from "helpers/utils";
import { getItem } from "helpers/storage";
import R from 'res/R';

export default class AddChargeModal extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            charges: [],
            selectedCharges: [],
            isLoading: true
        };
    }

    componentDidMount = async () => {
        let charges = await getItem("charges");
        this.setState({ charges });
    }

    save = () => {
        var selectedCharges = this.state.selectedCharges;
        if (selectedCharges && selectedCharges.length > 0) {
            this.props.action(selectedCharges);
            this.setState({ selectedCharges: [] })
        }
    }

    onCheck = (charge) => {
        if (charge) {
            var selectedCharges = this.state.selectedCharges;
            if (charge.checked) {
                if (!selectedCharges.includes(charge))
                    selectedCharges.push(charge)
            }
            else {
                selectedCharges = selectedCharges.filter(i => (i.chargeProductionId != charge.chargeProductionId))
            }
            this.setState({selectedCharges});
        }
    }

    renderItem = ({ item, index }) => {
        return (
            <ChargeItem item={item} onCheck={this.onCheck} />
        )
    }

    render() {
        return (
            <Modal show={this.props.show} hide={this.props.hide}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                    <View style={styles.body}>
                        <FlatList
                            removeClippedSubviews={false}
                            listKey="charges"
                            data={this.state.charges}
                            keyExtractor={(item, index) => index}
                            renderItem={this.renderItem}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />
                    </View>
                    <View style={styles.footer}>
                        <Button style={styles.button} text={translate('save')} onPress={() => { this.save() }} />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}


const styles = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: R.colors.lightGrey,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        padding: 20,
        height: '90%'
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
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: R.colors.darkGreen
    },
    footer: {
        margin: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        marginHorizontal: 10
    }
});
