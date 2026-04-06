import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Calendar, FileText, Edit2, Zap, Eye, Printer, X } from 'lucide-react'; 

// --- Mock Data ---
const initialReceipts = [
  { id: 1, receptionNo: 4220, date: '2025-11-02', patientName: 'Tanisha Goyal', fatherName: 'Vicky Goyal', amount: 8000.00 },
  { id: 2, receptionNo: 4219, date: '2025-11-02', patientName: 'Waris Singh', fatherName: 'Gurpreet Singh', amount: 1500.00 },
  { id: 3, receptionNo: 4218, date: '2025-11-02', patientName: 'Savreen Kaur', fatherName: 'Kulwinder Singh', amount: 500.00 },
  { id: 4, receptionNo: 4217, date: '2025-11-02', patientName: 'Sulkhjeet Singh', fatherName: 'Jatinder Singh', amount: 2000.00 },
  { id: 5, receptionNo: 4216, date: '2025-11-01', patientName: 'Rupesh Kumar', fatherName: 'Ramesh Mahto', amount: 1000.00 },
  { id: 6, receptionNo: 4215, date: '2025-11-01', patientName: 'Gurleen Kaur', fatherName: 'Kala Singh', amount: 500.00 },
  { id: 7, receptionNo: 4214, date: '2025-11-01', patientName: 'Adhya Karena', fatherName: 'Vijay Bhai', amount: 15000.00 },
  { id: 8, receptionNo: 4213, date: '2025-11-01', patientName: 'B/o Lovepreet Kaur', fatherName: 'Prince', amount: 1000.00 },
];

// --- Reusable Button Component (Icon Only) ---
const ActionButton = ({ label, style, icon: Icon, onClick }) => {
  let classes = "flex items-center justify-center w-8 h-8 p-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 ease-in-out whitespace-nowrap hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Compact size for icon only
  const iconSize = 16; 

  if (style === 'solid-success') {
    classes += " bg-green-600 text-white hover:bg-green-700 focus:ring-green-500";
  } else if (style === 'outline-primary') {
    classes += " text-blue-600 border border-blue-300 bg-white hover:bg-blue-50 focus:ring-blue-500";
  } else if (style === 'outline-danger') {
    classes += " text-red-600 border border-red-300 bg-white hover:bg-red-50 focus:ring-red-500";
  } else {
     classes += " bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
  }


  return (
    <button
      className={classes}
      onClick={onClick}
      // Use the label as the title for accessibility
      title={label} 
    >
      {Icon && <Icon size={iconSize} />}
    </button>
  );
};

