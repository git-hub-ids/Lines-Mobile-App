import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Overlay } from 'react-native-elements';
import * as services from "services/orders";
import R from "res/R";

export default class DropDownList extends React.Component {

    constructor(props) {
        super(props);
        this.state =
        {
            open: false,
            value: this.props.value,
            initialItems: [...this.props.items],
            items: [],
            skip: 0,
            searchText: '',
            isLoading: true,
        };
    }
    componentDidMount() {
        this.setState({ items: [...this.props.items], isLoading: false });
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.props.isItems && this.props.items != this.state.items)
            this.setState({ items: this.props.items });
        if (this.props.value > 0 && this.props.value != this.state.value)
            this.setState({ value: this.props.value });
    }

    setOpen(open) {
        this.setState({
            open, isLoading: false
        });
    }

    setValue(callback) {
        this.setState(state => ({
            value: callback(state.value)
        }), () => {
            if (!this.props.isItems)
                this.props.setValue(this.state.value)
            else {
                let item = this.state.items.find((i) => i.id == this.state.value);
                this.props.setValue(item);
            }
        });

    }

    setItems(callback) {
        this.setState(state => ({
            items: callback(state.items),
            isLoading: false
        }));
    }

    search = async (text) => {
        let delay = 0
        if (this.state.searchText !== text)
            delay = 5000;
        this.setState({ searchText: text }, () => {
            setTimeout(async () => {
                if (!this.state.isLoading) {
                    this.setState({ isLoading: true }, async () => {
                        let { skip, searchText, items } = this.state;
                        skip = 0;
                        items = [];
                        let searchedItems = await services.getItems(skip, 20, searchText);
                        let resultItems = items.concat(searchedItems);
                        this.setState({ items: resultItems, searchText, skip, isLoading: false })
                    })
                }
            }, delay);
        })
    }

    loadMore = async () => {
        let { skip, searchText, items } = this.state;
        skip += 20;
        let searchedItems = await services.getItems(skip, 20, searchText);
        let resultItems = items.concat(searchedItems);
        this.setState({ items: resultItems, skip, isLoading: false })
    }

    render() {
        return (
            <View style={styles.container} >
                <Overlay isVisible={this.state.open} onBackdropPress={() => this.setOpen(false)} />
                {!this.props.isItems ?
                    <DropDownPicker
                        placeholder={this.props.placeholder}
                        listMode="MODAL"
                        modalContentContainerStyle={styles.modalContainer}
                        modalProps={{ transparent: true, presentationStyle: 'overFullScreen' }}
                        zIndex={this.props.zIndex}
                        zIndexInverse={this.props.zIndexInverse}
                        style={styles.dropDownStyle}
                        dropDownContainerStyle={styles.menuStyle}
                        labelStyle={styles.itemStyle}
                        listItemLabelStyle={styles.itemStyle}
                        loading={this.state.isLoading}
                        open={this.state.open}
                        value={this.state.value}
                        items={this.state.items}
                        setOpen={this.setOpen.bind(this)}
                        setValue={this.setValue.bind(this)}
                        setItems={this.setItems.bind(this)}
                        disableLocalSearch={false}
                        searchable={true}
                    />
                    :
                    <>
                        <DropDownPicker
                            placeholder={this.props.placeholder}
                            listMode="MODAL"
                            modalContentContainerStyle={styles.modalContainer}
                            modalProps={{ transparent: true, presentationStyle: 'overFullScreen' }}
                            zIndex={this.props.zIndex}
                            zIndexInverse={this.props.zIndexInverse}
                            style={styles.dropDownStyle}
                            dropDownContainerStyle={styles.menuStyle}
                            labelStyle={styles.itemStyle}
                            listItemLabelStyle={styles.itemStyle}
                            open={this.state.open}
                            value={this.state.value}
                            items={this.state.items}
                            setOpen={this.setOpen.bind(this)}
                            setValue={this.setValue.bind(this)}
                            setItems={this.setItems.bind(this)}
                            disableLocalSearch={true}
                            searchable={true}
                            onChangeSearchText={(text) => this.search(text)}
                            flatListProps={{
                                onEndReachedThreshold: 0.01,
                                onEndReached: (info) => {
                                    this.loadMore();
                                }
                            }}
                        />
                        {this.state.isLoading && this.state.open ?
                            <Overlay isVisible={this.state.open} onBackdropPress={() => this.setOpen(false)} >
                                <ActivityIndicator color={R.colors.darkGreen} size="large" />
                            </Overlay>
                            : null}
                    </>
                }
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dropDownStyle: {
        borderWidth: 0,
    },
    menuStyle: {
        borderColor: R.colors.lightGreen,
    },
    itemStyle: {
        color: R.colors.darkGreen,
        fontSize: 14,
        fontWeight: 'bold'
    },
    loading: {
        zIndex: 5000,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 50,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 60,
        backgroundColor: 'grey',
        opacity: 0.5
    },
    overlay: {
        backgroundColor: '#000',
        flex: 1,
        width: '100%'
    },
    modalContainer: {
        width: '50%',
        height: '50%',
        maxHeight: '50%',
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginVertical: '15%',
    }
});