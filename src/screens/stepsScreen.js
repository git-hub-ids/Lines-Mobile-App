import React from "react";
import { SectionList, View, ActivityIndicator } from "react-native";
import { Header, ListItem, Screen } from "components/common";
import * as services from "services/lookup";
import { translate } from "helpers/utils";
import R from 'res/R';

export default class StepsScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            sections: [],
            locationId: null,
            isLoading: true
        };
    }

    componentDidMount = async () => {
        await this.init();
    }

    init = async () => {
        var sections = [];
        try {
            var locationId = this.props?.route?.params?.locationId;
            // in case there is a single location
            // the params are null
            if (!locationId) {
                locationId = global.locations[0].id;
                this.props.navigation.setOptions({
                    headerLeft: () => null
                });
            }
            var steps = await services.getSteps(locationId);
            sections = [{
                id: 0,
                title: translate('mySteps'),
                data: steps,
            }];
        }
        catch (error) {
            global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
        }
        this.setState({ sections, locationId, isLoading: false })
    }

    onPress = (item) => {
        var locationId = this.state.locationId;
        this.props.navigation.navigate('Orders', { locationId, stepId: item.stepID, stepName: item.latinName })
    }

    keyExtractor = (item) => {
        return item.stepID;
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
                    keyExtractor={this.keyExtractor}
                    ItemSeparatorComponent={this.renderSeparator}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            </Screen>
        );
    }
}
