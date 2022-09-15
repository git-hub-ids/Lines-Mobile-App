import React from "react";
import { Text, SectionList, View, ActivityIndicator } from "react-native";
import { Header, ListItem, Screen } from "components/common";
import { translate } from "helpers/utils";
import R from 'res/R';

export default class LocationsScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            sections: [],
            isLoading: true
        };
    }

    componentDidMount = async () => {
        var sections = [];
        try {
            var locations = global.locations;
            if (locations) {
                sections = [{
                    id: 0,
                    title: translate('myLocations'),
                    data: locations,
                }];
            }
        }
        catch (error) {
            global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
        }
        this.setState({ sections, isLoading: false })
    }

    onPress = (item) => {
        this.props.navigation.navigate('Steps', { locationId: item.id })
    }

    renderHeader = () => {
        return (
            <Header />
        )
    }

    renderItem = (item, index) => {
        if (this.state.isLoading)
            return
        (<ActivityIndicator color={R.colors.darkGreen} size={'large'} />)
        return (
            <ListItem item={item} onPress={() => this.onPress(item)} />
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
                <SectionList
                    ListHeaderComponent={this.renderHeader}
                    sections={this.state.sections}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={this.renderSeparator}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            </Screen>
        );
    }
}

