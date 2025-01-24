import React, { useState, useEffect } from 'react';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Alert, View, ScrollView, FlatList, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addItem, removeItem, updateItem, setShoppingList, setLoading } from '../Redux/Action';
import { getUserData } from '../utils/authStorage';

const ShoppingListScreen = () => {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [editedItemName, setEditedItemName] = useState('');
    const [editedQuantity, setEditedQuantity] = useState('');
    const [editedCategory, setEditedCategory] = useState('');
    const [editedPrice, setEditedPrice] = useState('');
    const [editedIndex, setEditedIndex] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const isLoading = useSelector((state) => state.shoppingList.loading);
    const shoppingList = useSelector((state) => state.shoppingList.shoppingList);
    console.log('Current Shopping List from Redux:', shoppingList);

    const getQuantityIcon = (quantity) => {
        if (typeof quantity !== 'number' || isNaN(quantity)) {
            return []; 
        }
    
        const numIcons = Math.floor(quantity / 10);
        const iconArray = [];
    
        for (let i = 0; i < numIcons; i++) {
            iconArray.push('cube');
        }
    
        if (quantity === 1) {
            iconArray.push('gift');
        } else if (quantity < 10) {
            iconArray.push('cart');
        }
    
        return iconArray;
    };
    


    const getCategoryIcon = (category) => {
        if (typeof category !== 'string' || !category) {
            return 'home';
        }
    
        switch (category.toLowerCase()) {
            case 'food':
                return 'fast-food';
            case 'electronics':
                return 'tv';
            case 'clothing':
                return 'shirt';
            case 'home':
                return 'home';
            case 'beauty':
                return 'spa';
            case 'sports':
                return 'basketball';
            case 'books':
                return 'book';
            case 'toys':
                return 'toy';
            case 'health':
                return 'heartbeat';
            case 'furniture':
                return 'couch';
            case 'garden':
                return 'leaf';
            case 'automotive':
                return 'car';
            case 'stationery':
                return 'pen';
            default:
                return 'home'; 
        }
    };
    
    useEffect(() => {
        const loadItems = async () => {
            dispatch(setLoading(true));
            try {
                const storedItems = await AsyncStorage.getItem('shoppingList');
                console.log('Loaded Shopping List:', storedItems);
               
                if (storedItems) {
                    const parsedItems = JSON.parse(storedItems);
                    console.log('Parsed Items:', parsedItems);
                    dispatch(setShoppingList(parsedItems));
                    Toast.show({
                        type: 'success',
                        text1: 'Shopping List Loaded',
                        text2: 'Your items have been successfully loaded.',
                        position: 'top',
                      });
                } else {
                    Alert.alert('No items', 'It seems like your shopping list is empty.');
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load shopping list. Please try again.',
                    position: 'top',
                  });
            } finally {
                dispatch(setLoading(false));
            }
        };
        loadItems();
    }, [dispatch]);


    const addItemToList = async () => {
        dispatch(setLoading(true));
        try {
            if (!itemName) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please enter an item name.',
                    position: 'top',
                  });
                return;
            }

            const parsedPrice = parseFloat(price);
            const parsedQuantity = parseInt(quantity) || 1;

            const newItem = {
                id: Date.now(),
                name: itemName,
                quantity: parsedQuantity,
                category: category || 'Uncategorized',
                price: isNaN(parsedPrice) ? 0 : parsedPrice,
            };

            const storedItems = await AsyncStorage.getItem('shoppingList');
            const currentList = storedItems ? JSON.parse(storedItems) : [];

            const itemExists = currentList.some(item => item.name === newItem.name);
            if (itemExists) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'This item already exists in the list.',
                    position: 'top',
                  });
                return;
            }

            const updatedList = [...currentList, newItem];
            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
            console.log('Saved Shopping List:', updatedList);

            dispatch(addItem(newItem));

            setItemName('');
            setQuantity('');
            setCategory('');
            setPrice('');
            setIsAddModalVisible(false);

          
    Toast.show({
        type: 'success',
        text1: 'Item Added',
        text2: 'Your item has been successfully added to the shopping list.',
        position: 'top',
      });
        } catch (error) {
            console.error('Failed to add item:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong while adding the item. Please try again.',
                position: 'top',
              });
        } finally {
            dispatch(setLoading(false));
        }
    };


    const updateItemInList = async () => {
        try {
            if (!editedItemName || !editedQuantity || !editedPrice || !editedCategory) {
             Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields.',
                position: 'top',
             });
                return;
            }

            const parsedPrice = parseFloat(editedPrice);
            const parsedQuantity = parseInt(editedQuantity) || 1;

            const updatedItem = {
                id: shoppingList[editedIndex].id,
                name: editedItemName,
                quantity: parsedQuantity,
                price: isNaN(parsedPrice) ? 0 : parsedPrice,
                category: editedCategory,
            };

            dispatch(updateItem(editedIndex, updatedItem));
            const storedItems = await AsyncStorage.getItem('shoppingList');
            const currentList = storedItems ? JSON.parse(storedItems) : [];
            const updatedList = currentList.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );

            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));

            setEditedItemName('');
            setEditedQuantity('');
            setEditedPrice('');
            setEditedCategory('');
            setEditedIndex(null);
            setIsEditModalVisible(false);

         
    Toast.show({
        type: 'success',
        text1: 'Item Updated',
        text2: 'Your item has been successfully updated.',
        position: 'top',
      });
        } catch (error) {
            console.error('Failed to update item:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong while updating the item. Please try again.',
                position: 'top',
              });
        }
    };

    const togglePurchaseStatus = async (id) => {
        dispatch(setLoading(true));
        try {
          const updatedList = shoppingList.map(item =>
            item.id === id ? { ...item, purchased: !item.purchased } : item
          );
      
          await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
          dispatch(setShoppingList(updatedList));
      
          const toggledItem = updatedList.find(item => item.id === id);
          Toast.show({
            type: toggledItem.purchased ? 'success' : 'info',
            text1: toggledItem.purchased
              ? 'Item Purchased!'
              : 'Item Unmarked as Purchased',
            text2: toggledItem.purchased
              ? 'The item has been marked as purchased.'
              : 'The item has been unmarked.',
            position: 'top',
          });
        } catch (error) {
          console.error('Error toggling purchase status:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Could not update purchase status. Please try again.',
            position: 'top',
          });
        } finally {
          dispatch(setLoading(false));
        }
      };
      

    if (isLoading) {
        return <ActivityIndicator size="small" color="gold" />;
    }


    const EditItem = (item) => {
        setEditedItemName(item.name);
        setEditedCategory(item.category);
        setEditedPrice(item.price);
        setEditedQuantity(item.quantity);
        setEditedIndex(shoppingList.findIndex(i => i.id === item.id));
        setIsEditModalVisible(true);
    };

    const removeItemFromList = async (id) => {
        dispatch(setLoading(true));
        try {
            const updatedList = shoppingList.filter(item => item.id !== id);
            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));

            dispatch(removeItem(id));
            Toast.show({
                type: 'success',
                text1: 'Item Removed!',
                text2: 'Your item has been successfully removed from the shopping list.',
                position: 'top',
              });
        } catch (error) {
            console.error('Failed to remove item:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong while removing the item. Please try again.',
                position: 'top',
              });
        } finally {
            dispatch(setLoading(false));
        }
    };

    const removeUserData = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('shoppingList');
            Toast.show({
                type: 'success',
                text1: 'Data Cleared!',
                text2: 'Your user data has been successfully removed.',
                position: 'top',
              });
        } catch (error) {
            console.error('Error clearing user data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong while clearing user data. Please try again.',
                position: 'top',
              });
        }
    };


    const handleLogout = async () => {
        Toast.show({
          type: 'info',
          text1: 'Logging Out...',
          text2: 'Please wait while we log you out.',
          position: 'top',
        });
      
        try {
          const confirmation = await new Promise((resolve, reject) => {
            Alert.alert(
              'Are you sure?',
              'Do you really want to log out?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => reject('User canceled') },
                {
                  text: 'OK',
                  onPress: () => resolve('User confirmed'),
                },
              ],
              { cancelable: false }
            );
          });
      
          if (confirmation === 'User confirmed') {
            await removeUserData();
            console.log('User data removed from AsyncStorage');
      
            const user = await getUserData();
            console.log('Retrieved user after removal:', user);
      
            Toast.show({
              type: 'success',
              text1: 'Logged Out!',
              text2: 'You have been successfully logged out.',
              position: 'top',
            });
      
            navigation.replace('login');
          }
        } catch (error) {
          console.error('Error during logout:', error);
      
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Something went wrong during logout. Please try again.',
            position: 'top',
          });
        }
      };      

      console.log(shoppingList);

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="gold" />
                </View>
            )}

            {!isLoading && (
                <View style={ styles.modalParent }>
                    <Modal isVisible={isAddModalVisible}>
                        <View style={styles.modalContent}>
                        <Text style={styles.modalHeading}>Add New Item</Text> 
                                <TextInput
                                    style={styles.input}
                                    placeholder="Item Name"
                                    value={itemName}
                                    onChangeText={setItemName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Quantity"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Category"
                                    value={category}
                                    onChangeText={setCategory}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Price"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.button} onPress={addItemToList}>
                                    <Text style={styles.buttonText}>Add Item</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => setIsAddModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                        </View>
                    </Modal>

                    <Modal isVisible={isEditModalVisible}>
                        <View style={styles.modalContent}>
                        <Text style={styles.modalHeading}>Edit Item</Text> 
                                <TextInput
                                    style={styles.input}
                                    placeholder="Edit item name"
                                    value={editedItemName}
                                    onChangeText={setEditedItemName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Quantity"
                                    value={editedQuantity}
                                    onChangeText={setEditedQuantity}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Category"
                                    value={editedCategory}
                                    onChangeText={setEditedCategory}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Price"
                                    value={editedPrice}
                                    onChangeText={setEditedPrice}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.button} onPress={updateItemInList}>
                                    <Text style={styles.buttonText}>Update Item</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => setIsEditModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                        </View>
                    </Modal>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setIsAddModalVisible(true)}
                    >
                        <Ionicons name="cart" size={30} color="white" />
                    </TouchableOpacity>

                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell]}>
                            <Text>Name</Text>
                        </View>
                        <View style={[styles.tableCell]}>
                            <Text>Quantity</Text>
                        </View>
                        <View style={[styles.tableCell]}>
                            <Text>Category</Text>
                        </View>
                        <View style={[styles.tableCell]}>
                            <Text>Price</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1, justifyContent: 'flex-start', paddingLeft: 9 }]}>
                            <Text>Actions</Text>
                        </View>
                    </View>

                    <FlatList
                        data={shoppingList || []}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text>No items in the shopping list!</Text>}
                        renderItem={({ item }) => (
                            <View style={[styles.itemContainer, item.purchased]}>
                                <View style={styles.tableCell}>
                                    <Text style={[styles.itemText, item.purchased ]}>
                                        {item.name || "ExpoBS"}
                                    </Text>
                                </View>

                                <View style={styles.tableCell}>
                                    {getQuantityIcon(item.quantity).map((icon, index) => (
                                        <Ionicons key={index} name={icon} size={25} color="red" />
                                    ))}
                                    <Text>{item.quantity}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Ionicons name={getCategoryIcon(item.category)} size={25} color="gray" />
                                    <Text>{item.category}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Ionicons name="pricetag" size={25} color="green" />
                                    <Text>
                                        R
                                        {typeof item.price === 'number' && !isNaN(item.price)
                                            ? item.price.toFixed(2)
                                            : '0.00'}
                                    </Text>
                                </View>

                                <View style={styles.iconContainer}>
                                    <TouchableOpacity onPress={() => togglePurchaseStatus(item.id)}>
                                        <Ionicons
                                            name={item.purchased ? 'checkbox' : 'checkbox-outline'}
                                            size={24}
                                            color={item.purchased ? 'green' : 'gray'}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => EditItem(item)}>
                                        <Ionicons name="pencil" size={25} color="orange" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => removeItemFromList(item.id)}>
                                        <Ionicons name="trash-bin" size={25} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out" size={25} color="whitesmoke" style={styles.icon} />
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
        position: 'relative', 
    },
    loading: {
        flex: 1,
        top: 50,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeading: {
        fontSize: 24, 
        fontWeight: 'bold',
        marginBottom: 20,  
        textAlign: 'center', 
        color: 'black',
    },
    modalParent: {
        position: 'relative',
        width: '100%',  
        height: '100%',
    },
    modalContent: {
        width: '100%',  
        height:'100%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent:'center',
        alignItems: 'center',
        position: 'relative', 
        zIndex: 999,
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 3,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        marginVertical: 10,
        backgroundColor: 'royalblue',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    addButton: {
        position: 'relative',
        alignItems:'center',
        right: 0,
        bottom: 10,  
        backgroundColor: 'gray',
        borderRadius: 50,
        padding: 15,
        elevation: 5,
    },
    tableRow: {
        flexDirection: 'row',
        marginVertical: 10,
        backgroundColor: 'whitesmoke',
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
        flexWrap: 'wrap', 
        width: '100%'
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        minWidth: 80,  
    },
    itemText: {
        fontSize: 16,
        color: 'black',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        gap:8,
        width:'auto'
    },
    itemContainer: {
        flexDirection: 'row',
        flexWrap:'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        padding: 10,
        backgroundColor: 'whitesmoke',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    purchasedContainer: {
        backgroundColor: '#e0e0e0',
    },
    icon: {
        marginRight: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: 'royalblue',
        borderRadius: 5,
        marginTop: 'auto',  
    },
});


export default ShoppingListScreen;