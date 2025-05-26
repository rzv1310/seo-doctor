'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';



type ServiceDetail = {
    id: number;
    name: string;
    description: string;
    price: string;
    status: string;
    renewalDate: string;
    createdDate: string;
    usage: number;
    features: string[];
    limitations?: string[];
    usageDetails: {
        current: string;
        limit: string;
        unit: string;
        percentage: number;
    }[];
    billingHistory: {
        date: string;
        amount: string;
        status: string;
        invoiceId: string;
    }[];
};

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = parseInt(params.id as string);
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState<ServiceDetail | null>(null);

    useEffect(() => {
        // Simulating API fetch for service details
        setLoading(true);
        // In a real app, we would fetch this from the database
        setTimeout(() => {
            if (serviceId === 1) {
                setService({
                    id: 1,
                    name: "Premium Hosting",
                    description: "High-performance web hosting with 99.9% uptime guarantee",
                    price: "$12.99",
                    status: "active",
                    renewalDate: "May 20, 2025",
                    createdDate: "May 20, 2024",
                    usage: 73,
                    features: [
                        "10GB Storage",
                        "Unlimited Bandwidth",
                        "5 Databases",
                        "SSL Certificate",
                        "24/7 Support",
                        "Daily Backups",
                        "Free Domain"
                    ],
                    usageDetails: [
                        {
                            current: "7.3",
                            limit: "10",
                            unit: "GB",
                            percentage: 73
                        },
                        {
                            current: "3",
                            limit: "5",
                            unit: "Databases",
                            percentage: 60
                        },
                        {
                            current: "1",
                            limit: "1",
                            unit: "Domains",
                            percentage: 100
                        }
                    ],
                    billingHistory: [
                        {
                            date: "May 20, 2024",
                            amount: "$12.99",
                            status: "paid",
                            invoiceId: "INV-785430"
                        },
                        {
                            date: "Apr 20, 2024",
                            amount: "$12.99",
                            status: "paid",
                            invoiceId: "INV-785429"
                        },
                        {
                            date: "Mar 20, 2024",
                            amount: "$12.99",
                            status: "paid",
                            invoiceId: "INV-785428"
                        }
                    ]
                });
            } else if (serviceId === 2) {
                setService({
                    id: 2,
                    name: "AI Assistant Pro",
                    description: "Advanced AI assistant with unlimited queries and custom training",
                    price: "$29.99",
                    status: "active",
                    renewalDate: "July 2, 2025",
                    createdDate: "July 2, 2024",
                    usage: 45,
                    features: [
                        "Unlimited Queries",
                        "Custom Training",
                        "API Access",
                        "Priority Support",
                        "Analytics Dashboard"
                    ],
                    usageDetails: [
                        {
                            current: "4,563",
                            limit: "10,000",
                            unit: "API Calls",
                            percentage: 45
                        },
                        {
                            current: "2",
                            limit: "5",
                            unit: "Custom Models",
                            percentage: 40
                        }
                    ],
                    billingHistory: [
                        {
                            date: "July 2, 2024",
                            amount: "$29.99",
                            status: "paid",
                            invoiceId: "INV-785419"
                        },
                        {
                            date: "June 2, 2024",
                            amount: "$29.99",
                            status: "paid",
                            invoiceId: "INV-785418"
                        }
                    ]
                });
            } else if (serviceId === 3) {
                setService({
                    id: 3,
                    name: "Data Analytics",
                    description: "Comprehensive data analytics platform with real-time insights",
                    price: "$39.99",
                    status: "trial",
                    renewalDate: "May 22, 2025",
                    createdDate: "May 8, 2025",
                    usage: 12,
                    features: [
                        "5 Projects",
                        "1M Data Points",
                        "Custom Dashboards",
                        "Export Options",
                        "Email Reports"
                    ],
                    limitations: [
                        "Limited to 5 projects during trial",
                        "No historical data beyond 30 days",
                        "Export limited to CSV format"
                    ],
                    usageDetails: [
                        {
                            current: "1",
                            limit: "5",
                            unit: "Projects",
                            percentage: 20
                        },
                        {
                            current: "120,000",
                            limit: "1,000,000",
                            unit: "Data Points",
                            percentage: 12
                        }
                    ],
                    billingHistory: [
                        {
                            date: "May 8, 2025",
                            amount: "$0.00",
                            status: "trial",
                            invoiceId: "N/A"
                        }
                    ]
                });
            } else {
                // Use a generic service if ID doesn't match our hardcoded examples
                setService({
                    id: serviceId,
                    name: "Unknown Service",
                    description: "Service details not found",
                    price: "$0.00",
                    status: "unknown",
                    renewalDate: "Unknown",
                    createdDate: "Unknown",
                    usage: 0,
                    features: [],
                    usageDetails: [],
                    billingHistory: []
                });
            }
            setLoading(false);
        }, 500);
    }, [serviceId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-900/30 text-green-300';
            case 'trial':
                return 'bg-amber-900/30 text-amber-300';
            case 'inactive':
            case 'cancelled':
                return 'bg-red-900/30 text-red-300';
            default:
                return 'bg-gray-900/30 text-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
                <p className="text-text-secondary mb-4">We couldn't find the service you're looking for.</p>
                <Link
                    href="/dashboard/services"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
                >
                    Back to Services
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
                    <p className="text-text-secondary">{service.description}</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Link
                        href="/dashboard/services"
                        className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
                    >
                        Back to Services
                    </Link>
                    {service.status === 'active' && (
                        <button className="bg-danger/20 hover:bg-danger/30 text-danger px-4 py-2 rounded-md transition-colors text-sm">
                            Cancel Service
                        </button>
                    )}
                    {service.status === 'trial' && (
                        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm">
                            Upgrade to Paid
                        </button>
                    )}
                    {service.status === 'inactive' && (
                        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm">
                            Reactivate
                        </button>
                    )}
                </div>
            </div>

            {/* Service Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="dashboard-card p-4">
                    <h3 className="text-lg font-semibold mb-3">Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                </div>
                <div className="dashboard-card p-4">
                    <h3 className="text-lg font-semibold mb-3">Price</h3>
                    <div className="text-2xl font-bold text-primary">{service.price}<span className="text-sm text-text-secondary">/mo</span></div>
                </div>
                <div className="dashboard-card p-4">
                    <h3 className="text-lg font-semibold mb-3">Next Renewal</h3>
                    <div className="font-medium">{service.renewalDate}</div>
                </div>
                <div className="dashboard-card p-4">
                    <h3 className="text-lg font-semibold mb-3">Member Since</h3>
                    <div className="font-medium">{service.createdDate}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Usage Details */}
                <div className="dashboard-card">
                    <div className="p-4 border-b border-border-color">
                        <h2 className="text-xl font-semibold">Usage</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {service.usageDetails.map((detail, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-1">
                                    <span>{detail.unit}</span>
                                    <span className="text-text-secondary">
                                        {detail.current} / {detail.limit} {detail.unit}
                                    </span>
                                </div>
                                <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                                    <div
                                        className={`h-2 rounded-full ${detail.percentage > 80 ? 'bg-danger' : 'bg-accent'}`}
                                        style={{ width: `${detail.percentage}%` }}>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {service.usageDetails.length === 0 && (
                            <div className="text-center py-4 text-text-secondary">
                                No usage data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Features */}
                <div className="dashboard-card">
                    <div className="p-4 border-b border-border-color">
                        <h2 className="text-xl font-semibold">Features</h2>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {service.limitations && (
                            <>
                                <div className="mt-6 mb-2 font-semibold">Limitations</div>
                                <ul className="space-y-2">
                                    {service.limitations.map((limitation, index) => (
                                        <li key={index} className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            {limitation}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className="dashboard-card mb-6">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Billing History</h2>
                </div>
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-color">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {service.billingHistory.map((billing, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{billing.date}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{billing.amount}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${billing.status === 'paid' ? 'bg-green-900/30 text-green-300' :
                                                    billing.status === 'pending' ? 'bg-amber-900/30 text-amber-300' :
                                                        billing.status === 'trial' ? 'bg-blue-900/30 text-blue-300' :
                                                            'bg-red-900/30 text-red-300'
                                                }`}>
                                                {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {billing.invoiceId !== 'N/A' ? (
                                                <Link href={`/dashboard/invoices/${billing.invoiceId}`} className="text-primary hover:text-primary-dark transition-colors">
                                                    {billing.invoiceId}
                                                </Link>
                                            ) : (
                                                <span className="text-text-secondary">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {service.billingHistory.length === 0 && (
                        <div className="text-center py-8 text-text-secondary">
                            No billing history available.
                        </div>
                    )}
                </div>
            </div>

            {/* Service Support */}
            <div className="dashboard-card">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Support</h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-border-color rounded-lg">
                            <h3 className="font-semibold mb-2">Need help with your service?</h3>
                            <p className="text-text-secondary text-sm mb-4">Our support team is available 24/7 to assist you with any questions.</p>
                            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm w-full">
                                Contact Support
                            </button>
                        </div>

                        <div className="p-4 border border-border-color rounded-lg">
                            <h3 className="font-semibold mb-2">Documentation</h3>
                            <p className="text-text-secondary text-sm mb-4">Access our comprehensive documentation to learn more about using this service.</p>
                            <button className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm w-full">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
