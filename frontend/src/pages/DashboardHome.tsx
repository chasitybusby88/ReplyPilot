import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

interface Stats {
  totalLeads: number;
  qualifiedLeads: number;
  bookedLeads: number;
  avgResponseTime: number;
  qualificationRate: number;
  bookingRate: number;
  mrr: number;
}

interface Appointment {
  id: string;
  lead: {
    name: string;
    phone: string;
  };
  scheduledAt: string;
  status: string;
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axios.get('http://localhost:3001/api/stats/dashboard'),
          axios.get('http://localhost:3001/api/stats/leads-over-time')
        ]);
        
        setStats(statsRes.data.metrics);
        setAppointments(statsRes.data.upcomingAppointments);
        setChartData(chartRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Leads', value: stats?.totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Avg Response Time', value: `${stats?.avgResponseTime}s`, icon: Clock, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Qualification Rate', value: `${stats?.qualificationRate}%`, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Booking Rate', value: `${stats?.bookingRate}%`, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Monthly Revenue', value: `$${stats?.mrr}`, icon: DollarSign, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your leads.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.name}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Lead Volume (Last 7 Days)</h2>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              Up 8% from last week
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
          <div className="space-y-6">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} className="flex items-start space-x-4">
                  <div className="bg-gray-100 p-3 rounded-lg text-center min-w-[60px]">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {format(new Date(apt.scheduledAt), 'MMM')}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {format(new Date(apt.scheduledAt), 'dd')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{apt.lead.name}</p>
                    <p className="text-sm text-gray-500">{format(new Date(apt.scheduledAt), 'h:mm a')}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            )}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View all appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
