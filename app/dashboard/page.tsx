'use client';

// Main dashboard page showing overview and recent orders
export default function Dashboard() {
  // Mock data for overview stats
  const stats = [
    {
      title: "Servicii Active",
      value: "2",
      change: "+0%",
      isPositive: true,
    },
    {
      title: "Cost Lunar",
      value: "$249.98",
      change: "+0%",
      isPositive: false,
    },
    {
      title: "Facturi Deschise",
      value: "1",
      change: "0%",
      isPositive: true,
    }
  ];

  // Mock data for recent orders
  const recentOrders = [
    {
      id: "ORD-123456",
      service: "GBP MAX",
      date: "Mai 12, 2025",
      amount: "$99.99",
      status: "completed",
    },
    {
      id: "ORD-123455",
      service: "Google Organic",
      date: "Mai 10, 2025",
      amount: "$149.99",
      status: "completed",
    },
    {
      id: "ORD-123454",
      service: "Social Media Management",
      date: "Mai 5, 2025",
      amount: "$199.99",
      status: "pending",
    },
    {
      id: "ORD-123453",
      service: "Content Marketing",
      date: "Apr 28, 2025",
      amount: "$249.99",
      status: "cancelled",
    }
  ];

  // Mock data for services expiring soon
  const expiringServices = [
    {
      id: 1,
      name: "GBP MAX",
      renewDate: "Mai 20, 2025",
      price: "$99.99",
      daysLeft: 6,
    },
    {
      id: 2,
      name: "Google Organic",
      renewDate: "Mai 22, 2025",
      price: "$149.99",
      daysLeft: 8,
    }
  ];

  // Mock data for payment methods
  const paymentMethods = [
    {
      id: 1,
      type: "card",
      lastFour: "4242",
      expiry: "03/27",
      isDefault: true,
    }
  ];

  return (
    <>
      {/* Dashboard Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card p-4">
            <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <span className={`text-sm flex items-center ${stat.isPositive ? 'text-accent' : 'text-danger'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={stat.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                  />
                </svg>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Istoric Comenzi Recente</h2>
          <a href="/dashboard/orders" className="text-primary hover:text-primary-dark transition-colors text-sm">
            Vezi Toate Comenzile
          </a>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.service}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${order.status === 'completed' ? 'bg-green-900/30 text-green-300' : 
                          order.status === 'pending' ? 'bg-amber-900/30 text-amber-300' : 
                          'bg-red-900/30 text-red-300'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <a href={`/dashboard/orders/${order.id}`} className="text-primary hover:text-primary-dark transition-colors">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Services Expiring Soon */}
        <div className="dashboard-card">
          <div className="p-4 border-b border-border-color">
            <h2 className="text-xl font-semibold">Services Expiring Soon</h2>
          </div>
          <div className="p-4">
            {expiringServices.length > 0 ? (
              <div className="space-y-4">
                {expiringServices.map((service) => (
                  <div key={service.id} className="p-3 border border-border-color rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-text-secondary text-sm">Renews on {service.renewDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{service.price}/mo</div>
                      <div className={`text-xs mt-1 ${service.daysLeft < 5 ? 'text-danger' : 'text-accent'}`}>
                        {service.daysLeft} days left
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                No services expiring soon.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="dashboard-card">
          <div className="p-4 border-b border-border-color flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment Methods</h2>
            <a href="/dashboard/payment-methods" className="text-primary hover:text-primary-dark transition-colors text-sm">
              Manage
            </a>
          </div>
          <div className="p-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-3 border border-border-color rounded-lg flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-dark-blue-lighter rounded-md flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">•••• {method.lastFour}</h3>
                    <p className="text-text-secondary text-sm">Expires {method.expiry}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
            <button className="w-full mt-3 py-2 border border-dashed border-border-color rounded-md text-text-secondary hover:text-primary hover:border-primary transition-colors">
              + Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </>
  );
}