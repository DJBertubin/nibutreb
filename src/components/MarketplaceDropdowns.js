<select id="import-source" onChange={handleDropdownChange}>
    <option value="">Select Source</option>
    {storeList.map((store, index) => (
        <option key={index} value={store}>
            {store}
        </option>
    ))}
    <option value="AddNew">Add New Source</option>
</select>
