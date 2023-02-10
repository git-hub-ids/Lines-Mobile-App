import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Header, ViewIcon, Button, Modal } from "components/common";
import { Input } from "react-native-elements";
import * as services from "services/auth";
import { AuthContext } from "helpers/authProvider";
import { translate } from "helpers/utils";
import APIURLForm from "components/settings/apiUrlForm";
import R from "res/R";

export default class LoginScreen extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.passwordInputRef;
    this.state = {
      username: "admin",
      password: "Admin",
      isLogin: false,
      isSecure: true,
      showModal: false,
    };
  }

  login = () => {
    if (!this.state.isLogin) {
      Keyboard.dismiss;
      if (this.state.username === "" || this.state.password === "") {
        global.toast.show(translate("msgEnterCredentials"), { type: "danger" });
      } else {
        const data = {
          username: this.state.username,
          password: this.state.password,
        };
        this.setState({ isLogin: true }, () => {
          services.postLogin(data).then((response) => {
            this.afterLogin(response);
          });
        });
      }
    }
  };

  afterLogin = async (response) => {
    if (response) {
      if (response !== "timeout") {
        var { signIn } = this.context;
        signIn(response);
      }
    } else
      global.toast.show(translate("msgIncorrectCredentials"), {
        type: "danger",
      });
    this.setState({ isLogin: false, showModal: response === "timeout" });
  };

  changeSecure = () => {
    this.setState({ isSecure: !this.state.isSecure });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <ScrollView keyboardShouldPersistTaps="handled">
          <Header style={styles.logo}>
            <Image source={R.images.logo} style={styles.imgLogo} />
            <Button
              style={styles.btnSettings}
              onPress={() => this.setState({ showModal: true })}
            >
              <Image source={R.images.settings} style={styles.imgSettings} />
            </Button>
          </Header>
          <View style={styles.form}>
            <KeyboardAvoidingView enabled>
              <Text style={styles.txtLogin}>{translate("login")}</Text>
              <Input
                value={this.state.username}
                style={styles.input}
                label={translate("username")}
                onChangeText={(username) => this.setState({ username })}
                type="email"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() =>
                  this.passwordInputRef && this.passwordInputRef.focus()
                }
                blurOnSubmit={false}
              />

              <Input
                value={this.state.password}
                style={styles.input}
                onChangeText={(password) => this.setState({ password })}
                secureTextEntry={this.state.isSecure}
                ref={(input) => (this.passwordInputRef = input)}
                blurOnSubmit={true}
                onSubmitEditing={() => this.login()}
                label={translate("password")}
                rightIcon={
                  <ViewIcon
                    onPress={() => {
                      this.changeSecure();
                    }}
                  />
                }
              />
            </KeyboardAvoidingView>

            {/* login */}
            <Button style={styles.btnLogin} onPress={() => this.login()}>
              <Text style={styles.loginText}>{translate("login")}</Text>
              {this.state.isLogin ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={
                    I18nManager.isRTL
                      ? "chevron-back-outline"
                      : "chevron-forward-outline"
                  }
                  size={20}
                  color="#fff"
                />
              )}
            </Button>
          </View>
          <Modal
            style={styles.modal}
            show={this.state.showModal}
            hide={() => this.setState({ showModal: false })}
          >
            <APIURLForm />
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  imgLogo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  form: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    marginTop: -20,
    marginHorizontal: 30,
    padding: 20,
    paddingTop: 0,
    borderRadius: 20,
  },
  txtLogin: {
    padding: 50,
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: R.colors.darkGreen,
  },
  label: {
    color: "#aaa",
    fontSize: 18,
  },
  input: {
    padding: 10,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 10,
    borderWidth: 0,
    width: "100%",
    marginTop: 10,
    marginBottom: 30,
  },
  btnLogin: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    alignSelf: "center",
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  modal: {
    width: "50%",
    height: 300,
    top: "25%",
    start: "25%",
  },
  btnSettings: {
    position:'absolute',
    top:40,
    end:0
  },
  imgSettings: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  }
});
