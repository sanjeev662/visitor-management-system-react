import React, { useState, useEffect, useRef } from 'react';

const MultipleSelectDropdown = ({ options, selectedOptions, onChange }) => {
    const [displayedOptions, setDisplayedOptions] = useState(options);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const filterOptions = searchTerm === ''
            ? options
            : options.filter(option =>
                option.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setDisplayedOptions(filterOptions);
    }, [searchTerm, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownVisible(true);
    };

    const handleSelectionChange = (id) => {
        const newSelection = selectedOptions.includes(id)
            ? selectedOptions.filter(selectedId => selectedId !== id)
            : [...selectedOptions, id];
        onChange(newSelection);
    };

    const removeChip = (id) => {
        onChange(selectedOptions.filter(selectedId => selectedId !== id));
    };

    return (
        <div className="relative flex flex-col space-y-2" ref={dropdownRef}>
            <input
                type="text"
                placeholder="Search zones..."
                className="p-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownVisible(true)}
            />
            {isDropdownVisible && (
                <div className="w-full bg-white border border-gray-300 mt-1 max-h-[132px] overflow-auto rounded" style={{
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  WebkitOverflowScrolling: "touch"
              }}>
                    {displayedOptions.map(option => (
                        <div
                            key={option.id}
                            className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectionChange(option.id)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option.id)}
                                onChange={() => {}}
                                className="mr-2"
                                readOnly
                            />
                            <label className="flex-grow">{option.name}</label>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {selectedOptions.map(id => {
                    const zone = options.find(option => option.id === id);
                    return (
                        <div key={id} className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                            <span className="text-blue-800">{zone.name}</span>
                            <button
                                onClick={() => removeChip(id)}
                                className="text-blue-800"
                            >
                                &times;
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MultipleSelectDropdown;

