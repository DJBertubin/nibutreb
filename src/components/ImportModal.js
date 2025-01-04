import React, { useState } from 'react';
import './ImportModal.css'; // You can create custom styling here for the modal

const ImportModal = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please upload a valid CSV or Excel file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            setError('');
            setSuccessMessage('');

            const response = await fetch('/api/products/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setSuccessMessage('File uploaded and processed successfully.');
            } else {
                setError(result.error || 'Failed to import products.');
            }
        } catch (err) {
            setError('An error occurred during the upload. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="import-modal-overlay">
            <div className="import-modal-content">
                <h3>Import Products via CSV/Excel</h3>
                <p>Please upload a CSV or Excel file to import products in bulk.</p>

                <div className="file-input-wrapper">
                    <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
                </div>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <div className="button-group">
                    <button className="btn-upload" onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;