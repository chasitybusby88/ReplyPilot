export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: 'new' | 'contacted' | 'qualified' | 'booked';
}
