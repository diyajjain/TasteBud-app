import React, { useState } from 'react';
import { SongComparison } from '../../components/SongComparison';
import { SongRankings } from '../../components/SongRankings';

type TabType = 'compare' | 'rankings';

export function RatingPage() {
    const [activeTab, setActiveTab] = useState<TabType>('compare');
    const [refreshRankings, setRefreshRankings] = useState(0);

    const handleRatingComplete = () => {
        // Trigger rankings refresh when a rating is completed
        setRefreshRankings(prev => prev + 1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Your Songs</h1>
                <p className="text-gray-600">
                    Compare your songs and build your personal ranking using the ELO system
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('compare')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'compare'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Compare Songs
                    </button>
                    <button
                        onClick={() => setActiveTab('rankings')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'rankings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Your Rankings
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'compare' && (
                    <div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-blue-800 font-semibold mb-2">How it works:</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• You'll see two songs side by side</li>
                                <li>• Click on your preferred song to select it</li>
                                <li>• Submit your choice to update the ELO ratings</li>
                                <li>• The more you compare, the more accurate your rankings become</li>
                            </ul>
                        </div>
                        <SongComparison onRatingComplete={handleRatingComplete} />
                    </div>
                )}

                {activeTab === 'rankings' && (
                    <SongRankings key={refreshRankings} />
                )}
            </div>
        </div>
    );
} 