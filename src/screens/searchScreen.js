import React from "react";
import { StyleSheet, TextInput, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Header, Screen } from "components/common";
import Icon from 'react-native-vector-icons/Ionicons';
import { SearchItem } from "components/orders"
import * as services from "services/orders";
import { translate } from "helpers/utils";
import R from 'res/R';

export default class SearchScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            searchText: this.props.route.params?.searchText,
            searchResult: [],
            isLoading: false,
        };
    }

    componentDidMount = async () => {
        this.search();
    }

    search = () => {
        const { searchText, isLoading } = this.state;
        const { locationId, stepId } = this.props.route.params;
        if (searchText !== '' && !isLoading) {
            this.setState({ isLoading: true }, async () => {
                let searchResult = await services.searchOrders(locationId, stepId, searchText);
                this.setState({ searchResult, isLoading: false })
            })
        }
    }

    renderItem = ({ item, index }) => {
        return (
            <SearchItem item={item} navigation={this.props.navigation} onBack={this.props.route.params.onBack} />
        )
    }

    renderSeparator = () => {
        return (
            <View style={R.styles.separator} />
        )
    }

    render() {
        return (
            <Screen>
                <Header />
                <View style={styles.search}>
                    <TextInput
                        value={this.state.searchText}
                        style={styles.txtSearch}
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
                <View style={styles.container}>
                    {this.state.isLoading ?
                        <ActivityIndicator color={R.colors.darkGreen} size={'large'} />
                        :
                        this.state.searchResult?.length ?
                            <FlatList
                                removeClippedSubviews={false}
                                listKey="search"
                                data={this.state.searchResult}
                                keyExtractor={(item, index) => index}
                                renderItem={this.renderItem}
                                ItemSeparatorComponent={this.renderSeparator}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                            :
                            <Text>{translate('msgNoResults')}</Text>
                    }
                </View>
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 60,
        marginBottom: 10,
    },
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
});
