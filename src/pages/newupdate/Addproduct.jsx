import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
const API_BASE_URL_TO = import.meta.env.VITE_API_URL;
import Cookies from 'js-cookie';

// Utility function for generating unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
// --- Custom Modal Component (Inline) ---
const ChargeFormModal = ({ 
    productName, 
    setProductName, 
    productAmount, 
    setProductAmount, 
    handleSubmit, 
    closeModal, 
    editingId, 
    isHovered, 
    setIsHovered 
}) => {
    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-opacity-800 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity duration-300" onClick={closeModal}>
            {/* Modal Content */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 sm:p-8 font-[Inter] border-t-4 border-emerald-500 transform scale-100 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                    <h2 className="text-2xl font-extrabold text-emerald-700">
                        {editingId ? 'Edit Service Charge' : 'Create New Charge'}
                    </h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-emerald-600 transition text-2xl leading-none">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                        <input
                            type="text"
                            placeholder="e.g., Blood Test, Consultation"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            // Changed focus ring color to emerald
                            className="w-full p-3 border border-gray-300 rounded-lg transition focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-xs font-semibold text-gray-500 uppercase">Amount (₹)</label>
                        <input
                            type="number"
                            placeholder="Amount (₹)"
                            value={productAmount}
                            onChange={(e) => setProductAmount(e.target.value)}
                            // Changed focus ring color to emerald
                            className="w-full p-3 border border-gray-300 rounded-lg transition focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold"
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2 text-gray-700 bg-gray-200 font-semibold rounded-lg shadow-inner transition-colors text-sm hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`
                                px-5 py-2 text-white font-bold rounded-lg shadow-md transition-all text-sm 
                                ${isHovered ? 'bg-emerald-700 shadow-emerald-400/50' : 'bg-emerald-600 shadow-emerald-500/50'}
                            `}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {editingId ? <><i className="fas fa-save mr-2"></i> Save Changes</> : <><i className="fas fa-plus mr-2"></i> Add Charge</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Application Component ---
const AddChargesManager = () => {
    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productAmount, setProductAmount] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState(null);

      const getdecription = async() => {
  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});
    
  try {
    const response = await api.get('/add_description/'+Cookies.get('user')); 
    console.log('Description fetched:', response.data);
    setProducts(response.data)
  } catch (error) {
    console.error('Error fetching description:', error);
  }
}




const postdecription = async(p) => {
  const api = axios.create({
  baseURL: API_BASE_URL_TO,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json"
  }
});  
  try {
    const response = await api.post('/add_description/'+Cookies.get('user'),p); 
    console.log('Description fetched:', response.data);
  } catch (error) {
    console.error('Error fetching description:', error);
  }


}


useEffect(() => {
  getdecription();
}, []);

    // --- Modal Control Handlers ---

    const openModal = (product = null) => {
        if (product) {
            setEditingId(product.id);
            setProductName(product.name);
            setProductAmount(parseFloat(product.amount).toString());
        } else {
            setEditingId(null);
            setProductName('');
            setProductAmount('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setProductName('');
        setProductAmount('');
    };

    // --- General Handlers ---
    
    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!productName.trim() || !productAmount) {
            showMessage('Description and Amount are required.', 'error');
            return;
        }

        const newAmount = parseFloat(productAmount);
        if (isNaN(newAmount) || newAmount <= 0) {
            showMessage('Please enter a valid positive amount.', 'error');
            return;
        }

        if (editingId) {
            // Update existing product
             postdecription(products.map((p) =>
                p.id === editingId ? { ...p, name: productName.trim(), amount: newAmount.toFixed(2),isVisible:true } : p
        ))
            setProducts(products.map(p => 
                p.id === editingId 
                    ? { ...p, name: productName.trim(), amount: newAmount.toFixed(2), isVisible: true } 
                    : p
            ));
            showMessage('Charge updated successfully.', 'success');
        } else {
            // Add new product
            const newProduct = {
                id: generateId(),
                name: productName.trim(),
                amount: newAmount.toFixed(2),
                isVisible: true,
            };
            postdecription([...products, newProduct])
            setProducts(prev => [...prev, newProduct]);
            showMessage('New charge added.', 'success');
        }
        closeModal();
    };

    const handleDelete = (id, name) => {
        // Use custom modal or similar non-alert dialog in real app
        if (window.confirm(`Are you sure you want to delete the charge: "${name}"?`)) { 
            setProducts(products.filter(p => p.id !== id));
            if (editingId === id) {
                closeModal();
            }
            showMessage('Charge deleted.', 'error');
        }
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen text-sm">
            {/* Load Font Awesome for Icons */}
            <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>
            
            {/* Custom Message Box */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white text-base transition-opacity duration-300 
                    ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-600'}`
                }>
                    {message.text}
                </div>
            )}

            <div className="max-w-4xl mx-auto rounded-xl shadow-2xl bg-white font-[Inter]">
                
                {/* Header Bar - Changed to Emerald */}
                <div className="bg-emerald-700 text-white p-6 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-2xl font-extrabold">
                        <i className="fas fa-list-alt mr-3"></i> Service Charges Manager
                    </h2>
                    <button
                        onClick={() => openModal()}
                        // Changed button colors to Emerald
                        className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-600 transition transform hover:scale-[1.02] text-sm flex items-center"
                    >
                        <i className="fas fa-plus mr-2"></i> Add New Charge
                    </button>
                </div>

                <div className="p-6">
                    {/* Changed text color to Emerald */}
                    <p className="text-gray-500 mb-4 text-xs">Total charges saved: <span className="font-bold text-emerald-600">{products.length}</span></p>

                    {/* Product List Table */}
                    {products.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/12">S.No</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-6/12">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider w-2/12">Amount (₹)</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-3/12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {products.map((product, index) => (
                                        <tr 
                                            key={product.id} 
                                            className={`
                                                transition-colors 
                                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                                // Changed hover color to Emerald
                                                hover:bg-emerald-50
                                                // Changed editing highlight to Emerald
                                                ${editingId === product.id ? 'bg-emerald-100 border-l-4 border-emerald-500' : ''}
                                            `}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {product.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right font-extrabold text-emerald-700 text-lg">
                                                ₹{product.amount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <button 
                                                        onClick={() => openModal(product)} 
                                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition flex items-center shadow-sm"
                                                        title="Edit Charge"
                                                    >
                                                        <i className="fas fa-edit mr-1"></i> Edit
                                                    </button>
                                                    {/* <button 
                                                        onClick={() => handleDelete(product.id, product.name)} 
                                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition flex items-center shadow-sm"
                                                        title="Delete Charge"
                                                    >
                                                        <i className="fas fa-trash-alt mr-1"></i> Delete
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Changed empty state colors to Emerald
                        <div className="mt-8 p-6 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-lg text-center text-emerald-600 italic">
                            <i className="fas fa-info-circle text-xl mb-2"></i>
                            <p>No charges have been added yet. Use the "Add New Charge" button to create your first service item.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Charge Form Modal --- */}
            {isModalOpen && (
                <ChargeFormModal 
                    productName={productName}
                    setProductName={setProductName}
                    productAmount={productAmount}
                    setProductAmount={setProductAmount}
                    handleSubmit={handleSubmit}
                    closeModal={closeModal}
                    editingId={editingId}
                    isHovered={isHovered}
                    setIsHovered={setIsHovered}
                />
            )}
        </div>
    );
};

export default AddChargesManager;