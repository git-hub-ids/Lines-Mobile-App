import React from "react";
import { StyleSheet, View, TouchableOpacity, Modal as RNModal } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Overlay } from 'react-native-elements';
import R from "res/R";

export default class Modal extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <Overlay isVisible={this.props.show} onBackdropPress={() => this.props.hide()} />
                <RNModal
                    animationType="slide"
                    transparent={true}
                    visible={this.props.show}
                    onRequestClose={() => this.props.hide()}>
                    <View style={[styles.modalView, this.props.style]}>
                        <View style={styles.container}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => { this.props.hide() }}>
                                <Icon name='close' style={styles.close} />
                            </TouchableOpacity>
                        </View>
                        {this.props.children}
                    </View>
                </RNModal>
            </>
        )
    }
}


const styles = StyleSheet.create({
    modalView: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        borderBottomColor: '#eee',
        borderBottomWidth: 1
    },
    closeButton: {
        width: '20%',
        backgroundColor: R.colors.darkGreen,
        alignContent: 'center',
        justifyContent: 'center'
    },
    close: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});