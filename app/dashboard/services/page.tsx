'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { CartService } from '@/context/CartContext';
import { services, type Service } from '@/data/services';

export default function ServicesPage() {
    const { addItem, isInCart, removeItem, items } = useCart();

    // State for filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter services based on status and search term
    const filteredServices = services.filter(service => {
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Handle adding an item to cart
    const handleAddToCart = (service: Service) => {
        const cartService: CartService = {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            priceValue: service.priceValue,
            features: service.features,
        };
        addItem(cartService);
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Servicii</h1>
                <p className="text-text-secondary">Gestionează serviciile tale abonate</p>
            </div>

            {/* Filters and search */}
            <div className="dashboard-card mb-6">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Filtre</h2>
                </div>
                <div className="p-4 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="md:flex-1">
                        <label htmlFor="search-input" className="block text-sm text-text-secondary mb-1">Căutare</label>
                        <div className="relative">
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Caută servicii..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="max-w-[300px]">
                        <label htmlFor="status-filter" className="block text-sm text-text-secondary mb-1">Status</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                        >
                            <option value="all">Toate</option>
                            <option value="active">Active</option>
                            <option value="trial">Probă</option>
                            <option value="inactive">Inactive</option>
                            <option value="available">Disponibile</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Services Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredServices.map(service => (
                    <div key={service.id} className="dashboard-card overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border-color">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs ${service.status === 'active' ? 'bg-green-900/30 text-green-300' :
                                        service.status === 'trial' ? 'bg-amber-900/30 text-amber-300' :
                                            service.status === 'available' ? 'bg-blue-900/30 text-blue-300' :
                                                'bg-red-900/30 text-red-300'
                                    }`}>
                                    {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
                                </span>
                            </div>
                            <p className="text-text-secondary text-sm mt-2">{service.description}</p>
                        </div>

                        <div className="p-4 flex-1">
                            {service.status && service.status !== 'available' && service.usage !== undefined && (
                                <div className="mb-4">
                                    <div className="text-sm text-text-secondary mb-1">Utilizare</div>
                                    <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                                        <div
                                            className={`h-2 rounded-full ${service.usage > 80 ? 'bg-danger' : 'bg-accent'}`}
                                            style={{ width: `${service.usage}%` }}>
                                        </div>
                                    </div>
                                    <div className="text-xs text-text-secondary">{service.usage}%</div>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="text-sm text-text-secondary mb-1">Caracteristici</div>
                                <ul className="text-sm space-y-1">
                                    {service.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Special offers */}
                            {service.offers && service.offers.length > 0 && service.offers.map((offer, index) => (
                                <span key={index} className={`inline-block mb-4 text-xs ${offer.bgClass} ${offer.textClass} px-2 py-1 rounded`}>
                                    {offer.text}
                                </span>
                            ))}

                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                                <div>
                                    <div className="font-bold text-primary text-lg">{service.price}<span className="text-xs text-text-secondary">{service.period || '/mo'}</span></div>
                                    {service.renewalDate && (
                                        <div className="text-xs text-text-secondary">Reînnoiește: {service.renewalDate}</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={service.url || `/dashboard/services/${service.id}`}
                                        className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-1 rounded text-sm transition-colors"
                                    >
                                        Detalii
                                    </Link>

                                    {isInCart(service.id) ? (
                                        <button
                                            onClick={() => removeItem(service.id)}
                                            className="text-sm bg-danger/20 hover:bg-danger/30 text-danger px-3 py-1 rounded transition-colors flex items-center justify-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Elimină
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToCart(service)}
                                            className="text-sm bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded transition-colors flex items-center justify-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Adaugă în Coș
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredServices.length === 0 && (
                <div className="dashboard-card p-8 text-center">
                    <div className="text-xl font-semibold mb-2">Nu s-au găsit servicii</div>
                    <p className="text-text-secondary mb-6">Ajustează criteriile de căutare sau filtrare.</p>
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
                        Explorează Servicii Disponibile
                    </button>
                </div>
            )}

            {/* Checkout Button - Fixed at bottom right when cart has items */}
            {items.length > 0 && (
                <div className="fixed bottom-8 right-8 z-10">
                    <Link
                        href="/dashboard/checkout"
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md shadow-lg transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Finalizează Comanda
                        <span className="inline-flex items-center justify-center bg-white text-primary rounded-full w-6 h-6 text-sm font-semibold ml-1">
                            {items.length}
                        </span>
                    </Link>
                </div>
            )}
        </>
    );
}
