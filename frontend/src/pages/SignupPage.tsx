import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const SignupPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$300',
      description: 'Perfect for small businesses just getting started.',
      features: [
        'Up to 100 leads/mo',
        'AI Lead Qualification',
        'Basic Follow-up Sequences',
        'Email Support'
      ],
      link: 'https://buy.stripe.com/7sY00ldv5etefwL7xM0ZW08'
    },
    {
      name: 'Growth',
      price: '$800',
      description: 'Scale your business with advanced follow-up automation.',
      features: [
        'Up to 500 leads/mo',
        'Custom AI Personality',
        'Advanced Nurture Sequences',
        'Priority SMS/Email Support',
        'Client Dashboard'
      ],
      link: 'https://buy.stripe.com/4gMdRbdv5dpagAPaJY0ZW09',
      featured: true
    },
    {
      name: 'Pro',
      price: '$1,500',
      description: 'Maximum performance for high-volume service providers.',
      features: [
        'Unlimited leads',
        'Multi-channel AI Follow-up',
        'Custom CRM Integrations',
        'Dedicated Account Manager',
        'White-labeled Reporting'
      ],
      link: 'https://buy.stripe.com/3cIeVf3Uvcl63O319o0ZW0a'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose the right plan for your business
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            All plans include a one-time <span className="font-bold text-gray-900">$1,000 setup fee</span> for AI training and integration.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative bg-white border rounded-2xl shadow-sm flex flex-col ${
                plan.featured ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="p-8 flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-xl font-semibold">/mo</span>
                </p>
                <p className="mt-6 text-gray-500">{plan.description}</p>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 bg-gray-50 rounded-b-2xl">
                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-colors ${
                    plan.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            Need a custom solution? <a href="mailto:sales@replypilot.app" className="font-medium text-blue-600 hover:text-blue-500">Contact our sales team</a>
          </p>
          <div className="mt-6">
            <a 
              href="https://buy.stripe.com/9B628tbmXeteacr6tI0ZW07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Pay setup fee separately <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
