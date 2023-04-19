import { I18nManager } from "react-native";
import i18n from 'i18n-js';
import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
//import DeviceInfo from 'react-native-device-info';
import moment from "moment";

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

const setI18nConfig = async (lang, isRTL) => {
  // fallback if no available language fits
  if (!lang) {
    isRTL = I18nManager.isRTL;
    if (isRTL)
      lang = 'ar-SA';
    else
      lang = 'en-US';
  }
  // clear translation cache
  translate.cache.clear();
  // update layout direction
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(true);
  // set i18n-js config
  i18n.translations = {
    en: require("../translations/en.json"),
    ar: require("../translations/ar.json")
  };
  i18n.locale = lang;
  i18n.fallbacks = true;
};

const getUniqueId = () => {
  try {
    // let uniqueId = DeviceInfo.getUniqueId() // "b0db9878d0fbd76a"//DeviceInfo.getUniqueId();
    // return uniqueId;
   return '1dc9d263fe5762eb';
  } catch (error) {
    global.toast.show(translate('msgErrorOccurred'), { type: "danger" });
  }
};

const validateDate = (date) => {
  return date && (moment().diff(date, 'days') <= 0)
}

const removeTime = (date) => {
  return moment(date).format('yyyy-MM-DD');
}

export { translate, setI18nConfig, getUniqueId, validateDate, removeTime }

