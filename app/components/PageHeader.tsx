import React from "react";


interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <header className="w-full shadow bg-white py-10 mb-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <span className="p-3 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
              {icon}
            </span>
          </div>
        )}
        {/* title */}
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h1>
        {/* subtitle */}
        {subtitle && (
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
};
