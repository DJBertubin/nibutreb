// File: src/components/ProductList.js

import React, { useState } from 'react';
import './ProductList.css'; // Import a CSS file for modern table styles

const ProductList = ({ products }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Sort products by created date (newest first)
    const sortedProducts = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId]
        );
    };

    const handleSave = () => {
        const selectedItems = products.filter((product) => selectedProducts.includes(product.id));
        const csvContent = generateCSV(selectedItems);
        downloadCSV(csvContent, 'selected_products.csv');
    };

    const handleSync = () => {
        const selectedItems = products.filter((product) => selectedProducts.includes(product.id));
        const csvContent = generateCSV(selectedItems);
        downloadCSV(csvContent, 'selected_products.csv');

        // Open Amazon login page
        const loginWindow = window.open('https://sellercentral.amazon.com/home?mons_sel_mkid=amzn1.mp.o.ATVPDKIKX0DER&mons_sel_dir_mcid=amzn1.merchant.d.ACYYLFT77R7XBHL7R6RM3COUWRPA&mons_sel_dir_paid=amzn1.pa.d.ADDL5DGYVHUZPY5ATMSDLABJM6VQ&ignore_selection_changed=true', '_blank');

        setTimeout(() => {
            const passwordField = loginWindow.document.getElementById('ap_password');
            if (!passwordField) {
                loginWindow.document.querySelector("a[href*='switch_account']").click();
                setTimeout(() => {
                    loginWindow.document.querySelector("a[href*='add_account']").click();
                    setTimeout(() => {
                        loginWindow.document.getElementById('ap_email').value = 'djbertubin@gmail.com';
                        loginWindow.document.querySelector('input[type=submit]').click();
                        setTimeout(() => {
                            loginWindow.document.getElementById('ap_password').value = '09361243935';
                            loginWindow.document.getElementById('signInSubmit').click();
                        }, 3000);
                    }, 3000);
                }, 3000);
            } else {
                passwordField.value = '09361243935';
                loginWindow.document.getElementById('signInSubmit').click();
            }
        }, 3000);

        setTimeout(() => {
            loginWindow.location.href = 'https://sellercentral.amazon.com/listing/upload';
            setTimeout(() => {
                const fileInput = loginWindow.document.querySelector('input[type=file]');
                const file = new File([csvContent], 'selected_products.csv', { type: 'text/csv' });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;

                loginWindow.document.querySelector('button#upload-button').click();
            }, 5000);
        }, 10000);
    };

    const generateCSV = (items) => {
        const headers = [
            'sku',
            'price',
            'minimum-seller-allowed-price',
            'maximum-seller-allowed-price',
            'quantity',
            'handling-time',
            'fulfillment-channel'
        ];
        const rows = items.map((product) => [
            product.variants && product.variants.length > 0 ? product.variants[0].sku : '',
            product.variants && product.variants.length > 0 ? product.variants[0].price : '',
            '', // Placeholder for minimum-seller-allowed-price
            '', // Placeholder for maximum-seller-allowed-price
            product.variants && product.variants.length > 0 ? product.variants[0].inventory_quantity : '',
            '', // Placeholder for handling-time
            ''  // Placeholder for fulfillment-channel
        ]);

        const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
        return csvContent;
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = () => {
        console.log('Delete selected products:', selectedProducts);
        // Implement delete logic
    };

    return (
        <div className="product-list-container">
            <h3>Fetched Products</h3>
            {products.length > 0 ? (
                <>
                    <div className="actions">
                        <button className="modern-button save" onClick={handleSave}>Save Selected</button>
                        <button className="modern-button sync" onClick={handleSync}>Sync Selected</button>
                        <button className="modern-button delete" onClick={handleDelete}>Delete Selected</button>
                    </div>

                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">Select</th>
                                <th className="sku-column">SKU</th>
                                <th className="product-name-column">Product Name</th>
                                <th className="price-column">Price</th>
                                <th className="quantity-column">Quantity</th>
                                <th className="date-column">Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td>{product.variants && product.variants.length > 0 ? product.variants[0].sku : ''}</td>
                                    <td>{product.title}</td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={product.variants && product.variants.length > 0 ? product.variants[0].price : ''}
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={product.variants && product.variants.length > 0 ? product.variants[0].inventory_quantity : ''}
                                            disabled
                                        />
                                    </td>
                                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No products fetched yet. Please fetch from Shopify.</p>
            )}
        </div>
    );
};

export default ProductList;
