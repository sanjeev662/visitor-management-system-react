import React, { useState } from 'react';
import Adams from './adam/Adams';
import Zones from './zone/Zones';
import Keys from './key/Keys';
import Readers from './reader/Readers';
import GuardReaderMappings from './map-guard/GuardReaderMappings';

const Configure = () => {
    const [activeTab, setActiveTab] = useState('adam');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className='p-4'>
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                    <li className="me-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'adam' ? 'border-blue-500' : 'hover:border-gray-300'}`}
                            onClick={() => handleTabChange('adam')}
                            role="tab"
                        >
                            Adams
                        </button>
                    </li>
                    <li className="me-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'zone' ? 'border-blue-500' : 'hover:border-gray-300'}`}
                            onClick={() => handleTabChange('zone')}
                            role="tab"
                        >
                            Zones
                        </button>
                    </li>
                    <li className="me-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'key' ? 'border-blue-500' : 'hover:border-gray-300'}`}
                            onClick={() => handleTabChange('key')}
                            role="tab"
                        >
                            Keys
                        </button>
                    </li>
                    <li className="me-2" role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'reader' ? 'border-blue-500' : 'hover:border-gray-300'}`}
                            onClick={() => handleTabChange('reader')}
                            role="tab"
                        >
                            Readers
                        </button>
                    </li>
                    {/* <li role="presentation">
                        <button
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'guardreadermaps' ? 'border-blue-500' : 'hover:border-gray-300'}`}
                            onClick={() => handleTabChange('guardreadermaps')}
                            role="tab"
                        >
                            Guard-Reader Mappings
                        </button>
                    </li> */}
                </ul>
            </div>
            <div id="default-tab-content">
                {activeTab === 'adam' && <Adams />}
                {activeTab === 'zone' && <Zones />}
                {activeTab === 'key' && <Keys />}
                {activeTab === 'reader' && <Readers />}
                {activeTab === 'guardreadermaps' && <GuardReaderMappings />}
            </div>
        </div>
    );
};

export default Configure;
