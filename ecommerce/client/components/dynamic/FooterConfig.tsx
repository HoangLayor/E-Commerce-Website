import React from 'react';

interface FooterConfigProps {
  config: any;
  title?: string;
}

export function FooterConfig({ config, title }: FooterConfigProps) {
  return (
    <div className="border-2 border-purple-500 p-4 my-4 rounded-lg bg-purple-50">
      <h2 className="text-xl font-bold text-purple-700">Footer Config: {title || "Untitled"}</h2>
      <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  );
}
