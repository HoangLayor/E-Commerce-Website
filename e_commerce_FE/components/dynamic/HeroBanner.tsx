import React from 'react';

interface HeroBannerProps {
  config: any;
  title?: string;
}

export function HeroBanner({ config, title }: HeroBannerProps) {
  return (
    <div className="border-2 border-blue-500 p-4 my-4 rounded-lg bg-blue-50">
      <h2 className="text-xl font-bold text-blue-700">Hero Banner: {title || "Untitled"}</h2>
      <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}
