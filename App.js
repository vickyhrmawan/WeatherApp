import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import Axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
require('moment-timezone');

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

const App = () => {
  const initial = '';
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [tomorrowData, setTomorrowData] = useState([]);
  const [twodaysData, setTwodaysData] = useState([]);
  const [current, setCurrent] = useState([]);
  const [lang, setLang] = useState(initial);
  const [city, setCity] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);

  const icon = `https://www.weatherbit.io/static/img/icons/${data &&
    data.weather &&
    data.weather.icon}.png`;
  const iconTomorrow = `https://www.weatherbit.io/static/img/icons/${tomorrowData &&
    tomorrowData.weather &&
    tomorrowData.weather.icon}.png`;
  const icon2days = `https://www.weatherbit.io/static/img/icons/${twodaysData &&
    twodaysData.weather &&
    twodaysData.weather.icon}.png`;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    RecentWeather();
    wait(2000).then(() => setRefreshing(false));
  }, [refreshing, city, lang]);

  const toggleMenu = () => {
    setMenu(!menu);
  };

  const toggleMore = () => {
    setMore(!more);
  };

  const showLoading = () => {
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const changeCity = async cityInput => {
    try {
      await AsyncStorage.setItem('chosenCity', cityInput);
    } catch (e) {
      console.log(e);
    }
  };

  const submitCity = () => {
    RecentWeather();
    toggleMenu();
  };

  const changeLang = async language => {
    try {
      // showLoading();
      await AsyncStorage.setItem('chosenLang', language);
      RecentWeather();
      toggleMore();
    } catch (e) {
      console.log(e);
    }
  };

  //get data weather
  const RecentWeather = async () => {
    try {
      let resultLang = await getLang();
      let resultCity = await getStorage();
      if (resultCity !== '' && resultLang !== '') {
        let res = await Axios.get(
          `https://api.weatherbit.io/v2.0/forecast/daily?city=${resultCity}&lang=${resultLang}&days=3&key=e410ea4b0bfe4ca18772b4a03afbd0d5`,
        );
        console.log(res);
        if (res) {
          setData(res.data.data[0]);
          setTomorrowData(res.data.data[1]);
          setTwodaysData(res.data.data[2]);
        }
        let cur = await Axios.get(
          `https://api.weatherbit.io/v2.0/current?city=${resultCity}&lang=${resultLang}&key=e410ea4b0bfe4ca18772b4a03afbd0d5`,
        );
        if (cur) {
          setCurrent(cur.data.data[0]);
          console.log('current', current);
        }
        hideLoading();
      }
    } catch (error) {
      console.log('error persons ', error);
      lang === 'en'
        ? alert('Please input the correct city')
        : alert('请输入正确的城市');
      hideLoading();
      toggleMenu();
    }
  };

  const getStorage = async () => {
    try {
      let checkCity = await AsyncStorage.getItem('chosenCity');
      if (checkCity === null) {
        setCity('jakarta');
        return city;
      } else {
        setCity(checkCity);
        return city;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLang = async () => {
    try {
      let checkLang = await AsyncStorage.getItem('chosenLang');
      if (checkLang === null) {
        setLang('en');
        return lang;
      } else {
        setLang(checkLang);
        return lang;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    showLoading();
    RecentWeather();
  }, [lang, city]);

  if (isLoading === true) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="never"
      contentContainerStyle={styles.container}
      refreshControl={
        < RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}> */}
      < View style={styles.containerHeader} >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleMenu}>
            <Icon name="search" size={width / 13} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 4 }}>
          <Text style={styles.cityText}>{current.city_name}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleMore}>
            <Icon name="settings" size={width / 13} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View >
      <View style={styles.containerBody}>
        <Image
          style={styles.tinyLogo}
          source={{
            uri: `${icon}`,
          }}
        />
        <Text style={styles.tempNumber}>
          {current.temp !== undefined ? current.temp.toFixed(0) : '0'}°C
        </Text>
        <Text style={styles.cityText}>
          {current && current.weather && current.weather.description}
        </Text>
        <Text style={styles.cityText}>
          {lang === 'zh' ? moment().tz(current.timezone).format('hh.mm a z') : moment().locale('en').tz(current.timezone).format('LT z')}
        </Text>
      </View>
      <View style={styles.containerFooter}>
        <View style={styles.containerFooterTop}>
          <View style={styles.footerTopList}>
            <View style={styles.footerTopDetail}>
              <Image
                style={styles.iconFooter}
                source={{
                  uri: `${icon}`,
                }}
              />
              <Text style={styles.textInsideFooter}>
                {lang === 'en' ? 'Today' : '今天'} •{' '}
                {data && data.weather && data.weather.description}
              </Text>
            </View>
            <View style={styles.footerTopTemp}>
              <Text style={styles.textInsideFooter}>
                {data.high_temp !== undefined ? data.high_temp.toFixed(0) : '0'}
                ° /{' '}
                {data.low_temp !== undefined ? data.low_temp.toFixed(0) : '0'}°
              </Text>
            </View>
          </View>
          <View style={styles.footerTopList}>
            <View style={styles.footerTopDetail}>
              <Image
                style={styles.iconFooter}
                source={{
                  uri: `${iconTomorrow}`,
                }}
              />
              <Text style={styles.textInsideFooter}>
                {lang === 'en' ? 'Tomorrow' : '明天'} •{' '}
                {tomorrowData &&
                  tomorrowData.weather &&
                  tomorrowData.weather.description}
              </Text>
            </View>
            <View style={styles.footerTopTemp}>
              <Text style={styles.textInsideFooter}>
                {tomorrowData.high_temp !== undefined
                  ? tomorrowData.high_temp.toFixed(0)
                  : '0'}
                ° /{' '}
                {tomorrowData.low_temp !== undefined
                  ? tomorrowData.low_temp.toFixed(0)
                  : '0'}
                °
              </Text>
            </View>
          </View>
          <View style={styles.footerTopList}>
            <View style={styles.footerTopDetail}>
              <Image
                style={styles.iconFooter}
                source={{
                  uri: `${icon2days}`,
                }}
              />
              <Text style={styles.textInsideFooter}>
                {lang === 'en'
                  ? `${new Date(twodaysData.valid_date)
                    .toDateString()
                    .split(' ')
                    .slice(0, 1)} • `
                  : `${moment(twodaysData.valid_date)
                    .format('dddd, MMMM Do YYYY')
                    .slice(1, 3)} • `}
                {twodaysData &&
                  twodaysData.weather &&
                  twodaysData.weather.description}
              </Text>
            </View>
            <View style={styles.footerTopTemp}>
              <Text style={styles.textInsideFooter}>
                {twodaysData.high_temp !== undefined
                  ? twodaysData.high_temp.toFixed(0)
                  : '0'}
                ° /{' '}
                {twodaysData.low_temp !== undefined
                  ? twodaysData.low_temp.toFixed(0)
                  : '0'}
                °
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.containerFooterBot}>
          <View style={styles.footerBotTop}>
            <View style={styles.insideFooter}>
              <View style={styles.justifyCenter}>
                <Text style={styles.textInsideFooter}>
                  {lang === 'en' ? 'Speed' : '南风'}
                </Text>
                <Text style={styles.textInsideFooter}>
                  {current.wind_spd !== undefined
                    ? current.wind_spd.toFixed(2)
                    : '0'}{' '}
                  km/h
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Icon name="wind" size={width / 10} color="#ffffff" />
              </View>
            </View>
            <View style={styles.insideFooter}>
              <View style={styles.justifyCenter}>
                <Text style={styles.textInsideFooter}>
                  {lang === 'en' ? 'Real Feel' : '体慼'}
                </Text>
                <Text style={styles.textInsideFooter}>
                  {current.app_temp !== undefined
                    ? current.app_temp.toFixed(0)
                    : '0'}{' '}
                  °C
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Icon name="thermometer" size={width / 10} color="#ffffff" />
              </View>
            </View>
          </View>
          <View style={styles.footerBotBot}>
            <View style={styles.insideFooter}>
              <View style={styles.justifyCenter}>
                <Text style={styles.textInsideFooter}>
                  {lang === 'en' ? 'UV Index' : '紫外线指数'}
                </Text>
                <Text style={styles.textInsideFooter}>
                  {current.uv !== undefined ? current.uv.toFixed(2) : '0'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Icon name="sun" size={width / 10} color="#ffffff" />
              </View>
            </View>
            <View style={styles.insideFooter}>
              <View style={styles.justifyCenter}>
                <Text style={styles.textInsideFooter}>
                  {lang === 'en' ? 'Pressure' : '气压'}
                </Text>
                <Text style={styles.textInsideFooter}>
                  {current.pres !== undefined ? current.pres.toFixed(0) : '0'}{' '}
                  hPa
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Icon name="navigation" size={width / 10} color="#ffffff" />
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* </LinearGradient> */}
      {/* Modal Choose City */}
      <Modal
        isVisible={menu}
        animationIn="fadeIn"
        animationOut="fadeOut"
        hideModalContentWhileAnimating='true'
        onBackdropPress={() => setMenu(false)}>
        <View style={{ flex: 1, alignItems: 'center', marginTop: width / 10 }}>
          <Text style={styles.textInsideFooter}>
            {lang === 'en' ? 'Choose Your Location' : '选择您的位置'}
          </Text>
          <View
            style={{
              backgroundColor: '#ffffff',
              width: width / 2,
              marginVertical: 10,
            }}>
            <TextInput
              onChangeText={changeCity}
              onSubmitEditing={() => {
                RecentWeather(), toggleMenu();
              }}
              clearButtonMode={'always'}
              clearTextOnFocus={true}
              enablesReturnKeyAutomatically={true}
              returnKeyType={'search'}
              style={{
                borderWidth: 1,
                borderColor: '#666',
                height: 40,
                paddingHorizontal: 10,
                borderRadius: 5,
              }}
            />
          </View>
          <Button
            onPress={submitCity}
            title={lang === 'en' ? 'Submit' : '提交'}
            color="grey"
          />
          <View />
        </View>
      </Modal>
      {/* Modal Language */}
      <Modal
        isVisible={more}
        animationIn="fadeIn"
        animationOut="fadeOut"
        onBackdropPress={() => setMore(false)}>
        <View
          style={{
            flex: 1,
            alignSelf: 'flex-end',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: width / 2,
              height: width / 3,
              alignItems: 'center',
              right: 0,
            }}>
            <TouchableOpacity onPress={() => changeLang('en')}>
              <View
                style={{
                  backgroundColor: lang === 'en' ? '#ffffff' : 'rgb(0,0,0,.4)',
                  width: width / 6,
                  height: width / 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  borderRadius: 10,
                  margin: 5,
                }}>
                <Text
                  style={{
                    color: lang === 'en' ? '#000000' : '#ffffff',
                    fontSize: width / 20,
                  }}>
                  en
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLang('zh')}>
              <View
                style={{
                  backgroundColor: lang === 'zh' ? '#ffffff' : 'rgb(0,0,0,.4)',
                  width: width / 6,
                  height: width / 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  borderRadius: 10,
                  margin: 5,
                }}>
                <Text
                  style={{
                    color: lang === 'zh' ? '#000000' : '#ffffff',
                    fontSize: width / 20,
                  }}>
                  zh
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView >
  );
};

