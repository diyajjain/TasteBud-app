import React, { useState } from 'react';
import { SocialFeed } from '../../components/SocialFeed';
import { UserDiscovery } from '../../components/UserDiscovery';

type TabType = 'feed' | 'discovery';

export function SocialPage() {
    const [activeTab, setActiveTab] = useState<TabType>('feed');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Social</h1>
                <p className="text-gray-600">
                    Discover music and connect with people who share your taste buds
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'feed'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Music Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('discovery')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'discovery'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Discover People
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'feed' && (
                    <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-blue-800 font-semibold mb-2">How the feed works:</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• See song logs from users with similar music taste buds</li>
                                <li>• Higher similarity scores mean better taste matches</li>
                                <li>• Discover new music through people who like what you like</li>
                                <li>• Update your music preferences to improve recommendations</li>
                            </ul>
                        </div>
                        <SocialFeed />
                    </div>
                )}

                {activeTab === 'discovery' && (
                    <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="text-green-800 font-semibold mb-2">Find your music tribe:</h3>
                            <ul className="text-green-700 text-sm space-y-1">
                                <li>• Discover users with similar music taste buds</li>
                                <li>• See their favorite genres, artists, and recent songs</li>
                                <li>• Connect with people who share your musical taste</li>
                                <li>• Build your music community</li>
                            </ul>
                        </div>
                        <UserDiscovery />
                    </div>
                )}
            </div>
        </div>
    );
} 