// --- Status Message Component (for alerts/confirmations) ---
const StatusMessage = ({ message, type, onClose }) => {
  const colorMap = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  if (!message) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border-l-4 rounded-lg shadow-xl ${colorMap[type]}`} role="alert">
      <div className="flex items-center">
        <Zap size={18} className="mr-2" />
        <p className="font-bold mr-4">{message}</p>
        <button onClick={onClose} className="text-xl font-bold ml-auto leading-none hover:text-gray-900">
            <X size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Filters Component (EXTRACTED AND MEMOIZED FOR FOCUS FIX) ---
const Filters = React.memo(({ fromDate, setFromDate, toDate, setToDate, searchQuery, setSearchQuery, showStatus }) => (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Responsive Grid Layout: Stacks on mobile, 3 columns on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
        {/* From Date Filter */}
        <div>
          <label className="text-sm font-medium text-gray-500 flex items-center mb-1"><Calendar size={14} className="mr-1" /> From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>

        {/* To Date Filter */}
        <div>
          <label className="text-sm font-medium text-gray-500 flex items-center mb-1"><Calendar size={14} className="mr-1" /> To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          />
        </div>

        {/* Action Button (e.g., Add Receipt) */}
        <div className="flex justify-end md:justify-start">
             <ActionButton
                label="Add New Receipt"
                icon={FileText}
                style="outline-primary"
                // Using the full label here because this is not in the table
                className="py-2 px-4 text-sm w-auto" 
                onClick={() => showStatus("Opening 'Add New Receipt' form...", 'info')}
              >
                <FileText size={18} className="mr-2" />
                Add New Receipt
             </ActionButton>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, reception number, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner transition duration-150"
        />
        {/* Clear Search Button */}
        {searchQuery && (
            <button
              className="absolute right-2 p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-150"
              onClick={() => setSearchQuery('')}
              title="Clear Search"
            >
              <X size={16} />
            </button>
        )}
      </div>
    </div>
));

// --- Main App Component ---
export default function App() {
  const [data] = useState(initialReceipts);
  const [fromDate, setFromDate] = useState('2025-11-01');
  const [toDate, setToDate] = useState('2025-11-08');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'info' });

  // Function to show a temporary status message
  const showStatus = useCallback((message, type = 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: 'info' }), 3000);
  }, []);

  // Handler for action buttons
  const handleAction = useCallback((action, id) => {
    showStatus(`Action "${action}" triggered for Receipt #${id}.`, 'success');
  }, [showStatus]);

  // Filtered and searched data logic
  const filteredData = useMemo(() => {
    return data
      .filter(receipt => {
        // Date range filter
        const receiptDate = new Date(receipt.date);
        const start = new Date(fromDate);
        const end = new Date(toDate);
        // Normalize date comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999); 
        
        if (receiptDate < start || receiptDate > end) return false;

        // Search filter (by Patient Name, Father Name, Reception No., or unique ID)
        const searchLower = searchQuery.toLowerCase();
        return (
          receipt.patientName.toLowerCase().includes(searchLower) ||
          receipt.fatherName.toLowerCase().includes(searchLower) ||
          String(receipt.receptionNo).includes(searchLower) ||
          String(receipt.id).includes(searchLower) 
        );
      })
      // Simple in-memory sorting by reception number descending (newest first)
      .sort((a, b) => b.receptionNo - a.receptionNo);
  }, [data, fromDate, toDate, searchQuery]);


  // --- UI Structure Components ---

  const ReceiptTable = () => {
    const headers = ['Reception No.', 'Date', 'Patient Name', 'Father Name', 'Amount', 'Actions'];

    return (
      // Enclose table in a container with horizontal overflow management
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header: Hidden on small screens */}
          <thead className="hidden sm:table-header-group bg-gray-50 sticky top-0">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200 sm:table-row-group">
            {filteredData.length > 0 ? (
              filteredData.map((receipt, index) => (
                <tr 
                  key={receipt.id} 
                  // RESPONSIVENESS: display 'block' on mobile, 'table-row' on sm (tablet/desktop)
                  className={`
                    block sm:table-row transition duration-150 ease-in-out 
                    ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                    p-4 sm:p-0 mb-4 sm:mb-0 border border-gray-200 sm:border-none rounded-lg
                  `}
                >
                  
                  {/* Reception No. */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm font-medium text-gray-900 block sm:table-cell">
                    {/* RESPONSIVENESS: Show label on mobile card, hide on desktop table */}
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider">Reception No.:</span>
                    {receipt.receptionNo}
                  </td>
                  
                  {/* Date */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm text-gray-500 block sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider">Date:</span>
                    {receipt.date}
                  </td>
                  
                  {/* Patient Name */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm font-semibold text-gray-700 block sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider">Patient Name:</span>
                    {receipt.patientName}
                  </td>
                  
                  {/* Father Name (RESPONSIVENESS: Now visible from the 'sm' (tablet) breakpoint) */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider">Father Name:</span>
                    {receipt.fatherName}
                  </td>
                  
                  {/* Amount */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-sm font-bold text-green-700 block sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider">Amount:</span>
                    {/* Formatting amount with Indian Rupee symbol */}
                    <span className="font-mono">₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-2 sm:px-6 sm:py-4 sm:whitespace-nowrap text-right text-sm font-medium block sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-500 mr-2 block text-xs uppercase tracking-wider mb-2">Actions:</span>
                    {/* RESPONSIVENESS: Added flex-wrap and gap-2 for mobile buttons */}
                    <div className="flex flex-wrap justify-start gap-2 sm:justify-start sm:space-x-2 mt-2 sm:mt-0">
                      <ActionButton
                        label="View Bill"
                        style="outline-primary"
                        icon={Eye}
                        onClick={() => handleAction('View Bill', receipt.receptionNo)}
                      />
                      <ActionButton
                        label="Print Receipt"
                        style="solid-success"
                        icon={Printer}
                        onClick={() => handleAction('Print Receipt', receipt.receptionNo)}
                      />
                      <ActionButton
                        label="Edit Receipt"
                        style="outline-danger"
                        icon={Edit2}
                        onClick={() => handleAction('Edit', receipt.receptionNo)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-lg text-gray-500 block sm:table-cell">
                  No receipts found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>

      <StatusMessage message={status.message} type={status.type} onClose={() => setStatus({ message: '', type: 'info' })} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mt-4 mb-8 border-b-4 border-blue-500 pb-3">
          Receipts Dashboard
        </h1>

        <Filters 
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showStatus={showStatus}
        />
        <ReceiptTable />

        <p className="mt-6 text-sm text-gray-500 text-center">
          Showing <span className="font-bold text-gray-700">{filteredData.length}</span> of {data.length} total records.
        </p>
      </div>
    </div>
  );
}