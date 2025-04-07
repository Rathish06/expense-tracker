import React from 'react';

interface CategorySuggestionsProps {
    suggestions: string[];
    onSelect: (category: string) => void;
    onCancel: () => void;
}

const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({
    suggestions,
    onSelect,
    onCancel
}) => {
    return (
        <div className="mt-4 bg-white shadow sm:rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Categories</h3>
            <div className="space-y-2">
                {suggestions.map((category, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(category)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {category}
                    </button>
                ))}
                <button
                    onClick={onCancel}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CategorySuggestions; 