export default App;

const styles = StyleSheet.create({
  //Container
  container: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'space-between',
  },
  linearGradient: {
    flex: 1,
  },
  containerHeader: {
    flex: 0,
    justifyContent: 'center',
    marginTop: width / 20,
    flexDirection: 'row',
  },
  containerBody: {
    flex: 0,
    marginVertical: width / 40,
  },
  containerFooter: {
    flex: 1,
    marginTop: width / 30,
  },
  containerFooterTop: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 10,
  },
  footerTopList: {
    flexDirection: 'row',
    flex: 1,
  },
  footerTopDetail: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 3,
    marginLeft: width / 100,
    marginRight: width / 50,
  },
  footerTopTemp: {
    flex: 1,
    alignSelf: 'center',
    marginLeft: width / 10,
  },
  containerFooterBot: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 10,
    marginTop: width / 30,
  },
  footerBotTop: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  footerBotBot: {
    flex: 1,
    flexDirection: 'row',
  },
  insideFooter: {
    flex: 1,
    justifyContent: 'center',
    padding: width / 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  justifyCenter: {
    justifyContent: 'center',
    flex: 3
  },
  //Text
  cityText: {
    color: '#ffffff',
    fontSize: width / 18,
    textAlign: 'center',
  },
  tempNumber: {
    color: '#ffffff',
    fontSize: width / 6,
    textAlign: 'center',
  },
  textInsideFooter: {
    color: '#ffffff',
    fontSize: width / 20,
  },
  textInsideModal: {
    color: '#ffffff',
    fontSize: width / 20,
  },
  //Image
  tinyLogo: {
    width: width / 3,
    height: width / 3,
    alignSelf: 'center',
    margin: 0,
  },
  iconFooter: {
    width: width / 10,
    height: width / 10,
    marginRight: 5,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
