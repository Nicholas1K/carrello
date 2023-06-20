import React, {useState, useEffect, useContext} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import FooterTab from '../component/FooterTab';
import axios from 'axios';
import {TokenContext} from '../context/TokenContext';
import StringOfLanguages from '../utils/language';
import {Colors} from '../theme/theme';
import apiConst from '../config/apiConst';
import NavbarWithoutBack from '../component/NavbarWithoutBack';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/AntDesign';
import IconWA from 'react-native-vector-icons/FontAwesome';

const HonestyBar = () => {

  //questi servono per fare le get e prendermi i dati sia per gli elementi
  const {token} = useContext(TokenContext);

  // questo lo setto con le immagini e il testo
  const [honestyB, setHonestyB] = useState([]);

  // qui ci metto il menù con gli elementi acquistabili
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // qui attivo e disabilito i pulsanti 
  const [pay, setPay] = useState(false);
  const [confirmOnOff, setConfirmOnOff] = useState(true); //inserire la funzione dentro la funzione di invio degli ordini

  // qui inserisco gli elemnti nel carrello
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState([]); // qui ci metto l'intero elemento per mandarlo con la post al Be

  // questo serve per il conteggio degli items
  const [count, setCount] = useState(0);

  const number = '+393478277013';

  //chiamata asincrona per prendere la prima parte della pagina
  const fetchGetHonesty = async () => {
    try {
      const json = await axios.get(
        apiConst.GET_PAGE_H_BAR + StringOfLanguages.lingua + '/' + token,
      );
      setHonestyB(json.data.data);
    } catch (error) {
      console.error();
    } finally {
      setIsLoading(false);
    }
  };

  //chiamata asincrona per prendere la parte del menù delle ordinazioni
  const fetchGetMenuHonesty = async () => {
    try {
      const json = await axios.get(apiConst.GET_PRODACTS_H_BAR + token);
      setMenu(json.data.data);
    } catch (error) {
      console.error();
    } finally {
      setIsLoadingMenu(false);
    }
  };
  useEffect(() => {
    fetchGetHonesty();
    fetchGetMenuHonesty();
  }, []);

  /*funzioni che servono per settare il totale del prezzo del menù di 
  conferma aumentando e diminuendo in base all'elemento clicato*/
  
  
  function addProdact(product) {
    
    setCart([...cart,product]);

    setTotal(total + product.price);

    setCount(count + 1);

    setPay(true);
    
    console.log('----------------AGGIUNGO----------------------');
    console.log(cart);

  }
  
  function subProdact(product) {
    //setCart([...cart, product]);

    //ELIMINO GLI ELEMENTI DAL CARRELLO
    if(cart.includes(product)){
      const updateProduct = cart.filter((el)=> el !== product);
      setCart(updateProduct); 
    }

    

    //QUI ELIMINA GLI ELEMENTI SOLO DALLO SCHERMO
    if(total - product.price >= 0){
        setTotal(total - product.price);
    }else{
        setTotal(0);
    }

    //QUI STABILISCO CHE SOTTO ALLO ZERO NON PUò SCENERE
    if(count > 0){
        setCount(count - 1);    
    }else{
        setCount(0);
    }

    console.log('----------------RIMUOVO----------------------');
    console.log(cart);
  }

  function isItemInCart(product){
    return cart.includes(product)
  }

  //funzione per abilitare il bottone di conferma da integrare nella post di 
  //invio dei dati ad db, aggiungere un reset di ...cart una volta che è stato inviato l'ordine
  function submitHandler(event){
    event.preventDefault();
    console.log("------INVIO DATI-------")
    if(cart > 0){
      setConfirmOnOff(false);
    }
  }

  
  

  /*console.log('-------------H B with async-------------')
  console.log(menu);*/
  return (
    <>
      <NavbarWithoutBack />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.viewCont}>
            <View>
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={honestyB}
                  key={honestyB}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({item}) => {
                    return (
                      <View>
                        <View>
                          <Image
                            id={item.id}
                            key={item.id}
                            style={styles.imgCont}
                            source={{uri: item.immagine}}
                          />
                        </View>
                        <View>
                          <Text
                            id={item.id}
                            key={item.id}
                            style={styles.txtTitolo}>
                            {item.titolo}
                          </Text>
                        </View>
                        <View style={styles.descrizioneConteiner}>
                          <RenderHTML
                            contentWidth={100}
                            source={{html: item.descrizione}}
                          />
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.oraViewStyle}>
            <Text style={styles.oraStyle}>{StringOfLanguages.ORA}</Text>
          </View>
          <View>
            <Image
              source={require('../images/icons/cocktail-icon.png')}
              style={styles.img}
            />
          </View>
          <View>
            {/*inizio porzione di codice dove viene costruito il menù di selezione dei prodotti */}
            <View>
              {isLoadingMenu ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={menu}
                  key={menu}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  renderItem={({item}) => {
                    return (
                      <View>
                        <View style={styles.txtIconCont}>
                          <View style={styles.txtView}>
                            <Text>{item.description}</Text>
                          </View>
                          <View style={styles.iconView}>
                            <View>
                              <Text style={styles.price}>{item.price}€</Text>
                            </View>
                            <TouchableOpacity
                              //disabled={!isItemInCart(item)} // LOGICA PER DISABILITARE IL BOTTONE DEL MENO E ABILITARE SOLO QUELLI DOVE SONO SELEZIONATI I PRODOTTI
                              onPress={() => subProdact(item)}>
                              <Icon
                                name="minuscircleo"
                                style={styles.iconMinBtn}
                              />
                            </TouchableOpacity>
                            <View style={styles.orView}>
                              <Text>O</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => addProdact(item)}>
                              <Icon
                                name="pluscircleo"
                                style={styles.iconPlus}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.ornamentaLine}></View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
            <View style={styles.onlyForFinalSpace}></View>
          </View>
          {/* BOTTONE WHATSAPP */}
          <View>
            <Image
              source={require('../images/icons/arrow-gettouch.png')}
              style={styles.imgWhatsApp}
            />
          </View>
          <View>
            <View style={styles.btnWhatsApp}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(`whatsapp://send?phone=${number}`);
                }}>
                <View>
                  <IconWA name="whatsapp" style={styles.iconWhatsApp} />
                  <Text style={styles.txtWhatsApp}>
                    {StringOfLanguages.WHATSAPP}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/*questa è la porzione di codice per la shcermata di conferma acquisto dei prodotti */}
      {pay && (
        <View style={styles.testoCont}>
          <View style={styles.totalView}>
            <Text style={styles.total}>{StringOfLanguages.TOT}</Text>
            <Text style={styles.itemsNum}>{count}</Text>
            <Text style={styles.items}>{StringOfLanguages.CARRELLO}</Text>
            <Text style={styles.euro}>€ {total}</Text>
          </View>
          <View>
            <TouchableOpacity //disabled={confirmOnOff} bottone di conferma in cui va collegata la logica di invio degli oerdini
            >
              <View style={styles.btnView}>
                <Text style={styles.conferma}>
                  {StringOfLanguages.CONFERMA}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.onlyForFinalSpace}></View>
      <FooterTab />
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: Colors.lightGray,
  },
  imgCont: {
    height: 180,
    width: '100%',
  },
  img: {
    height: 40,
    width: 30,
    transform: [{translateY: -190}],
    marginLeft: 320,
    tintColor: Colors.hotel,
  },
  txtIndirizzo: {
    marginLeft: 20,
    fontFamily: 'arial',
    marginBottom: 10,
    marginTop: 10,
  },
  txtTitolo: {
    marginLeft: 20,
    color: Colors.hotel,
    fontSize: 20,
    fontFamily: 'arial',
    marginTop: 30,
  },
  dropdownCont: {
    height: 40,
    flexDirection: 'row',
    marginLeft: 30,
    marginRight: 30,
    justifyContent: 'space-between',
    borderBottomWidth: 0.2,
    marginBottom: 10,
    marginTop: 10,
  },
  descrizioneConteiner: {
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center',
  },
  imgWhatsApp: {
    height: 50,
    width: 200,
    transform: [{translateY: -900}],
  },
  btnWhatsApp: {
    backgroundColor: Colors.whatsApp,
    height: 40,
    width: 150,
    borderRadius: 5,
    transform: [{translateY: -900}],
    alignSelf: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
  },
  iconWhatsApp: {
    color: Colors.white,
    fontSize: 30,
    marginLeft: 20,
    marginTop: 5,
  },
  txtWhatsApp: {
    color: Colors.white,
    height: 200,
    width: 200,
    textAlign: 'center',
    marginTop: -25,
  },
  viewMenu: {
    marginTop: 100,
  },
  oraViewStyle: {
    transform: [{translateY: -1120}],
  },
  oraStyle: {
    fontSize: 10,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
    color: Colors.gray,
  },
  onlyForFinalSpace: {
    marginBottom: 300,
    backgroundColor: Colors.white,
  },
  //DA QUESTO PUNTO C'è IL CSS PER LA COSTRUZIONE DEL MENù DEI PRODOTTI
  txtIconCont: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txtIconView: {
    flexDirection: 'row',
  },
  txtView: {
    width: 170,
  },
  iconView: {
    flexDirection: 'row',
  },
  txt: {},
  price: {
    width: 30,
    marginRight: 10,
  },
  iconMinBtn: {
    fontSize: 20,
    color: Colors.minus,
    fontWeight: '100',
  },
  orView: {
    marginLeft: 10,
    marginRight: 10,
  },
  iconPlus: {
    fontSize: 20,
    color: Colors.hotel,
  },
  ornamentaLine: {
    height: 0,
    width: 350,
    marginLeft: 20,
    marginRight: -60,
    borderBottomWidth: 0.2,
  },
  //DA QUESTO PUNTO C'è IL CSS PER LA CONFERMA DI ACQUISTO DEI PRODOTTI
  testoCont: {
    flex: 1,
    bottom: 0,
    height: 200,
    width: '100%',
    backgroundColor: Colors.white,
    position: 'absolute',
  },
  totalView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 20,
    marginLeft: 10,
    marginTop: 10,
    alignSelf: 'center',
    color: Colors.black,
  },
  itemsNum: {
    alignSelf: 'center',
    marginTop: 10,
    marginLeft: 210,
  },
  items: {
    alignSelf: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  euro: {
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 10,
    marginRight: 50,
    color: Colors.black,
  },
  btnView: {
    marginTop: 20,
    backgroundColor: Colors.hotel,
    width: 370,
    height: 50,
    alignSelf: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  conferma: {
    height: 50,
    color: Colors.white,
    alignSelf: 'center',
    fontSize: 20,
    verticalAlign: 'middle',
  },

  //PARTE CSS BOTTONE WHATSAPP
  imgWhatsApp: {
    height: 50,
    width: 200,
    transform: [{translateY: -300}],
  },
  btnWhatsApp: {
    backgroundColor: Colors.whatsApp,
    height: 40,
    width: 150,
    borderRadius: 5,
    transform: [{translateY: -300}],
    alignSelf: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  iconWhatsApp: {
    color: Colors.white,
    fontSize: 30,
    marginLeft: 20,
    marginTop: 5,
  },
  txtWhatsApp: {
    color: Colors.white,
    height: 200,
    width: 200,
    textAlign: 'center',
    marginTop: -25,
  },

  //STILE BOTTONI DISABILITATI/ABILITATO

  //BOTTONE MENO ABILITATO
  iconMinEnabled: {
    fontSize: 20,
    color: Colors.minusAbilited,
    fontWeight: '100',
  },

  //BOTTONE CONFERMA DISABILITATO
  btnViewDisabled: {
    marginTop: 20,
    backgroundColor: Colors.lightGray,
    width: 370,
    height: 50,
    alignSelf: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    elevation: 2,
  },
});
export default HonestyBar;
