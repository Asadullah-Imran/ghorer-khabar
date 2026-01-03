"use client";

import React from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Package,
  Users,
  ShieldCheck,
  Receipt,
  Bell,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  ADMIN_STATS, RECENT_ORDERS, RECENT_ACTIVITY, 
  CATEGORY_DATA, MONTHLY_ORDER_DATA 
} from '@/lib/dummy-data/admin/dashboardData';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-white">
      <AdminSidebar />

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <AdminHeader />

        {/* Content Container */}
        <div className="p-8 space-y-8">
          {/* Top Bar */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              <p className="text-text-muted text-sm mt-1">Platform health check for September 2026</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-sm"><Calendar size={16}/> Sept 1 - Sept 30</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg text-sm shadow-[0_0_15px_rgba(17,212,180,0.3)]"><Download size={16}/> Export Report</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ADMIN_STATS.map(stat => (
              <div key={stat.id} className="bg-surface-dark border border-border-dark p-5 rounded-xl">
                <div className="flex justify-between text-text-muted mb-2">
                  <span className="text-sm font-medium">{stat.label}</span>
                  <div className="text-primary"><Package size={18} /></div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${stat.trend === 'up' ? 'text-primary' : 'text-red-400'}`}>
                   {stat.trend === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-dark border border-border-dark p-6 rounded-xl min-h-[300px]">
               <h3 className="font-bold text-lg mb-1">Monthly Order Trends</h3>
               <p className="text-text-muted text-sm mb-6">Comparison with previous period</p>
               <ResponsiveContainer width="100%" height={280}>
                 <LineChart data={MONTHLY_ORDER_DATA}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#2a403d" />
                   <XAxis 
                     dataKey="month" 
                     stroke="#8b9a97" 
                     style={{ fontSize: '12px' }}
                   />
                   <YAxis 
                     stroke="#8b9a97" 
                     style={{ fontSize: '12px' }}
                   />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: '#1a2421', 
                       border: '1px solid #2a403d',
                       borderRadius: '8px'
                     }}
                   />
                   <Legend />
                   <Line 
                     type="monotone" 
                     dataKey="orders" 
                     stroke="#11d4b4" 
                     strokeWidth={3}
                     dot={{ fill: '#11d4b4', r: 4 }}
                     activeDot={{ r: 6 }}
                   />
                 </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
               <h3 className="font-bold text-lg mb-2">Revenue by Category</h3>
               <ResponsiveContainer width="100%" height={200}>
                 <PieChart>
                   <Pie
                     data={CATEGORY_DATA}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {CATEGORY_DATA.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: '#1a2421', 
                       border: '1px solid #2a403d',
                       borderRadius: '8px',
                       fontSize: '12px'
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               <div className="space-y-3 mt-4">
                 {CATEGORY_DATA.map((cat) => (
                   <CategoryRow 
                     key={cat.name}
                     label={cat.name} 
                     percent={`${cat.percentage}%`} 
                     color={`bg-[${cat.color}]`}
                     style={{ backgroundColor: cat.color }}
                   />
                 ))}
               </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface-dark border border-border-dark p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {RECENT_ACTIVITY.map(act => (
                  <div key={act.id} className="flex gap-4">
                    <div className="bg-primary/10 p-2 rounded-full h-10 w-10 flex items-center justify-center text-primary"><Users size={20}/></div>
                    <div>
                      <p className="text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-text-muted">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction label="Approve Seller" icon={<ShieldCheck />} />
                <QuickAction label="Manage Users" icon={<Users />} />
                <QuickAction label="Issue Refund" icon={<Receipt />} />
                <QuickAction label="Broadcast" icon={<Bell />} />
              </div>
              <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border-dark flex justify-between px-6">
                  <h3 className="font-bold">Latest Orders</h3>
                  <button className="text-xs font-bold text-primary">View All</button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-darker text-text-muted text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Dish</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                    {RECENT_ORDERS.slice(0, 3).map(order => (
                      <tr key={order.id} className="hover:bg-surface-darker/50">
                        <td className="px-6 py-4">{order.id}</td>
                        <td className="px-6 py-4">{order.dish}</td>
                        <td className="px-6 py-4 font-bold">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-[10px] font-bold">COMPLETED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Reusable Sub-Components ---

function CategoryRow({ label, percent, color, style }: { label: string, percent: string, color: string, style?: React.CSSProperties }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={style} />
        <span>{label}</span>
      </div>
      <span className="font-bold">{percent}</span>
    </div>
  );
}

function QuickAction({ label, icon }: { label: string, icon: any }) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 bg-surface-dark border border-border-dark rounded-xl hover:border-primary/50 transition-all group">
      <div className="bg-primary/5 p-2 rounded-full text-primary group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}