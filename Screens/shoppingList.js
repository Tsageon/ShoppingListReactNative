import React, { useState, useEffect } from 'react';
import { Alert, View, ScrollView, FlatList, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
                } else {
                    Alert.alert('No items', 'It seems like your shopping list is empty.');
                }
            } catch (error) {
                console.error('Error loading items from AsyncStorage:', error);
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
            console.log('Saved Shopping List:', updatedList);

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
        } finally {
            dispatch(setLoading(false));
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

    const togglePurchaseStatus = async (id) => {
        dispatch(setLoading(true));
        try {
            const updatedList = shoppingList.map(item =>
                item.id === id ? { ...item, purchased: !item.purchased } : item
            );

            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
            dispatch(setShoppingList(updatedList));

        } catch (error) {
            console.error('Error toggling purchase status:', error);
            Alert.alert('Error', 'Could not update purchase status.');
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
            Alert.alert('Item Removed!', 'Your item has been removed from the shopping list.');
        } catch (error) {
            console.error('Failed to remove item:', error);
            Alert.alert('Error', 'Something went wrong while removing the item.');
        } finally {
            dispatch(setLoading(false));
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
            {isLoading && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="gold" />
                </View>
            )}

            {!isLoading && (
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>

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
                        style={styles.addButton}
                        onPress={() => setIsAddModalVisible(true)}
                    >
                        <Ionicons name="cart" size={30} color="white" />
                    </TouchableOpacity>

                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text>Name</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text>Quantity</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1 }]}>
                            <Text>Category</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 0.5, minWidth: 80 }]}>
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
                            <View style={[styles.itemContainer, item.purchased && styles.purchasedContainer]}>
                                <View style={styles.tableCell}>
                                    <Text style={[styles.itemText, item.purchased && styles.strikethrough]}>
                                        {item.name}
                                    </Text>
                                </View>

                                <View style={styles.tableCell}>
                                    {getQuantityIcon(item.quantity).map((icon, index) => (
                                        <Ionicons key={index} name={icon} size={20} color="red" />
                                    ))}
                                    <Text>{item.quantity}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Ionicons name={getCategoryIcon(item.category)} size={20} color="royalblue" />
                                    <Text>{item.category}</Text>
                                </View>
                                <View style={styles.tableCell}>
                                    <Ionicons name="pricetag" size={20} color="royalblue" />
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
                                        <Ionicons name="pencil" size={20} color="orange" />
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
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: 'royalblue',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    addButton: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: 'gray',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'royalblue',
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 5
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        fontWeight: 'bold',
        borderBottomColor: 'royalblue',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    purchasedContainer: {
        backgroundColor: '#d4edda',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: 'gray',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'brown',
        paddingVertical: 10,
        marginTop: 20,
        borderRadius: 5,
    },
    icon: {
        flexDirection: 'row',
        marginRight: 10,
        marginTop: 10
    },
});
``
export default ShoppingListScreen;