import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import CMS from './cms'

const OrgPortalLayout = () => {
  const tabs = ['Org Info', 'Labs', 'API Keys', 'JWT Debugger'];
  const [activeTab, setActiveTab] = useState('Labs');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [labs, setLabs] = useState([]);
  const [newLabName, setNewLabName] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [orgInfo, setOrgInfo] = useState({ name: '', billingEmail: '' });

  useEffect(() => {
    setIsAuthorized(true);
    setLabs([{ id: '1', name: 'Sample Lab' }]);
    setApiKeys([{ id: 'abc123', key: 'sk_live_1234', createdAt: '2025-07-01' }]);
    setOrgInfo({ name: 'Acme Org', billingEmail: 'billing@acme.org' });
  }, []);

  const createLab = () => {
    if (!newLabName.trim()) return;
    const newLab = { id: crypto.randomUUID(), name: newLabName.trim() };
    setLabs([...labs, newLab]);
    setNewLabName('');
  };

  const deleteLab = (id) => {
    setLabs(labs.filter(lab => lab.id !== id));
  };

  const updateLab = (id, newName) => {
    setLabs(labs.map(lab => lab.id === id ? { ...lab, name: newName } : lab));
  };

  const issueNewKey = () => {
    const newKey = {
      id: crypto.randomUUID(),
      key: 'sk_' + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const renderTabContent = () => {
    if (!isAuthorized) {
      return <div className="text-center text-gray-400 italic">Loading...</div>;
    }

    switch (activeTab) {
      case 'Org Info':
        return (
          <div className="space-y-4 text-gray-700">
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-lg font-semibold">Organization Name:</p>
              <p>{orgInfo.name}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-lg font-semibold">Billing Email:</p>
              <p>{orgInfo.billingEmail}</p>
            </div>
          </div>
        );

      case 'Labs':
        return (
          <div className="space-y-6">
            <CMS/>
          </div>
        );

      case 'API Keys':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Issued API Keys</h3>
              <button
                onClick={issueNewKey}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Issue New Key
              </button>
            </div>
            <ul className="space-y-3">
              {apiKeys.map((key) => (
                <li
                  key={key.id}
                  className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <code className="text-gray-800 font-mono">{key.key}</code>
                  <span className="text-sm text-gray-500">{key.createdAt}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'JWT Debugger':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Static JWT Payload</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm text-gray-700">
{`{
  "org_id": "${orgInfo.name.toLowerCase().replace(/\s+/g, '_')}",
  "user_id": "user_x",
  "exp": ${Math.floor(Date.now() / 1000) + 900}
}`}
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Organization Portal</h1>

        {/* Tabs */}
        <div className="flex space-x-2 sm:space-x-4 border-b pb-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                'px-4 py-2 text-sm font-medium rounded-full transition',
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-opacity duration-300 ease-in-out">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default OrgPortalLayout;
