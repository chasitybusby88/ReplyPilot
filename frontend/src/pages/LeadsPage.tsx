import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  status: string;
  createdAt: string;
  qualification?: {
    status: string;
    urgency: string;
    budgetRange: string;
  };
  sequenceAssignments?: Array<{
    status: string;
    currentDay: number;
    sequence: {
      name: string;
    };
  }>;
}

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/leads');
        setLeads(res.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><Clock className="h-3 w-3 mr-1" /> New</span>;
      case 'QUALIFIED':
        return <span className="flex items-center text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3 mr-1" /> Qualified</span>;
      case 'BOOKED':
        return <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><CalendarIcon className="h-3 w-3 mr-1" /> Booked</span>;
      case 'LOST':
        return <span className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full"><AlertCircle className="h-3 w-3 mr-1" /> Lost</span>;
      default:
        return <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">Manage and track all your incoming leads.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredLeads.length} leads
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sequence</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qualification</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                    <p className="text-sm text-gray-500">{lead.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(lead.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 font-medium">{lead.serviceType}</span>
                </td>
                <td className="px-6 py-4">
                  {lead.sequenceAssignments && lead.sequenceAssignments.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.sequenceAssignments[0].sequence.name}</p>
                      <p className="text-xs text-gray-500">Day {lead.sequenceAssignments[0].currentDay} • {lead.sequenceAssignments[0].status}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No active sequence</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-bold">Urgency: {lead.qualification?.urgency || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Budget: {lead.qualification?.budgetRange || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No leads found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
