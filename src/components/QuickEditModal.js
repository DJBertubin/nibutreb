// src/components/QuickEditModal.js
import React, { useState } from 'react';
import './QuickEditModal.css';

const QuickEditModal = ({ product, onClose, onSave }) => {
    const [price, setPrice] = useState(product.price);
    const [inventory, setInventory] = useState(product.inventory);

    const handleSave = () => {
        const updatedProduct = { ...product, price, inventory };
        onSave(updatedProduct);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Edit Product</h3>
                <label>Price</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <label>Inventory</label>
                <input
                    type="number"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                />
                <div className="modal-actions">
                    <button className="btn-save" onClick={handleSave}>Save</button>
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default QuickEditModal;