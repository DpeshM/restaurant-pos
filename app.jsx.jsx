import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChefHat, DollarSign, Plus, Minus, Trash2, Check, Download, Settings, X, Edit } from 'lucide-react';

const RestaurantOrderSystem = () => {
  const [activeTab, setActiveTab] = useState('waiter');
  const [tables, setTables] = useState([
    { id: 1, number: 1, status: 'vacant', orders: [], seats: 4 },
    { id: 2, number: 2, status: 'vacant', orders: [], seats: 4 },
    { id: 3, number: 3, status: 'vacant', orders: [], seats: 6 },
    { id: 4, number: 4, status: 'vacant', orders: [], seats: 2 },
    { id: 5, number: 5, status: 'vacant', orders: [], seats: 8 },
  ]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [qrAmount, setQrAmount] = useState('');
  const [completedTransactions, setCompletedTransactions] = useState([]);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category: 'Main' });
  const [categories, setCategories] = useState(['Main', 'Starter', 'Side', 'Drink', 'Dessert', 'Special']);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [restaurantName, setRestaurantName] = useState('Restaurant POS');
  
  // Initialize menu items from localStorage or use default
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('restaurantMenu');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Burger', price: 12.99, category: 'Main', available: true },
      { id: 2, name: 'Pizza', price: 15.99, category: 'Main', available: true },
      { id: 3, name: 'Pasta', price: 13.99, category: 'Main', available: true },
      { id: 4, name: 'Caesar Salad', price: 9.99, category: 'Starter', available: true },
      { id: 5, name: 'French Fries', price: 5.99, category: 'Side', available: true },
      { id: 6, name: 'Onion Rings', price: 6.99, category: 'Side', available: true },
      { id: 7, name: 'Coke', price: 2.99, category: 'Drink', available: true },
      { id: 8, name: 'Water', price: 1.99, category: 'Drink', available: true },
      { id: 9, name: 'Ice Cream', price: 6.99, category: 'Dessert', available: true },
      { id: 10, name: 'Cheesecake', price: 7.99, category: 'Dessert', available: true }
    ];
  });

  // Save menu to localStorage
  useEffect(() => {
    localStorage.setItem('restaurantMenu', JSON.stringify(menuItems));
  }, [menuItems]);

  // Calculate daily total
  useEffect(() => {
    const total = completedTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
    setDailyTotal(total);
  }, [completedTransactions]);

  const selectTable = (tableNumber) => {
    const table = tables.find(t => t.number === tableNumber);
    setSelectedTable(tableNumber);
    setCurrentOrder([...table.orders]);
  };

  const addItemToOrder = (item) => {
    if (!item.available) return;
    
    const existingItem = currentOrder.find(i => i.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCurrentOrder(currentOrder.map(i =>
      i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    ).filter(i => i.quantity > 0));
  };

  const removeItem = (itemId) => {
    setCurrentOrder(currentOrder.filter(i => i.id !== itemId));
  };

  const submitOrder = () => {
    if (selectedTable && currentOrder.length > 0) {
      const newKitchenOrder = {
        id: Date.now(),
        tableNumber: selectedTable,
        items: currentOrder,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString(),
        createdAt: new Date()
      };
      
      setKitchenOrders([...kitchenOrders, newKitchenOrder]);
      
      setTables(tables.map(t =>
        t.number === selectedTable
          ? { ...t, status: 'occupied', orders: currentOrder }
          : t
      ));
      
      alert(`Order submitted to kitchen for Table ${selectedTable}`);
      setSelectedTable(null);
      setCurrentOrder([]);
    } else {
      alert('Please select a table and add items');
    }
  };

  const addNewTable = () => {
    const newTableNumber = Math.max(...tables.map(t => t.number)) + 1;
    const newTable = {
      id: Date.now(),
      number: newTableNumber,
      status: 'vacant',
      orders: [],
      seats: parseInt(newTableSeats)
    };
    
    setTables([...tables, newTable]);
    setShowAddTable(false);
    setNewTableSeats(4);
  };

  const removeTable = (tableNumber) => {
    if (tables.find(t => t.number === tableNumber)?.status === 'occupied') {
      alert('Cannot remove an occupied table!');
      return;
    }
    
    setTables(tables.filter(t => t.number !== tableNumber));
  };

  const addMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      alert('Please enter item name and price');
      return;
    }

    if (editingMenuItem) {
      // Update existing item
      setMenuItems(menuItems.map(item =>
        item.id === editingMenuItem.id
          ? { ...item, ...newMenuItem, price: parseFloat(newMenuItem.price) }
          : item
      ));
      setEditingMenuItem(null);
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        category: newMenuItem.category,
        available: true
      };
      
      setMenuItems([...menuItems, newItem]);
    }
    
    setNewMenuItem({ name: '', price: '', category: 'Main' });
    setShowAddItem(false);
  };

  const toggleItemAvailability = (itemId) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  const deleteMenuItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    }
  };

  const startEditItem = (item) => {
    setEditingMenuItem(item);
    setNewMenuItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category
    });
    setShowAddItem(true);
  };

  const addCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const proceedToCheckout = (tableNumber) => {
    const table = tables.find(t => t.number === tableNumber);
    if (table && table.orders.length > 0) {
      setActiveTab('checkout');
      setSelectedTable(tableNumber);
      setPaymentMethod('');
      setCashAmount('');
      setQrAmount('');
    }
  };

  const processPayment = () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const table = tables.find(t => t.number === selectedTable);
    const total = parseFloat(calculateTotal(table.orders));

    if (paymentMethod === 'Both') {
      const cash = parseFloat(cashAmount) || 0;
      const qr = parseFloat(qrAmount) || 0;
      
      if (cash + qr !== total) {
        alert(`Total must equal $${total.toFixed(2)}. Cash ($${cash.toFixed(2)}) + QR ($${qr.toFixed(2)}) = $${(cash + qr).toFixed(2)}`);
        return;
      }
    }

    const transaction = {
      id: Date.now(),
      tableNumber: selectedTable,
      items: table.orders,
      total: total,
      paymentMethod: paymentMethod,
      cashAmount: paymentMethod === 'Cash' ? total : (paymentMethod === 'Both' ? parseFloat(cashAmount) : 0),
      qrAmount: paymentMethod === 'QR' ? total : (paymentMethod === 'Both' ? parseFloat(qrAmount) : 0),
      timestamp: new Date().toLocaleString(),
      date: new Date().toLocaleDateString()
    };

    setCompletedTransactions([...completedTransactions, transaction]);

    setTables(tables.map(t =>
      t.number === selectedTable
        ? { ...t, status: 'vacant', orders: [] }
        : t
    ));
    
    setKitchenOrders(kitchenOrders.filter(o => o.tableNumber !== selectedTable));
    
    alert(`Payment processed for Table ${selectedTable}`);
    setSelectedTable(null);
    setCurrentOrder([]);
    setPaymentMethod('');
    setCashAmount('');
    setQrAmount('');
  };

  const markOrderReady = (orderId) => {
    setKitchenOrders(kitchenOrders.map(order =>
      order.id === orderId ? { ...order, status: 'ready' } : order
    ));
  };

  const clearOrder = (orderId) => {
    if (window.confirm('Clear this order from kitchen display?')) {
      setKitchenOrders(kitchenOrders.filter(order => order.id !== orderId));
    }
  };

  const downloadExcel = () => {
    let csvContent = "Table Number,Item Name,Quantity,Price,Item Total,Order Total,Payment Method,Cash Amount,QR Amount,Date,Time\n";
    
    completedTransactions.forEach(transaction => {
      transaction.items.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        csvContent += `${transaction.tableNumber},${item.name},${item.quantity},${item.price},${itemTotal},`;
        
        if (index === 0) {
          csvContent += `${transaction.total.toFixed(2)},${transaction.paymentMethod},${transaction.cashAmount.toFixed(2)},${transaction.qrAmount.toFixed(2)},${transaction.date},${transaction.timestamp}\n`;
        } else {
          csvContent += ",,,,\n";
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetDaily = () => {
    if (window.confirm('Reset daily transactions? This will clear all sales records.')) {
      setCompletedTransactions([]);
      alert('Daily transactions reset');
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-white p-2 rounded-lg">
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <div>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b border-white/30 focus:outline-none focus:border-white"
                />
                <p className="text-sm text-orange-200">POS System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center bg-black/20 px-4 py-2 rounded-lg">
                <div className="text-sm text-orange-200">Daily Total</div>
                <div className="text-2xl font-bold">${dailyTotal.toFixed(2)}</div>
              </div>
              
              <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('waiter')}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                    activeTab === 'waiter' ? 'bg-white text-orange-600 shadow' : 'hover:bg-white/20'
                  }`}
                >
                  <ShoppingCart size={18} />
                  Waiter
                </button>
                <button
                  onClick={() => setActiveTab('kitchen')}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                    activeTab === 'kitchen' ? 'bg-white text-orange-600 shadow' : 'hover:bg-white/20'
                  }`}
                >
                  <ChefHat size={18} />
                  Kitchen
                </button>
                <button
                  onClick={() => setActiveTab('checkout')}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                    activeTab === 'checkout' ? 'bg-white text-orange-600 shadow' : 'hover:bg-white/20'
                  }`}
                >
                  <DollarSign size={18} />
                  Checkout
                </button>
                <button
                  onClick={() => setShowMenuManagement(!showMenuManagement)}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                    showMenuManagement ? 'bg-white text-orange-600 shadow' : 'hover:bg-white/20'
                  }`}
                >
                  <Settings size={18} />
                  Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Menu Management Panel */}
        {showMenuManagement && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-orange-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  <Plus size={18} />
                  Add Menu Item
                </button>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  + Category
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <span key={category} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Menu Items List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">{item.category}</span>
                      </td>
                      <td className="p-3 font-semibold">${item.price.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditItem(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`p-1 ${item.available ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'} rounded`}
                            title={item.available ? 'Make Unavailable' : 'Make Available'}
                          >
                            {item.available ? '✓' : '✗'}
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button onClick={() => {
                  setShowAddItem(false);
                  setEditingMenuItem(null);
                  setNewMenuItem({ name: '', price: '', category: 'Main' });
                }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Steak"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="9.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={addMenuItem}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    {editingMenuItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddItem(false);
                      setEditingMenuItem(null);
                      setNewMenuItem({ name: '', price: '', category: 'Main' });
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Table Modal */}
        {showAddTable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add New Table</h3>
                <button onClick={() => setShowAddTable(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-lg font-semibold">
                    Table {Math.max(...tables.map(t => t.number)) + 1}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={addNewTable}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Add Table
                  </button>
                  <button
                    onClick={() => setShowAddTable(false)}
                    className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!showMenuManagement && (
          <>
            {/* Waiter Tab */}
            {activeTab === 'waiter' && (
              <div>
                {!selectedTable ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-800">Select a Table</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddTable(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                        >
                          <Plus size={20} />
                          Add Table
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {tables.map(table => (
                        <div
                          key={table.id}
                          className={`relative rounded-xl shadow-lg transition-all transform hover:scale-[1.02] ${
                            table.status === 'vacant'
                              ? 'bg-white border-4 border-green-500'
                              : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                          }`}
                        >
                          <div className="p-6">
                            <div className="text-center">
                              <div className="text-4xl font-bold mb-2">Table {table.number}</div>
                              <div className="text-sm font-medium mb-4">
                                <div className="inline-flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${table.status === 'vacant' ? 'bg-green-500' : 'bg-white'}`}></div>
                                  {table.status === 'vacant' ? 'Vacant' : 'Occupied'}
                                </div>
                                <div className="mt-1 text-sm">
                                  {table.seats} seats
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                {table.status === 'vacant' ? (
                                  <button
                                    onClick={() => selectTable(table.number)}
                                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                  >
                                    Start Order
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => selectTable(table.number)}
                                    className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                  >
                                    View/Edit Order
                                  </button>
                                )}
                                
                                {table.status === 'occupied' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      proceedToCheckout(table.number);
                                    }}
                                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                  >
                                    Checkout
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeTable(table.number)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove Table"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Menu */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-500">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-800">Menu - Table {selectedTable}</h2>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowAddItem(true)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                            >
                              + Add Item
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTable(null);
                                setCurrentOrder([]);
                              }}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold"
                            >
                              Back to Tables
                            </button>
                          </div>
                        </div>
                        
                        {Object.entries(groupByCategory(menuItems)).map(([category, items]) => (
                          <div key={category} className="mb-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {items.map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => addItemToOrder(item)}
                                  disabled={!item.available}
                                  className={`flex justify-between items-center p-4 rounded-lg transition-all ${
                                    item.available
                                      ? 'bg-white border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 hover:shadow-md'
                                      : 'bg-gray-100 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="text-left">
                                    <div className="font-semibold text-gray-800">{item.name}</div>
                                    <div className={`text-sm ${item.available ? 'text-gray-600' : 'text-gray-500'}`}>
                                      ${item.price.toFixed(2)}
                                      {!item.available && ' - Unavailable'}
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                    item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.available ? '✓' : '✗'}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Order */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border-2 border-orange-500">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Current Order</h2>
                        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-500">
                          <p className="text-lg font-semibold text-gray-800">Table {selectedTable}</p>
                          <p className="text-sm text-gray-600">
                            {tables.find(t => t.number === selectedTable)?.seats} seats
                          </p>
                        </div>

                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                          {currentOrder.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                              <p>No items added yet</p>
                            </div>
                          ) : (
                            currentOrder.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800">{item.name}</p>
                                  <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 bg-white border rounded-lg">
                                    <button
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="p-2 hover:bg-gray-100 rounded-l"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="font-bold w-8 text-center text-gray-800">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="p-2 hover:bg-gray-100 rounded-r"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {currentOrder.length > 0 && (
                          <div className="border-t-2 border-orange-500 pt-4">
                            <div className="flex justify-between text-xl font-bold mb-4">
                              <span className="text-gray-800">Total:</span>
                              <span className="text-orange-600">${calculateTotal(currentOrder)}</span>
                            </div>
                            <button
                              onClick={submitOrder}
                              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                            >
                              Submit Order to Kitchen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Kitchen Display Tab */}
            {activeTab === 'kitchen' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Kitchen Display System</h2>
                  <div className="text-lg font-semibold text-gray-600">
                    {kitchenOrders.filter(o => o.status === 'pending').length} pending orders
                  </div>
                </div>
                
                {kitchenOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                    <ChefHat size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">No pending orders</p>
                    <p className="text-gray-400">New orders will appear here automatically</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kitchenOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(order => (
                      <div
                        key={order.id}
                        className={`rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl ${
                          order.status === 'ready' ? 'bg-gradient-to-br from-gray-800 to-black text-white' : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-2xl font-bold">Table {order.tableNumber}</div>
                              <div className="text-sm opacity-90 mt-1">{order.timestamp}</div>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                order.status === 'ready' ? 'bg-white text-black' : 'bg-black/30'
                              }`}>
                                {order.status === 'ready' ? 'READY' : 'PREPARING'}
                              </span>
                              <button
                                onClick={() => clearOrder(order.id)}
                                className="p-1 bg-white/20 rounded-full hover:bg-white/30"
                                title="Clear Order"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/20">
                                <div className="flex-1">
                                  <div className="font-semibold">{item.name}</div>
                                  {item.specialInstructions && (
                                    <div className="text-xs opacity-75 italic">Note: {item.specialInstructions}</div>
                                  )}
                                </div>
                                <div className="font-bold">x{item.quantity}</div>
                              </div>
                            ))}
                          </div>

                          <div className="text-center font-bold text-lg mb-4">
                            Total: ${calculateTotal(order.items)}
                          </div>

                          {order.status === 'pending' && (
                            <button
                              onClick={() => markOrderReady(order.id)}
                              className="w-full bg-white text-orange-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
                            >
                              MARK AS READY
                            </button>
                          )}
                          
                          {order.status === 'ready' && (
                            <div className="text-center text-green-300 font-semibold">
                              <Check size={24} className="inline mr-2" />
                              Ready for Service
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Checkout Tab */}
            {activeTab === 'checkout' && (
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">Checkout</h2>
                  {completedTransactions.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                      >
                        <Download size={20} />
                        Export Report
                      </button>
                      <button
                        onClick={resetDaily}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                      >
                        Reset Daily
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tables for Checkout */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-500">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">Select Table for Checkout</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tables
                          .filter(table => table.status === 'occupied')
                          .map(table => (
                            <button
                              key={table.number}
                              onClick={() => {
                                setSelectedTable(table.number);
                                setPaymentMethod('');
                                setCashAmount('');
                                setQrAmount('');
                              }}
                              className={`p-6 rounded-lg shadow-md transition-all ${
                                selectedTable === table.number
                                  ? 'bg-orange-500 text-white transform scale-105'
                                  : 'bg-gradient-to-br from-gray-800 to-black text-white hover:scale-105'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-3xl font-bold mb-2">Table {table.number}</div>
                                <div className="text-sm opacity-90">
                                  ${calculateTotal(table.orders)}
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                      
                      {tables.filter(t => t.status === 'occupied').length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">No occupied tables</p>
                          <p className="text-sm">All tables are vacant or ready for checkout</p>
                        </div>
                      )}
                    </div>

                    {/* Transaction History */}
                    {completedTransactions.length > 0 && (
                      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Today's Transactions</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Table</th>
                                <th className="p-3 text-left">Amount</th>
                                <th className="p-3 text-left">Payment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {completedTransactions.slice().reverse().map(transaction => (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 text-sm">{transaction.timestamp}</td>
                                  <td className="p-3 font-medium">Table {transaction.tableNumber}</td>
                                  <td className="p-3 font-bold text-green-600">${transaction.total.toFixed(2)}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                      {transaction.paymentMethod}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkout Panel */}
                  <div>
                    {selectedTable ? (
                      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-500 sticky top-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">Table {selectedTable}</h3>
                            <p className="text-sm text-gray-600">Checkout</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTable(null);
                              setPaymentMethod('');
                              setCashAmount('');
                              setQrAmount('');
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                          >
                            Back
                          </button>
                        </div>

                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {tables.find(t => t.number === selectedTable)?.orders.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-800">{item.name}</div>
                                <div className="text-sm text-gray-600">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </div>
                              </div>
                              <div className="font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t-2 border-orange-500 pt-4 mb-6">
                          <div className="flex justify-between text-xl font-bold mb-2">
                            <span className="text-gray-800">Subtotal:</span>
                            <span className="text-gray-800">${calculateTotal(tables.find(t => t.number === selectedTable)?.orders || [])}</span>
                          </div>
                          <div className="flex justify-between text-2xl font-bold">
                            <span className="text-gray-800">Total:</span>
                            <span className="text-orange-600">${calculateTotal(tables.find(t => t.number === selectedTable)?.orders || [])}</span>
                          </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3 text-gray-800">Payment Method</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['Cash', 'QR', 'Card', 'Both'].map(method => (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                                  paymentMethod === method
                                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                                    : 'border-gray-300 hover:border-orange-300'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Split Payment Fields */}
                        {paymentMethod === 'Both' && (
                          <div className="space-y-3 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Amount ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">QR Amount ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={qrAmount}
                                onChange={(e) => setQrAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={processPayment}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          PROCESS PAYMENT
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2">Select a table to checkout</p>
                        <p className="text-sm text-gray-500">Click on an occupied table to begin payment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            {restaurantName} POS System • {new Date().toLocaleDateString()} • 
            Total Sales Today: <span className="font-bold text-green-300">${dailyTotal.toFixed(2)}</span> • 
            Active Tables: <span className="font-bold">{tables.filter(t => t.status === 'occupied').length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderSystem;