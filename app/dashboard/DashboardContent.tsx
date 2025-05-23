'use client';

import { sidebarItems, logoutButton } from './data';

interface DashboardContentProps {
    children: React.ReactNode;
}

export default function DashboardContent({ children }: DashboardContentProps) {
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <nav className="mt-5 px-2">
                    {sidebarItems.map((item) => (
                        <div key={item.id}>
                            {item.divider && <hr className="my-2" />}
                            <a
                                href={item.href}
                                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
                            >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                            </a>
                        </div>
                    ))}
                    <hr className="my-2" />
                    <button className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50">
                        {logoutButton.icon}
                        <span className="ml-3">{logoutButton.label}</span>
                    </button>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}