import AsyncStorage from '@react-native-async-storage/async-storage';

// get item from async storage
export async function getItem(item) {
    return JSON.parse(await AsyncStorage.getItem(`@${item}`));
}

// set item in async storage
export async function setItem(key, value) {
    await AsyncStorage.setItem(`@${key}`, JSON.stringify(value));
}

export async function multiSet(array) {
    AsyncStorage.multiSet(array);
}