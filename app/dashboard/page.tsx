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
          <div 
            key={index} 
            className="dashboard-card p-6 transition-all duration-300 hover:scale-[1.02]"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'fadeInUp 0.5s ease forwards'
            }}
          >
            <div className="medical-stat mb-2">
              <h3 className="text-base sm:text-lg font-semibold">{stat.title}</h3>
            </div>
            <div className="flex items-end justify-between mt-4">
              <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">{stat.value}</div>
              <span className={`text-sm flex items-center px-2 py-1 rounded-full ${
                stat.isPositive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              }`}>
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
      <div 
        className="dashboard-card mb-6" 
        style={{
          animation: 'fadeInUp 0.6s ease forwards',
          animationDelay: '0.3s',
          opacity: 0
        }}
      >
        <div className="p-6 border-b border-border-color flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">Istoric Comenzi Recente</h2>
          </div>
          <a 
            href="/dashboard/orders" 
            className="btn btn-secondary py-1.5 px-4 text-sm group transition-all duration-300"
          >
            <span>Vezi Toate</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full divide-y divide-border-color text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">ID Comandă</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Serviciu</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Data</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Sumă</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-text-secondary uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                {recentOrders.map((order, idx) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-primary/5 transition-colors duration-200"
                    style={{
                      animation: 'fadeIn 0.5s ease forwards',
                      animationDelay: `${0.4 + idx * 0.1}s`,
                      opacity: 0
                    }}
                  >
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">{order.id}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{order.service}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-text-secondary">{order.date}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-primary">{order.amount}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`status-badge status-badge-${order.status} text-[10px] sm:text-xs`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <a 
                        href={`/dashboard/orders/${order.id}`} 
                        className="inline-flex items-center text-primary hover:text-primary-dark transition-all hover:translate-x-0.5 transform duration-200"
                      >
                        <span>Vizualizare</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Services Expiring Soon */}
        <div 
          className="dashboard-card"
          style={{
            animation: 'fadeInUp 0.6s ease forwards',
            animationDelay: '0.5s',
            opacity: 0
          }}
        >
          <div className="p-6 border-b border-border-color">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">Servicii care Expiră Curând</h2>
            </div>
          </div>
          <div className="p-6">
            {expiringServices.length > 0 ? (
              <div className="space-y-4">
                {expiringServices.map((service, idx) => (
                  <div 
                    key={service.id} 
                    className="p-4 border border-glass-border bg-glass-bg backdrop-blur-sm rounded-lg flex justify-between items-center hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                    style={{
                      animation: 'fadeIn 0.5s ease forwards',
                      animationDelay: `${0.6 + idx * 0.1}s`,
                      opacity: 0
                    }}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-primary text-sm sm:text-base">{service.name}</h3>
                      <div className="text-text-secondary text-xs sm:text-sm mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Se reînnoiește pe {service.renewDate}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-accent text-sm sm:text-base">{service.price}/mo</div>
                      <div className={`mt-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium inline-flex items-center
                        ${service.daysLeft < 5 
                          ? 'bg-danger/10 text-danger border border-danger/20' 
                          : 'bg-warning/10 text-warning border border-warning/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.daysLeft} zile rămase
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                Nu există servicii care expiră curând.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div 
          className="dashboard-card"
          style={{
            animation: 'fadeInUp 0.6s ease forwards',
            animationDelay: '0.6s',
            opacity: 0
          }}
        >
          <div className="p-6 border-b border-border-color flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold">Metode de Plată</h2>
            </div>
            <a 
              href="/dashboard/payment-methods" 
              className="btn btn-secondary py-1.5 px-4 text-sm group transition-all duration-300"
            >
              <span>Gestionare</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </a>
          </div>
          <div className="p-6">
            {paymentMethods.map((method, idx) => (
              <div 
                key={method.id} 
                className="p-4 border border-glass-border rounded-lg flex justify-between items-center mb-4 bg-glass-bg backdrop-blur-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                style={{
                  animation: 'fadeIn 0.5s ease forwards',
                  animationDelay: `${0.7 + idx * 0.1}s`,
                  opacity: 0
                }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">•••• {method.lastFour}</h3>
                    <div className="text-text-secondary text-xs sm:text-sm flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Expiră în {method.expiry}
                    </div>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1 rounded-full font-medium">
                    Implicit
                  </span>
                )}
              </div>
            ))}
            <button className="w-full mt-2 py-3 border border-dashed border-primary/30 rounded-lg text-primary hover:text-primary-dark hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adaugă Metodă de Plată
            </button>
          </div>
        </div>
      </div>
    </>
  );
}