import React, { useState, useEffect } from 'react';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addItem, removeItem, updateItem, setShoppingList } from '../Redux/Action';
import { ScrollView } from 'react-native-gesture-handler';
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
    const shoppingList = useSelector((state) => state.shoppingList.shoppingList);
  


    const getQuantityIcon = (quantity) => {
        if (quantity > 5) {
            return 'cube';
        } else if (quantity === 1) {
            return 'gift';
        } else {
            return 'cart';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'food':
                return 'fast-food';
            case 'electronics':
                return 'tv';
            case 'clothing':
                return 'shirt';
            default:
                return 'home';
        }
    };

    useEffect(() => {
        const loadItems = async () => {
            try {
                const storedItems = await AsyncStorage.getItem('shoppingList');
                console.log('Stored Items:', storedItems);

                if (storedItems) {
                    const parsedItems = JSON.parse(storedItems);
                    dispatch(setShoppingList(parsedItems));

                    parsedItems.forEach(item => {
                        if (!item.id) {
                            item.id = Date.now();
                        }
                        dispatch(addItem(item));
                    });
                } else {
                    Alert.alert('No items', 'It seems like your shopping list is empty.');
                }
                console.log('Shopping List:', shoppingList);
            } catch (error) {
                console.error('Error loading items from AsyncStorage:', error);
            }
        };

        loadItems();
    }, [dispatch]);
    const addItemToList = async () => {
        try {
            if (!itemName) {
                Alert.alert('Error', 'Please enter an item name.');
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
                Alert.alert('Error', 'This item already exists in the list.');
                return;
            }
    
            const updatedList = [...currentList, newItem];
    
            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
    
            dispatch(addItem(newItem));
    
            setItemName('');
            setQuantity('');
            setCategory('');
            setPrice('');  
            setIsAddModalVisible(false);
    
            Alert.alert('Item Added!', 'Your item has been added to the shopping list.');
        } catch (error) {
            console.error('Failed to add item:', error);
            Alert.alert('Error', 'Something went wrong while adding the item.');
        }
    };
    
    const updateItemInList = async () => {
        try {
            if (!editedItemName || !editedQuantity || !editedPrice || !editedCategory) {
                Alert.alert('Error', 'Please fill in all the fields.');
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
    
            Alert.alert('Item Updated!', 'Your item has been updated.');
        } catch (error) {
            console.error('Failed to update item:', error);
            Alert.alert('Error', 'Something went wrong while updating the item.');
        }
    };
    

    const EditItem = (item) => {
        setEditedItemName(item.name);
        setEditedCategory(item.category);
        setEditedPrice(item.price);
        setEditedQuantity(item.quantity);
        setEditedIndex(shoppingList.findIndex(i => i.id === item.id));
        setIsEditModalVisible(true);
    };


    const removeItemFromList = async (id) => {
        try {
            dispatch(removeItem(id));

            const updatedList = shoppingList.filter(item => item.id !== id);

            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));

            Alert.alert('Item Removed!', 'Your item has been removed from the shopping list.');
        } catch (error) {
            console.error('Failed to remove item:', error);
            Alert.alert('Error', 'Something went wrong while removing the item.');
        }
    };

    const removeUserData = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('shoppingList');
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    };


    const handleLogout = async () => {
        Alert.alert(
            'Are you sure?',
            'Do you really want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            await removeUserData();
                            console.log('User data removed from AsyncStorage');

                            const user = await getUserData();
                            console.log('Retrieved user after removal:', user);

                            navigation.replace('login');
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };



    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Modal isVisible={isAddModalVisible}>
                    <View style={styles.modalContent}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
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
                        </ScrollView>
                    </View>
                </Modal>

                <Modal isVisible={isEditModalVisible}>
                    <View style={styles.modalContent}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
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
                        </ScrollView>
                    </View>
                </Modal>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <Ionicons name="cart" size={30} color="white" />
                </TouchableOpacity>

                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Name</Text>
                    <Text style={styles.tableCell}>Quantity</Text>
                    <Text style={styles.tableCell}>Category</Text>
                    <Text style={styles.tableCell}>Price</Text>
                </View>

                <FlatList
                    data={shoppingList}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={<Text>No items in the shopping list!</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>

            <View style={[styles.tableCell, styles.verticalAlign]}>
                            <Text>{item.name}</Text></View>

                           
            <View style={[styles.tableCell, styles.verticalAlign]}>
                                <Ionicons name={getQuantityIcon(item.quantity)} size={20} color="red" />
                                <Text>{item.quantity}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.verticalAlign]}>
                                <Ionicons name={getCategoryIcon(item.category)} size={20} color="royalblue" />
                                <Text>{item.category}</Text>
                            </View>

                              <View style={[styles.tableCell, styles.verticalAlign]}>
                                <Ionicons name="pricetag" size={20} color="royalblue" />
                                <Text style={styles.tableCell}>
                                    R{(typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '0.00')}
                                </Text>
                            </View>

                            <View style={styles.iconContainer}>
                                <TouchableOpacity onPress={() => EditItem(item)}>
                                    <Ionicons name="pencil" size={20} color="orange" style={{ marginRight: 15 }} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => removeItemFromList(item.id)}>
                                    <Ionicons name="trash-bin" size={25} color="red" style={{ marginLeft: 10 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out" size={25} color="whitesmoke" style={styles.icon} />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f4f4f9',
    },
    input: {
        borderWidth: 1,
        marginBottom: 20,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: 'teal',
        borderColor: 'royalblue',
        fontSize: 16,
        width: '100%',
    },
    itemName: {
        fontSize: 16,
        color: '#555',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#333',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'silver',
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 5,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'silver',
        backgroundColor: '#fff',
    },
    tableCell: {
        flex: 1,
        padding: 5,
        fontSize: 14,
        textAlign: 'center',
        color: '#333',
    },
    verticalAlign: {
        flexDirection: 'column', 
        alignItems: 'center',   
        justifyContent: 'center',
    },
    button: {
        backgroundColor: 'gray',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'brown',
        padding: 12,
        marginTop: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },

});

export default ShoppingListScreen;