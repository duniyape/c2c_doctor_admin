import React, { useState } from 'react';
import CalendarWithTimeSlots from '../../components/AvailableSlot';
import DateSetting from '../../components/DateSetting';
import Payment from '../../components/PaymentSetting';
import Slots from '../../components/SlotSetting';
import Addproduct from '../newupdate/Addproduct';

// Utility for fade-in animation
const FadeInWrapper = ({ children }) => (
  <div className="animate-fadeIn transition-opacity duration-300">
    {children}
  </div>
);

// Define Icons using inline SVG for a single-file React component
// Icons remain the same but will switch colors based on the active tab's background
const SettingsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2H4.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2H2a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2H.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2H4.44a2 2 0 0 0 2 2v.44a2 2 0 0 1 2 2H10a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2H22a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2H23.56a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2H14a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const LockIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ZapIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const BellIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Define the tabs structure with icons
const tabs = [
  { id: 'general', title: 'General', icon: SettingsIcon, component:()=>(<FadeInWrapper><CalendarWithTimeSlots/></FadeInWrapper>)},
  { id: 'security', title: 'Holidays', icon: LockIcon, component:()=>(<FadeInWrapper><DateSetting/></FadeInWrapper>)  },
  { id: 'integrations', title: 'Appointment Fees', icon: ZapIcon, component:()=>(<FadeInWrapper><Payment/></FadeInWrapper>)  },
  { id: 'notifications', title: 'Slots', icon: BellIcon, component:()=>(<FadeInWrapper><Slots/></FadeInWrapper>)  },
  { id: 'ratelist', title: 'Charges', icon: BellIcon, component:()=>(<FadeInWrapper><Addproduct/></FadeInWrapper>)  },
];

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Function to render the content based on the active tab ID
  const renderContent = () => {
    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
    return ActiveComponent ? <ActiveComponent /> : null;
  };

  return (
    // Updated outer container for routing: removed screen sizing, background, and centering.
    // Component now takes full width of its parent and applies padding for layout.
    <div className="w-full h-full p-1 font-sans">
      <style>{`
        /* Custom Tailwind-like styles for the toggle switch */
        .toggle-primary:checked {
          background-color: #059669; /* emerald-600 */
        }
        .toggle-warning:checked {
          background-color: #fbbf24; /* amber-400 (unchanged) */
        }
        .toggle {
          appearance: none;
          width: 3.5rem;
          height: 1.75rem;
          border-radius: 9999px;
          position: relative;
          cursor: pointer;
          background-color: #d1d5db; /* gray-300 */
          transition: background-color 0.2s;
        }
        .toggle:checked::after {
          transform: translateX(1.75rem);
        }
        .toggle::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          transition: transform 0.2s;
        }
        /* Fade in animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
      
      {/* Main Card Container - Now uses w-full to fit parent route area */}
      <div className="w-full bg-white  shadow-xl overflow-hidden ring-1 ring-gray-200">
        {/* Tab Navigation (Pill/Badge Style) */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <nav className="flex flex-wrap gap-3 sm:space-x-4" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.icon;
              
              const tabClasses = isActive
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 transform scale-105'
                : 'text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'; 
              
              const iconColor = isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-700';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${tabClasses} 
                    group 
                    flex items-center space-x-2
                    whitespace-nowrap 
                    py-2 px-4
                    text-sm 
                    font-medium
                    rounded-lg 
                    transition-all
                    duration-200
                    ease-in-out
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-offset-2
                    focus:ring-emerald-500
                  `}
                >
                  <IconComponent className={iconColor} />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conditional Content Rendering */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}