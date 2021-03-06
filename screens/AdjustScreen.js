import * as React from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import {
  IotlStrings,
  IotlGlobals,
  AuthContext,
  Colours,
  myErrors,
} from '../api/context';
import {useState} from 'react';
import {Header, Slider, Button, Text, Overlay} from 'react-native-elements';
import {ColorPicker} from 'react-native-color-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colorsys from 'colorsys';
import AwesomeAlert from 'react-native-awesome-alerts';
import {tplinkLogin} from '../api/KasaAuthFunctions';
import useInterval from '../api/useInterval';
import HeaderLeft from '../components/HeaderLeft';
import getLatestLightState from '../api/getLatestLightState';
import getDeviceList from '../api/getDeviceList';
import sendLatestLightKasa from '../api/sendLatestLightKasa';
import SettingsOverlay from '../api/SettingsOverlay';

//import {ColorWheel} from 'react-native-color-wheel';

const AdjustScreen = props => {
  const contextStrings = React.useContext(IotlStrings);
  const {
    updateAuthObjTruth,
    updateUserObjTruth,
    getAppUserObj,
    getAppAuthObj,
  } = React.useContext(AuthContext);

  const [kasaSettings, setKasaSettings] = useState({
    h: '00',
    s: '50',
    v: '50',
    color_temp: 0,
    oldHex: '#332929',
    newHex: '#332929',
    power: false,
    transitionTime: 0,
  });

  const [authObj, setAuthObj] = React.useState(
    getAppAuthObj('request by Colour usestate defgault setup'),
  );

  const [userObj, setuserObj] = React.useState({
    showbg: require('../assets/images/lightBG3.jpg'),
    toState: 1,
    transTime: 0,
    saveUserObj: false,
    isToKasa: false,
    errorMessage: 'Getting latest Settings',
    errorTitle: 'Updating',
    showProgress: true,
    showConfirm: false,
    showAlert: false,
    closeOut: false,
    closeBack: false,
    showCancel: false,
    confText: 'OK',
    confirmButtonColor: Colours.myYellow,
    slidBrightness: 0.5,
    slidSaturation: 0.5,
    slidSaturationT: 50,
    slidBrightnessT: 50,
    hueT: 90,
    hueText: 55,
    hueHex: '#ffffff',
    satHex: '#ffffff',
    briHex: '#ffffff',
    showAlertW: false,
    showbg: require('../assets/images/lightBG3.jpg'),
    showProgressW: true,
    showConfirmW: false,
    closeOutW: false,
    closeBackW: false,
    showCancelW: false,
    errorTitleW: IotlStrings.is_loadingT,
    errorMessageW: IotlStrings.is_loadingM,
    isOverlayOpen: false,
    showTemp: false,
  });

  const _alertBulbStatus = switchTo => {
    console.log('bulbstatusswitch ', switchTo);
    if (switchTo == true) {
      setuserObj({
        ...userObj,
        showAlert: false,
        showbg: require('../assets/images/lightBG6.jpg'),
        showProgress: false,
        showConfirm: true,
        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmButtonColor: Colours.myGreenConf,
        errorTitle: IotlStrings.plug_OnlineT,
        errorMessage: IotlStrings.plug_OnlineM,
      });
      setAuthObj({
        ...authObj,

        noDevicesKasa: false,

        isLoading: false,
        saveAuthObj: true,
      });
    } else {
    }
  };
  React.useEffect(() => {
    console.log('----------Colour ----------');
    console.log(
      '--------- AUTHOBJ.noDevicesKasa INITIAL LOAD >>',
      authObj.noDevicesKasa,
    );
    setuserObj({
      ...userObj,
      showAlert: true,
      showbg: require('../assets/images/lightBG3.jpg'),
      showProgress: true,
      showConfirm: false,
      closeOut: false,
      closeBack: false,
      showCancel: false,
      errorTitle: IotlStrings.is_loadingT,
      errorMessage: IotlStrings.is_loadingM,
    });
    setupPage();

    console.log('----------Colour Exit ----------');
  }, []);

  React.useEffect(() => {
    if (authObj.saveAuthObj) {
      updateAuthObjTruth(authObj);
    }
  }, [authObj]);

  React.useEffect(() => {
    //  console.log('kasasettings UPDATED', JSON.stringify(kasaSettings));
  }, [userObj.isOverlayOpen]);

  /* if(authObj.isPolling) {
  console.log("polling", authObj.kasaObj.kasa)
  useInterval(async () => {
    
    try {const latestLightState = await authObj.kasaObj.kasa.info(
      authObj.deviceInfo.deviceId,
    );
    console.log(latestLightState);
      
    } catch (error) {
      
    }
    
  }, authObj.pollTime); } */

  const setupPage = async () => {
    console.log('Page Setup  ', authObj.kasaObj);

    if (authObj.noDevicesKasa) {
      console.log(
        '--------------------------------------Colour Plug offline error',
      );

      setuserObj({
        ...userObj,
        showAlert: true,
        showbg: require('../assets/images/lightBG3.jpg'),
        showProgress: false,
        showConfirm: true,
        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmButtonColor: Colours.myRedConf,
        errorTitle: IotlStrings.plug_OfflineT,
        errorMessage: IotlStrings.plug_OfflineM,
      });
      setKasaSettings({...kasaSettings, power: 0});
    } else {
      getBulbState();
    }
  };

  const colourChanged = value => {
    let slidBC = Math.floor(value.v * 100);
    let slidSC = Math.floor(value.s * 100);
    let cPV = Math.floor(value.h);
    var hslConverted = colorsys.hsv2Hex({h: cPV, s: slidSC, v: slidBC});

    console.log(
      'sending Colour Changed -------------------------------------------',
      {...kasaSettings, h: cPV, s: slidSC, v: slidBC},
    );
    let bgAmount;
    if (slidBC <= 25) bgAmount = require('../assets/images/lightBG3.jpg');
    if ((slidBC > 25) & (slidBC <= 50))
      bgAmount = require('../assets/images/lightBG4.jpg');
    if ((slidBC > 50) & (slidBC <= 75))
      bgAmount = require('../assets/images/lightBG5.jpg');
    if ((slidBC > 75) & (slidBC <= 100))
      bgAmount = require('../assets/images/lightBG6.jpg');

    setKasaSettings({
      ...kasaSettings,
      h: cPV,
      s: slidSC,
      v: slidBC,
      newHex: hslConverted,
    });
    setuserObj({
      ...userObj,
      slidSaturationT: slidSC,
      slidBrightnessT: slidBC,
      hueT: cPV,
      showbg: bgAmount,
    });

    console.log('hslConverted', hslConverted);
  };

  const showError = () => {
    setuserObj({...userObj, showAlert: !userObj.showAlert});
  };

  const getBulbState = async () => {
    setuserObj({
      ...userObj,
      showAlert: true,
      showbg: require('../assets/images/lightBG3.jpg'),
      showProgress: true,
      showConfirm: false,
      closeOut: false,
      closeBack: false,
      showCancel: false,
      errorTitle: 'Connecting to Kasa',
      errorMessage: 'Hamster Wheel Running',
    });
    const latestBulbSettings = await getLatestLightState(
      authObj.kasaObj,
      authObj.authDeviceList[0].deviceId,
    );
    console.log('??????????????????latestLightState', latestBulbSettings);
    if (latestBulbSettings.errorMessage == 'Plug_Offline') {
      setuserObj({
        ...userObj,
        showAlert: true,
        showbg: require('../assets/images/lightBG3.jpg'),
        showProgress: false,
        showConfirm: true,
        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmButtonColor: Colours.myRedConf,
        errorTitle: IotlStrings.plug_OfflineT,
        errorMessage: IotlStrings.plug_OfflineM,
      });
      setAuthObj({
        ...authObj,
        noDevicesKasa: true,
      });
    } else {
      latestBulbSettings.light_state.dft_on_state
        ? (latestHSV = {
            h: latestBulbSettings.light_state.dft_on_state.hue,
            s: latestBulbSettings.light_state.dft_on_state.saturation,
            v: latestBulbSettings.light_state.dft_on_state.brightness,
          })
        : (latestHSV = {
            h: latestBulbSettings.light_state.hue,
            s: latestBulbSettings.light_state.saturation,
            v: latestBulbSettings.light_state.brightness,
          });

      var hslConverted = colorsys.hsv2Hex(latestHSV);
      console.log('hslconverted >>>> ', hslConverted);

      setAuthObj({
        ...authObj,
        deviceInfo: latestBulbSettings,
        noDevicesKasa: false,
        saveAuthObj: true,
      });
      kasaSettings.h == '00'
        ? setuserObj({
            ...userObj,
            slidSaturationT: latestHSV.s,
            slidBrightnessT: latestHSV.v,
            hueT: latestHSV,

            showAlert: true,
            showbg: require('../assets/images/lightBG6.jpg'),
            showProgress: false,
            showConfirm: true,
            closeOut: true,
            closeBack: true,
            showCancel: false,
            errorTitle: 'Bulb Found!',
            errorMessage: 'Online! - Settings updated ',
          })
        : setuserObj({
            ...userObj,
            slidSaturationT: latestHSV.s,
            slidBrightnessT: latestHSV.v,
            hueT: latestHSV,

            showAlert: false,
            showbg: require('../assets/images/lightBG6.jpg'),
          });
      setKasaSettings({
        h: latestHSV.h,
        s: latestHSV.s,
        v: latestHSV.v,
        color_temp: latestBulbSettings.light_state.color_temp,
        rssi: latestBulbSettings.rssi,
        oldHex: hslConverted,
        newHex: hslConverted,
        power: latestBulbSettings.light_state.dft_on_state
          ? latestBulbSettings.light_state.dft_on_state.on_off
          : latestBulbSettings.light_state.on_off,
      });
    }
  };

  const sendBulbState = async sentBulbOptions => {
    console.log('sentbulb ==', sentBulbOptions);
    let latestBulbSettings = {};
    let _sendingLightUpdateObj = {};

    setuserObj({
      ...userObj,
      showAlert: true,
      showbg: require('../assets/images/lightBG3.jpg'),
      showProgress: true,
      showConfirm: false,
      closeOut: false,
      closeBack: false,
      showCancel: false,
      errorTitle: 'Connecting to Kasa',
      errorMessage: 'Hamster Wheel Running',
    });

    try {
    } catch (error) {}
    //tranition 0 - 10000 muilliseconds temp 0 - 7000 h 0 - 360 v 0 - 100
    if (sentBulbOptions.lightSettings) {
      console.log('hit power');

      _sendingLightUpdateObj = sentBulbOptions;
    } else {
      console.log('hit else');
      _sendingLightUpdateObj = {
        authObj: authObj.kasaObj,
        deviceId: authObj.authDeviceList[0].deviceId,
        toState: userObj.toState,
        transTime: userObj.transTime,
        lightSettings: {
          mode: 'normal',
          hue: kasaSettings.h,
          saturation: kasaSettings.s,
          color_temp: 0,
          brightness: kasaSettings.v,
        },
      };
    }

    try {
      latestBulbSettings = await sendLatestLightKasa(_sendingLightUpdateObj);
      console.log('latestBulbSettings >>>', latestBulbSettings);
    } catch (error) {
      console.log(' catch');
      console.log(' POWEER CATCH ERROR >>>>>', error);
    }

    if (latestBulbSettings.errorMessage == 'Plug_Offline') {
      console.log(
        '+++++++++++++++++++++++++++++++latestBulbSettings',
        IotlStrings.plug_Offline,
      );
      setuserObj({
        ...userObj,
        showAlert: true,
        showbg: require('../assets/images/lightBG3.jpg'),
        showProgress: false,
        showConfirm: true,
        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmButtonColor: Colours.myRedConf,
        errorTitle: IotlStrings.plug_OfflineT,
        errorMessage: IotlStrings.plug_OfflineM,
      });
      setAuthObj({
        ...authObj,
        noDevicesKasa: true,
      });
    } else if (latestBulbSettings.dft_on_state != undefined) {
      console.log('online Plug Off');

      setuserObj({
        ...userObj,

        showbg: require('../assets/images/lightBG3.jpg'),

        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmdft_on_stateColor: Colours.myGreenConf,
        errorTitle: 'Plug Powered Off',
        errorMessage: 'Plug Off',
      });

      let latestDeviceList = await getDeviceList(authObj.kasaObj);
      console.log(
        '???????????????????????????   latest device list ',
        latestDeviceList,
      );

      const latestHSV = {
        h: latestBulbSettings.dft_on_state.hue,
        s: latestBulbSettings.dft_on_state.saturation,
        v: latestBulbSettings.dft_on_state.brightness,
      };

      var hslConverted = colorsys.hsv2Hex(latestHSV);
      console.log('hslconverted >>>> ', hslConverted);

      setAuthObj({
        ...authObj,
        authDeviceList: latestDeviceList,
        deviceInfo: latestBulbSettings,
        noDevicesKasa: true,
        saveAuthObj: true,
      });

      setKasaSettings({
        ...kasaSettings,
        h: latestHSV.h,
        s: latestHSV.s,
        v: latestHSV.v,
        color_temp: latestBulbSettings.color_temp,
        oldHex: hslConverted,
        newHex: hslConverted,
        power: false,
      });
      setuserObj({
        ...userObj,
        slidSaturationT: latestHSV.s,
        slidBrightnessT: latestHSV.v,
        hueT: latestHSV,
        showAlert: false,
      });
    } else {
      console.log('online - Plug On', latestBulbSettings);

      setuserObj({
        ...userObj,

        showbg: require('../assets/images/lightBG6.jpg'),

        closeOut: true,
        closeBack: true,
        showCancel: false,
        confText: 'OK',
        confirmButtonColor: Colours.myGreenConf,
        errorTitle: IotlStrings.plug_OnlineT,
        errorMessage: IotlStrings.plug_OnlineM,
      });

      let latestDeviceList = await getDeviceList(authObj.kasaObj);
      console.log(
        '???????????????????????????   latest device list ',
        latestDeviceList,
      );

      const latestHSV = {
        h: latestBulbSettings.hue,
        s: latestBulbSettings.saturation,
        v: latestBulbSettings.brightness,
      };

      var hslConverted = colorsys.hsv2Hex(latestHSV);
      console.log('hslconverted >>>> ', hslConverted);

      setAuthObj({
        ...authObj,
        authDeviceList: latestDeviceList,
        deviceInfo: latestBulbSettings,
        noDevicesKasa: false,
      });

      setKasaSettings({
        ...kasaSettings,
        h: latestHSV.h,
        s: latestHSV.s,
        v: latestHSV.v,
        color_temp: latestBulbSettings.color_temp,
        oldHex: hslConverted,
        newHex: hslConverted,
        power: latestBulbSettings.on_off,
      });
      setuserObj({
        ...userObj,
        slidSaturationT: latestHSV.s,
        slidBrightnessT: latestHSV.v,
        hueT: latestHSV,
        showAlert: false,
      });
    }
  };

  const toggleBulbPower = () => {
    let latestBulbSettings = {};

    //tranition 0 - 10000 muilliseconds temp 0 - 7000 h 0 - 360 v 0 - 100
    latestBulbSettings = {
      authObj: authObj.kasaObj,
      deviceId: authObj.authDeviceList[0].deviceId,
      toState: !kasaSettings.power,
      transTime: userObj.transTime,
      lightSettings: {
        mode: 'normal',
        hue: kasaSettings.h,
        saturation: kasaSettings.s,
        color_temp: 0,
        brightness: kasaSettings.v,
      },
    };
    setKasaSettings({
      ...kasaSettings,
      power: !kasaSettings.power,
    });
    console.log(latestBulbSettings);

    sendBulbState(latestBulbSettings);
  };

  const wheelPressed = async () => {
    let tokenExpired = false;
    console.log('Turning off');

    try {
      let sentLightSettings = {};

      const power = await authObj.kasaObj.kasa.power(
        authObj.deviceInfo.deviceId,
        true,
        10000,
        sentLightSettings,
      );
      console.log('return from light update', JSON.stringify(power));
    } catch (e) {
      console.log(
        ' +++++++++++++++++++++++++++++++++++++++             POWEEERRRRR ERROR',
        JSON.stringify(power),
      );
    }
  };
  const headerSelect = selection => {
    if (selection == 'left') {
      return (
        <View>
          <HeaderLeft kasaSettings={kasaSettings} authObj={authObj} />
        </View>
      );
    } else {
      return (
        <View style={{justifyContent: 'flex-start'}}>
          <Icon
            onPress={() => {
              setuserObj({...userObj, isOverlayOpen: !userObj.isOverlayOpen});
            }}
            style={styles.settingsIcon}
            name={'settings'}
            size={25}
            iconStyle={{
              color: Colours.myRedConf,
            }}
          />
          {/*  */}
        </View>
      );
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <ImageBackground source={userObj.showbg} style={styles.backgroundImage}>
        <Header
          statusBarProps={{barStyle: 'default'}}
          containerStyle={styles.header}
          centerComponent={{
            text: !authObj.noDevicesKasa ? '' : IotlStrings.noDevices,
            style: !authObj.noDevicesKasa
              ? styles.headerTextCon
              : styles.headerTextDis,
            icon: 'home',
          }}
          centerContainerStyle={{
            flex: 0,
            marginStart: 25,
          }}
          rightContainerStyle={{
            flex: 1,
          }}
          leftContainerStyle={{
            flex: 1,
          }}
          // rightComponent={() => headerSelect('right')}
          leftComponent={() => headerSelect('left')}
        />

        <View style={styles.mainContainer}>
          <View style={styles.bottomHSBContainer}>
            <View style={styles.pickerContainer}>
              <ColorPicker
                //  onColorSelected={() => sendBulbState('wheel')}
                oldColor={kasaSettings.oldHex}
                defaultColor={kasaSettings.oldHex}
                SliderProps={{value: 0.3}}
                style={{flex: 1}}
                onColorChange={value => colourChanged(value)}
                sliderComponent={Slider}

                //  onColorSelected={() => wheelPressed()}
              />
            </View>
            {userObj.showTemp ? (
              <View style={styles.textRowtitlesCT}>
                <Text style={styles.rgbTextCT}>Temp</Text>
                <Text style={styles.rgbTextCTB}>Brightness</Text>
              </View>
            ) : (
              <View style={styles.textRowtitles}>
                <Text style={styles.rgbTextH}>Hue</Text>
                <Text style={styles.rgbTextS}>Saturation</Text>
                <Text style={styles.rgbTextB}>Brightness</Text>
              </View>
            )}

            {userObj.showTemp ? (
              <View style={styles.hsvNumRowContainer}>
                <Text
                  style={
                    !authObj.noDevicesKasa
                      ? [
                          styles.rgbNumCT /* , {color: kasaSettings.color_temp }*/,
                        ]
                      : styles.rgbNumDis
                  }>
                  asdasdasd
                </Text>
                <Text
                  style={
                    !authObj.noDevicesKasa
                      ? [
                          styles.rgbNumCTB,
                          {
                            color: Colours.myWhite,
                            opacity: kasaSettings.v * 0.01,
                          },
                        ]
                      : styles.rgbNumDis
                  }>
                  {kasaSettings.v}
                </Text>
              </View>
            ) : (
              <View style={styles.hsvNumRowContainer}>
                <Text
                  style={
                    !authObj.noDevicesKasa
                      ? [styles.rgbNumH, {color: kasaSettings.newHex}]
                      : styles.rgbNumDis
                  }>
                  {kasaSettings.h}
                </Text>
                <Text
                  style={
                    !authObj.noDevicesKasa
                      ? [
                          styles.rgbNumS,
                          {
                            color: Colours.myYellow,
                            opacity: kasaSettings.s * 0.01,
                          },
                        ]
                      : styles.rgbNumDis
                  }>
                  {kasaSettings.s}
                </Text>
                <Text
                  style={
                    !authObj.noDevicesKasa
                      ? [
                          styles.rgbNumB,
                          {
                            color: Colours.myWhite,
                            opacity: kasaSettings.v * 0.01,
                          },
                        ]
                      : styles.rgbNumDis
                  }>
                  {kasaSettings.v}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.butContainer}>
            <Button
              icon={
                !authObj.noDevicesKasa ? (
                  <Icon name="reload" style={styles.buttonIconCon} />
                ) : (
                  <Icon name="arrow-right" style={styles.buttonIconDis} />
                )
              }
              iconRight
              titleStyle={
                !authObj.noDevicesKasa ? styles.butTextCon : styles.butTextDis
              }
              title={
                !authObj.noDevicesKasa
                  ? IotlStrings.greenDevicesB
                  : IotlStrings.noDevicesB
              }
              type="outline"
              buttonStyle={
                !authObj.noDevicesKasa ? styles.buttonCon : styles.buttonDis
              }
              loading={userObj.isloading}
              onPress={() =>
                authObj.noDevicesKasa ? getBulbState() : sendBulbState('latest')
              }
            />
          </View>
          <View />
          <View style={styles.powerIconContainer}>
            <Icon
              name={!authObj.noDevicesKasa ? 'flash-outline' : 'flash-off'}
              type="material-community"
              style={
                !authObj.noDevicesKasa
                  ? styles.resetIconCon
                  : styles.resetIconDis
              }
              onPress={() => toggleBulbPower()}
            />
          </View>
          <View style={styles.resetIconContainer}>
            <Icon
              name="backup-restore"
              type="material-community"
              onPress={() => console.log('hello')}
              style={
                !authObj.noDevicesKasa
                  ? styles.resetIconCon
                  : styles.resetIconDis
              }
            />
          </View>
          {/*   <View>
            {userObj.isOverlayOpen ? (
              <Overlay
                isVisible={userObj.isOverlayOpen}
                userObj={userObj}
                style={styles.settingsOverlay}>
                <Text>Hello from Overlay!</Text>
              </Overlay>
            ) : (
              <Text>adasdadad</Text>
            )}
          </View> */}

          <AwesomeAlert
            show={userObj.showAlert}
            title={userObj.errorTitle}
            message={userObj.errorMessage}
            showProgress={userObj.showProgress}
            closeOnTouchOutside={userObj.closeOut}
            closeOnHardwareBackPress={userObj.closeBack}
            showCancelButton={userObj.showCancel}
            showConfirmButton={userObj.showConfirm}
            confirmText={userObj.confText}
            confirmButtonColor={userObj.confirmButtonColor}
            progressSize={30}
            contentContainerStyle={styles.alertMCont}
            titleStyle={styles.alertTitle}
            messageStyle={styles.alertMessage}
            progressColor={Colours.myLgtBlue}
            onConfirmPressed={() => {
              showError();
            }}
          />
        </View>
      </ImageBackground>
    </View>
  );
};
const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    flex: 0,
    height: 38,
    padding: 0,
    margin: 0,
    marginTop: 25,

    borderBottomWidth: 0,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    marginBottom: 0,
    backgroundColor: 'black',
  },
  overlay: {
    backgroundColor: 'rgba(255,0,0,0.5)',
  },
  mainContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    flex: 1,
    paddingBottom: 85,
  },
  settingsOverlay: {
    zIndex: 200,
  },

  alertCont: {
    backgroundColor: Colours.myWhite,
    borderColor: Colours.myYellow,
    height: 500,
    width: 500,
    flex: 0,
    color: 'red',
  },

  alertMCont: {
    backgroundColor: Colours.myWhite,
    borderColor: Colours.myYellow,
    borderWidth: 2,
    color: 'red',
  },

  alertTitle: {
    color: Colours.myDrkBlue,
  },
  alertMessage: {
    textAlign: 'center',

    color: Colours.myLgtBlue,
  },
  wheelContainer: {height: 150, width: 150},
  resetIconContainer: {
    position: 'absolute',
    left: 118,
    top: 182,

    flex: 0,
    zIndex: 10,
  },
  powerIconContainer: {
    position: 'absolute',
    left: 218,
    top: 185,

    alignContent: 'center',

    flex: 0,
    zIndex: 10,
  },
  resetIconDis: {
    fontSize: 25,
    color: 'red',
    zIndex: 15,
  },
  powerIconDis: {
    fontSize: 25,
    color: 'red',
    zIndex: 15,
  },
  resetIconCon: {
    fontSize: 25,
    color: Colours.myGreenConf,
    zIndex: 15,
  },
  powerIconCon: {
    fontSize: 25,

    color: Colours.myGreenConf,
    zIndex: 15,
  },
  buttonCon: {
    borderColor: Colours.myWhite,
    width: 150,
  },
  settingsIcon: {
    fontSize: 25,
    color: Colours.myWhite,
    marginBottom: 35,
    marginLeft: 15,
    zIndex: 500,
  },
  buttonDis: {
    borderColor: Colours.myRedConf,
  },
  buttonIconDis: {
    fontSize: 17,
    color: Colours.myRedConf,
  },
  butTextCon: {
    fontSize: 17,
    color: Colours.myWhite,
  },
  butTextDis: {
    fontSize: 17,
    color: Colours.myRedConf,
  },
  buttonIconCon: {
    fontSize: 17,
    color: Colours.myWhite,
    marginLeft: 10,
  },
  butContainer: {
    alignSelf: 'center',
  },

  hsvNumRowContainer: {
    justifyContent: 'space-evenly',
    alignContent: 'center',

    flexDirection: 'row',
    flex: 0,
  },
  textRowtitles: {
    alignContent: 'center',
    marginTop: 8,
    flexDirection: 'row',
    flex: 0,
  },
  textRowtitlesCT: {
    justifyContent: 'space-around',
    marginTop: 8,
    flexDirection: 'row',
    flex: 0,
  },
  rgbTextDis: {
    fontSize: 15,
    flex: 0,
    paddingLeft: 45,

    color: Colours.myWhite,
  },
  rgbTextH: {
    fontSize: 15,
    flex: 0,
    paddingLeft: 45,

    color: Colours.myWhite,
  },
  rgbTextCT: {
    fontSize: 15,
    flex: 0,

    color: Colours.myWhite,
  },
  rgbTextCTB: {
    fontSize: 15,
    flex: 0,

    color: Colours.myWhite,
  },
  rgbTextS: {
    fontSize: 15,
    flex: 0,
    paddingLeft: 73,
    borderColor: 'white',

    color: Colours.myWhite,
  },
  rgbTextB: {
    fontSize: 15,
    flex: 0,
    paddingLeft: 48,

    color: Colours.myWhite,
  },
  rgbNumDis: {
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
    textDecorationLine: 'line-through',
    color: Colours.myRedConf,
  },
  rgbNumCT: {
    color: Colours.myWhite,
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
  },
  rgbNumCTB: {
    color: Colours.myWhite,
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
  },
  rgbNumH: {
    color: Colours.myWhite,
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
  },
  rgbNumS: {
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
  },
  rgbNumB: {
    color: Colours.myYellow,
    fontSize: 25,
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginBottom: 10,
    width: 100,
    textTransform: 'uppercase',
  },
  bottomHSBContainer: {
    flex: 1,
    marginVertical: 20,
  },
  pickerContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTextCon: {
    color: Colours.myWhite,
    marginBottom: 20,
    fontWeight: '700',
  },
  headerTextDis: {
    color: Colours.myRedConf,
    marginBottom: 20,
    fontWeight: '700',
  },
  headerLeftCon: {
    marginBottom: 30,

    fontSize: 12,
    color: Colours.myGreenConf,
    flex: 0,
    width: 55,
  },
  headerLeftDis: {
    fontSize: 12,
    color: Colours.myRedConf,
    marginBottom: 40,
  },
  headerRightCon: {
    color: Colours.myGreenConf,
    fontSize: 12,
    marginEnd: 8,
  },
  headerRightDis: {
    fontSize: 12,
    color: Colours.myRedConf,
  },
});
export default AdjustScreen;
