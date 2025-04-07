import React from 'react';

const CategorySuggestions = ({ suggestions, onSelect, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Suggested Categories
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Please select the most appropriate category for this expense:
                </p>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(suggestion.category)}
                            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="text-sm font-medium text-gray-900">
                                {suggestion.category}
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategorySuggestions; 

const CategorySuggestions = ({ suggestions, onSelect, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Suggested Categories
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Please select the most appropriate category for this expense:
                </p>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(suggestion.category)}
                            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="text-sm font-medium text-gray-900">
                                {suggestion.category}
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategorySuggestions; 