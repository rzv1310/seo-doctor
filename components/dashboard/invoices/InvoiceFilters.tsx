'use client';

interface InvoiceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
}

export default function InvoiceFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange
}: InvoiceFiltersProps) {
    return (
        <div className="dashboard-card mb-6">
            <div className="p-4 border-b border-border-color">
                <h2 className="text-xl font-semibold">Filtre</h2>
            </div>
            <div className="p-4 flex flex-col md:flex-row md:items-end gap-4">
                <div className="md:flex-1">
                    <label htmlFor="search-input" className="block text-sm text-text-primary mb-1">
                        Căutare
                    </label>
                    <div className="relative">
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Caută facturi..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 absolute right-3 top-3 text-text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="max-w-[300px]">
                    <label htmlFor="status-filter" className="block text-sm text-text-primary mb-1">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
                    >
                        <option value="all">Toate</option>
                        <option value="paid">Plătite</option>
                        <option value="pending">În așteptare</option>
                        <option value="overdue">Restante</option>
                        <option value="cancelled">Anulate</option>
                        <option value="void">Anulate (void)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
