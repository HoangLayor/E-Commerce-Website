import React from 'react';

interface ProductGridProps {
  config: any;
  title?: string;
}

export function ProductGrid({ config, title }: ProductGridProps) {
  return (
    <div className="border-2 border-green-500 p-4 my-4 rounded-lg bg-green-50">
      <h2 className="text-xl font-bold text-green-700">Product Grid: {title || "Untitled"}</h2>
      <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}
