import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { Header, Screen } from "components/common";
import { Tabs } from "components/tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import { translate } from "helpers/utils";
import R from 'res/R';

export default class OrdersScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            searchText: '',
            tabIndex: 0,
            locationId: null,
            stepId: null,
            isLoading: true,
            isRefresh: false,
        };
    }

    componentDidMount = async () => {
        let sections = [];
        const params = this.props.route.params;
        var locationId = params?.locationId;
        var stepId = params?.stepId;
        var stepName = params?.stepName;
        if (!locationId) {
            locationId = global.locations[0].id;
        }
        if (!stepId) {
            stepId = global.steps[0].stepID;
            stepName = global.steps?.find(s => s.stepID == stepId).latinName;
            this.props.navigation.setOptions({
                headerLeft: () => null
            });
        }

        var locationName = global.locations?.find(l => l.id == locationId).description;
        this.props.navigation.setOptions({
            title: locationName + " - " + stepName
        });

        this.setState({ sections, locationId, stepId, isLoading: false })
    }

    search = () => {
        const { locationId, stepId } = this.props.route.params;
        this.props.navigation.navigate("Search", { locationId, stepId, searchText: this.state.searchText, onBack: this.onBack })
    }

    onBack = () => {
        this.setState({ isRefresh: true }, () => {
            this.setState({ isRefresh: false });
        });
    }

    render() {
        return (
            <Screen>
                <Header />
                <View style={styles.search}>
                    <TextInput style={styles.txtSearch}
                        placeholder={translate('msgSearch')}
                        onChangeText={(searchText) => this.setState({ searchText })}
                        returnKeyType="search"
                        onSubmitEditing={() => this.search()}
                        blurOnSubmit={true}
                    />
                    <TouchableOpacity style={styles.btnSearch} onPress={() => this.search()}>
                        <Icon name='search-outline' size={30} color='#fff' />
                    </TouchableOpacity>
                </View>
                {this.state.locationId ?
                    <Tabs
                        navigation={this.props.navigation}
                        locationId={this.state.locationId}
                        stepId={this.state.stepId}
                        refresh={this.state.isRefresh}
                    />
                    : null}
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    search: {
        position: 'absolute',
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'center',
        width: '80%',
        marginTop: 30,
        justifyContent: 'space-between'
    },
    txtSearch: {
        height: 60,
        width: '90%',
        backgroundColor: R.colors.grey,
        borderRadius: 15,
        padding: 18,
        fontSize: 18,
    },
    btnSearch: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        backgroundColor: R.colors.lightGreen,
        borderRadius: 15
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center'
    },
    btnFooter: {
        bottom: 10,
        minWidth: '20%',
        marginHorizontal: 50,
        alignSelf: 'center'
    },
    btnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#fff",
        letterSpacing: 2,
    }
});
