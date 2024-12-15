import React, { useState } from "react";
import "./IntegrationModal.css";

const IntegrationModal = ({ onClose }) => {
    const [selectedSource, setSelectedSource] = useState("");
    const [storeUrl, setStoreUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiPassword, setApiPassword] = useState("");

    const handleConnect = async () => {
        if (selectedSource === "Shopify") {
            try {
                const response = await fetch("/api/shopify-proxy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        storeUrl,
                        apiPassword,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Data fetched:", data);
                    alert("Shopify integration successful!");
                } else {
                    const error = await response.json();
                    console.error("Error fetching Shopify data:", error);
                    alert(`Failed to connect to Shopify: ${error.error}`);
                }
            } catch (err) {
                console.error("Connection error:", err);
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="integration-modal">
            <div className="modal-content">
                <h2>Add New Source</h2>
                <div className="integration-buttons">
                    <button
                        className={selectedSource === "Shopify" ? "active" : ""}
                        onClick={() => setSelectedSource("Shopify")}
                    >
                        Shopify
                    </button>
                    <button
                        className={selectedSource === "Walmart" ? "active" : ""}
                        onClick={() => setSelectedSource("Walmart")}
                    >
                        Walmart
                    </button>
                </div>

                {selectedSource === "Shopify" && (
                    <div className="shopify-form">
                        <h3>Shopify Integration</h3>
                        <input
                            type="text"
                            placeholder="example.myshopify.com"
                            value={storeUrl}
                            onChange={(e) => setStoreUrl(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Your Shopify API Password"
                            value={apiPassword}
                            onChange={(e) => setApiPassword(e.target.value)}
                        />
                        <button onClick={handleConnect}>Connect</button>
                    </div>
                )}

                {selectedSource === "Walmart" && (
                    <div className="walmart-form">
                        <h3>Walmart Integration</h3>
                        <p>Walmart integration form will go here.</p>
                    </div>
                )}

                <button className="close-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default IntegrationModal;
