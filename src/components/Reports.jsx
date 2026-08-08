import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  RefreshCw,
  Download,
  Search,
  AlertCircle,
  FileText,
  ChevronDown,
  User,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Clock,
  X
} from "lucide-react";

const API_BASE_URL = "https://api.care2connect.in";

// Native Cookie Helper (Replaces js-cookie)
const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return "";
};

const formatDateISO = (d) => {
  const date = d ? new Date(d) : new Date();
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatTimestampDisplay = (timestamp) => {
  if (!timestamp) return "-";
  let date;
  const num = Number(timestamp);
  if (!isNaN(num) && num > 0) {
    date = new Date(num < 10000000000 ? num * 1000 : num);
  } else {
    date = new Date(timestamp);
  }
  if (isNaN(date.getTime())) return "-";

  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${datePart}, ${timePart}`;
};

const addDaysISO = (dateStr, days) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
};

// Native CSV File Exporter (Opens natively in Excel)
const exportToCSV = (filename, rows) => {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header] === null || row[header] === undefined ? "" : String(row[header]);
          val = val.replace(/"/g, '""');
          if (val.includes(",") || val.includes("\n") || val.includes('"')) {
            val = `"${val}"`;
          }
          return val;
        })
        .join(",")
    )
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const LedgerView = () => {
  // Doctor ID from cookies or fallback
  const doctorId = getCookie("user") || "";

  // Date States
  const [fromDate, setFromDate] = useState(formatDateISO(new Date()));
  const [toDate, setToDate] = useState(formatDateISO(new Date()));

  // Selected Report Option
  const [selectedOption, setSelectedOption] = useState("Receivable");

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState("");

  const [appointmentData, setAppointmentData] = useState({
    success: true,
    opening_balance: 0,
    period_amount: 0,
    closing_balance: 0,
    transaction_count: 0,
    transactions: []
  });

  const [receivableData, setReceivableData] = useState({
    opening_balance: 0,
    period_credit: 0,
    period_debit: 0,
    closing_balance: 0,
    transaction_count: 0,
    transactions: []
  });

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Report Dropdown Options
  const options = [
    { value: "Receipt", label: "OPD Report" },
    { value: "Ledger", label: "Ledger" },
    { value: "Receivable", label: "Receivable Statement" },
    // { value: "DayBook", label: "Day Book" }
  ];

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const resetAppointmentData = () => {
    setAppointmentData({
      success: true,
      opening_balance: 0,
      period_amount: 0,
      closing_balance: 0,
      transaction_count: 0,
      transactions: []
    });
  };

  const resetReceivableData = () => {
    setReceivableData({
      opening_balance: 0,
      period_credit: 0,
      period_debit: 0,
      closing_balance: 0,
      transaction_count: 0,
      transactions: []
    });
  };

  const validateDates = () => {
    if (!fromDate || !toDate) {
      setError("Please select both From Date and To Date.");
      return false;
    }
    if (fromDate > toDate) {
      setError("From Date cannot be greater than To Date.");
      return false;
    }
    return true;
  };

  const fetchAppointmentLedger = async () => {
    if (!doctorId) {
      // Demo Fallback Data
      setAppointmentData({
        success: true,
        opening_balance: 13750,
        period_amount: 1750,
        closing_balance: 15500,
        transaction_count: 3,
        transactions: [
          {
            _id: "1",
            date_of_appointment: formatDateISO(new Date()),
            timestamp: Math.floor(Date.now() / 1000),
            patient_name: "Rahul Sharma",
            whatsapp_number: "+91 98765 43210",
            pay_id: "PAY-882910",
            amount: 500
          },
          {
            _id: "2",
            date_of_appointment: addDaysISO(formatDateISO(new Date()), -1),
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            patient_name: "Priya Patel",
            whatsapp_number: "+91 98123 45678",
            pay_id: "Cash",
            amount: 750
          },
          {
            _id: "3",
            date_of_appointment: addDaysISO(formatDateISO(new Date()), -2),
            timestamp: Math.floor(Date.now() / 1000) - 172800,
            patient_name: "Amit Kumar",
            whatsapp_number: "+91 99887 76655",
            pay_id: "PAY-112233",
            amount: 500
          }
        ]
      });
      return;
    }

    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        doctor_id: doctorId
      });
      const url = `${API_BASE_URL}/get_appointments_x?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();

      if (response.status === 404) {
        resetAppointmentData();
        return;
      }
      if (!response.ok) {
        throw new Error(result?.error || "Unable to load appointments.");
      }

      setAppointmentData({
        success: result?.success ?? true,
        opening_balance: Number(result?.opening_balance || 0),
        period_amount: Number(result?.period_amount || 0),
        closing_balance: Number(result?.closing_balance || 0),
        transaction_count: Number(result?.transaction_count || 0),
        transactions: Array.isArray(result?.transactions) ? result.transactions : []
      });
    } catch (err) {
      console.warn("API Error, using fallback:", err);
      resetAppointmentData();
    }
  };

  const fetchDoctorReceivable = async () => {
    if (!doctorId) {
      setReceivableData({
        opening_balance: 5000,
        period_credit: 2500,
        period_debit: 1000,
        closing_balance: 6500,
        transaction_count: 2,
        transactions: [
          {
            _id: "rec1",
            date: formatDateISO(new Date()),
            Payment_id: "Cash",
            debit: 0,
            credit: 1500
          },
          {
            _id: "rec2",
            date: addDaysISO(formatDateISO(new Date()), -1),
            Payment_id: "ONLINE-4411",
            debit: 1000,
            credit: 1000
          }
        ]
      });
      return;
    }

    try {
      const apiToDate =
        selectedOption === "DayBook"
          ? addDaysISO(fromDate, 1)
          : addDaysISO(toDate, 1);

      const url = `${API_BASE_URL}/v1/doctor/${doctorId}?from=${fromDate}&to=${apiToDate}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();

      if (response.status === 404) {
        resetReceivableData();
        return;
      }
      if (!response.ok) {
        throw new Error(result?.error || `Doctor API Error ${response.status}`);
      }

      setReceivableData({
        opening_balance: Number(result?.opening_balance || 0),
        period_credit: Number(result?.period_credit || 0),
        period_debit: Number(result?.period_debit || 0),
        closing_balance: Number(result?.closing_balance || 0),
        transaction_count: Number(result?.transaction_count || 0),
        transactions: Array.isArray(result?.transactions) ? result.transactions : []
      });
    } catch (err) {
      console.warn("Receivable API Error, using fallback:", err);
      resetReceivableData();
    }
  };

  const fetchAllData = async () => {
    if (selectedOption === "DayBook") {
      if (!fromDate) {
        setError("Please select Day Book date.");
        return;
      }
    } else {
      if (!validateDates()) {
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      if (selectedOption === "DayBook") {
        await fetchDoctorReceivable();
      } else {
        await Promise.all([fetchAppointmentLedger(), fetchDoctorReceivable()]);
      }
    } catch (err) {
      console.error("Ledger API Error:", err);
      setError(err?.message || "Unable to load ledger data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fromDate) return;
    if (selectedOption === "DayBook") {
      fetchAllData();
      return;
    }
    if (!toDate) return;
    if (fromDate > toDate) return;

    fetchAllData();
  }, [fromDate, toDate, selectedOption]);

  const appointmentTransactions = useMemo(() => {
    return Array.isArray(appointmentData.transactions) ? appointmentData.transactions : [];
  }, [appointmentData.transactions]);

  const filteredAppointmentTransactions = useMemo(() => {
    if (!searchTerm.trim()) return appointmentTransactions;
    const term = searchTerm.toLowerCase();
    return appointmentTransactions.filter(
      (item) =>
        (item?.patient_name && item.patient_name.toLowerCase().includes(term)) ||
        (item?.whatsapp_number && item.whatsapp_number.toLowerCase().includes(term)) ||
        (item?.pay_id && item.pay_id.toLowerCase().includes(term))
    );
  }, [appointmentTransactions, searchTerm]);

  const getAppointmentBalance = (tx, index, list) => {
    if (tx?.running_balance !== undefined && tx?.running_balance !== null) {
      return Number(tx.running_balance);
    }
    let balance = Number(appointmentData.opening_balance || 0);
    for (let i = 0; i <= index; i++) {
      balance += Number(list[i]?.amount || 0);
    }
    return balance;
  };

  const getReceivableBalance = (tx, index) => {
    if (tx?.runningBalance !== undefined && tx?.runningBalance !== null) {
      return Number(tx.runningBalance);
    }
    let balance = Number(receivableData.opening_balance || 0);
    for (let i = 0; i <= index; i++) {
      const item = receivableData.transactions?.[i];
      const debit = Number(item?.debit || 0);
      const credit = Number(item?.credit || 0);
      balance = balance + debit - credit;
    }
    return balance * -1;
  };

  const downloadExcel = () => {
    let data = [];

    if (selectedOption === "Receivable" || selectedOption === "DayBook") {
      data.push({
        Date: fromDate,
        Narration: "Opening Balance",
        Debit: "",
        Credit: "",
        Balance: Number(receivableData.opening_balance*-1 || 0).toFixed(2)
      });

      receivableData.transactions.forEach((tx, index) => {
        const balance = getReceivableBalance(tx, index);
        data.push({
          Date: tx?.date || tx?.createdAt || "",
          Narration: tx?.Payment_id === "Cash" ? "Current OPD" : "Advance OPD",
          Debit: Number(tx?.debit || 0),
          Credit: Number(tx?.credit || 0),
          Balance: balance.toFixed(2)
        });
      });

      data.push({
        Date: selectedOption === "DayBook" ? fromDate : toDate,
        Narration: "Closing Balance",
        Debit: "",
        Credit: "",
        Balance: Number(receivableData.closing_balance*-1 || 0).toFixed(2)
      });
    } else {
      data.push({
        Date: fromDate,
        "Patient Name": "",
        "Appointment Date": "",
        "Mobile Number": "",
        "Payment ID": "",
        Type: "Opening Balance",
        Debit: "",
        Credit: "",
        Balance: Number(appointmentData.opening_balance || 0).toFixed(2)
      });

      filteredAppointmentTransactions.forEach((tx, index) => {
        const amount = Number(tx?.amount || 0);
        const balance = getAppointmentBalance(tx, index, filteredAppointmentTransactions);
        data.push({
          Date: formatTimestampDisplay(tx?.timestamp),
          "Patient Name": tx?.patient_name || "",
          "Appointment Date": tx?.date_of_appointment || "",
          "Mobile Number": tx?.whatsapp_number || "",
          "Payment ID": tx?.pay_id || "",
          Type: tx?.pay_id === "offline" || tx?.pay_id === "Cash" ? "Current OPD" : "Advance OPD",
          Debit: amount < 0 ? Math.abs(amount) : 0,
          Credit: amount > 0 ? amount : 0,
          Balance: balance.toFixed(2)
        });
      });

      data.push({
        Date: toDate,
        "Patient Name": "",
        "Appointment Date": "",
        "Mobile Number": "",
        "Payment ID": "",
        Type: "Closing Balance",
        Debit: "",
        Credit: "",
        Balance: Number(appointmentData.closing_balance || 0).toFixed(2)
      });
    }

    if (!data.length) return;

    const filename =
      selectedOption === "DayBook"
        ? `Day_Book_${fromDate}.csv`
        : selectedOption === "Receivable"
        ? `Doctor_Receivable_${fromDate}_${toDate}.csv`
        : `Appointment_Ledger_${fromDate}_${toDate}.csv`;

    exportToCSV(filename, data);
  };

  const setToday = () => {
    const today = formatDateISO(new Date());
    setFromDate(today);
    setToDate(today);
  };

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(formatDateISO(firstDay));
    setToDate(formatDateISO(lastDay));
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    setFromDate(formatDateISO(firstDayLastMonth));
    setToDate(formatDateISO(lastDayLastMonth));
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-2 sm:p-5 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-teal-50 text-teal-700 rounded-lg sm:rounded-xl">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                {options.find((opt) => opt.value === selectedOption)?.label || "Doctor Ledger"}
              </h1>
            </div>
          
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 min-h-[40px] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={downloadExcel}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-95 rounded-lg sm:rounded-xl shadow-sm transition-all min-h-[40px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* ================= FILTER & DATE CONTROLS ================= */}
        {}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm border border-slate-200/80 space-y-3.5">
          
          {/* SELECT REPORT DROPDOWN (Positioned Above From Date) */}
          <div className="w-full sm:w-80">
            <label htmlFor="report-select" className="block text-[11px] sm:text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-teal-600" />
              Select Report
            </label>
            <div className="relative">
              <select
                id="report-select"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full bg-teal-50/70 border border-teal-200 text-slate-900 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-2.5 pr-8 sm:pr-10 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none cursor-pointer shadow-sm transition-all appearance-none min-h-[42px]"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-4 items-end">
            
            {/* From Date Input */}
            <div className={selectedOption === "DayBook" ? "lg:col-span-8" : "lg:col-span-5"}>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                {selectedOption === "DayBook" ? "Day Book Date" : "From Date"}
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all min-h-[42px]"
                />
              </div>
            </div>

            {/* To Date Input (Hidden for DayBook) */}
            {selectedOption !== "DayBook" && (
              <div className="lg:col-span-5">
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all min-h-[42px]"
                  />
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="lg:col-span-2">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-800 hover:bg-teal-900 active:scale-95 text-white font-semibold rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[42px]"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1 whitespace-nowrap">Presets:</span>
            <button
              onClick={setToday}
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={setThisMonth}
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={setLastMonth}
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
            >
              Last Month
            </button>
          </div>

        </div>

        {/* ================= ERROR DISPLAY ================= */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 sm:p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-rose-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* ================= MAIN CONTENT TABLE & MOBILE CARDS ================= */}
        {}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedOption === "DayBook"
                    ? "Day Book Records"
                    : selectedOption === "Receivable"
                    ? "Receivable Statement Ledger"
                    : selectedOption === "Receipt"
                    ? "Receipt Transactions"
                    : "Appointment Ledger Records"}
                </h3>
              </div>
              <span className="sm:hidden text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                {(selectedOption === "Receivable" || selectedOption === "DayBook")
                  ? receivableData.transactions.length
                  : filteredAppointmentTransactions.length}
              </span>
            </div>

            {/* Instant Search Bar */}
            {selectedOption !== "Receivable" && selectedOption !== "DayBook" && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter name, mobile, pay ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Loading Spinner State */}
          {loading ? (
            <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-teal-600" />
              <p className="text-xs sm:text-sm font-semibold text-slate-600">Loading ledger data...</p>
            </div>
          ) : (
            <div>
              
              {/* ================= RECEIVABLE / DAYBOOK VIEW ================= */}
              {(selectedOption === "Receivable" || selectedOption === "DayBook") ? (
                <>
                  {/* MOBILE CARD VIEW (Block on mobile, hidden on sm+) */}
                  {}
                  <div className="block sm:hidden divide-y divide-slate-100">
                    {/* Opening Balance Card */}
                    <div className="p-3.5 bg-amber-50/60 flex items-center justify-between border-b border-amber-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Opening Balance
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{formatDateDisplay(fromDate)}</p>
                      </div>
                      <div className="text-right font-bold text-slate-900 text-sm">
                        ₹{formatAmount(receivableData.opening_balance * -1)}
                      </div>
                    </div>

                    {receivableData.transactions.length > 0 ? (
                      receivableData.transactions.map((tx, idx) => {
                        const balance = getReceivableBalance(tx, idx);
                        const debit = Number(tx?.debit || 0);
                        const credit = Number(tx?.credit || 0);
                        return (
                          <div key={tx?._id || idx} className="p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {formatDateDisplay(tx?.date || tx?.createdAt)}
                              </span>
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                {tx?.Payment_id === "Cash" ? "Current OPD" : "Advance OPD"}
                              </span>
                            </div>

                            {tx?.Payment_id && (
                              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                Pay ID: {tx.Payment_id}
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-1 pt-1 text-center border-t border-slate-100">
                              <div className="bg-rose-50/70 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-rose-600">Debit</span>
                                <span className="text-xs font-semibold text-rose-700">₹{formatAmount(debit)}</span>
                              </div>
                              <div className="bg-emerald-50/70 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-emerald-600">Credit</span>
                                <span className="text-xs font-semibold text-emerald-700">₹{formatAmount(credit)}</span>
                              </div>
                              <div className="bg-slate-100/80 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-slate-600">Balance</span>
                                <span className="text-xs font-bold text-slate-900">₹{formatAmount(balance)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No transactions found for the selected period.
                      </div>
                    )}

                    {/* Closing Balance Card */}
                    <div className="p-3.5 bg-teal-50/80 flex items-center justify-between border-t border-teal-100 font-bold">
                      <span className="text-xs text-teal-900">Closing Balance</span>
                      <span className="text-sm text-teal-900">₹{formatAmount(receivableData.closing_balance * -1)}</span>
                    </div>
                  </div>

                  {/* DESKTOP TABLE VIEW (Hidden on mobile, block on sm+) */}
                  {}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600 tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Narration</th>
                          <th className="py-3 px-4 text-right">Debit</th>
                          <th className="py-3 px-4 text-right">Credit</th>
                          <th className="py-3 px-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        <tr className="bg-amber-50/50 font-medium">
                          <td className="py-3 px-4 text-slate-600">{formatDateDisplay(fromDate)}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">Opening Balance</td>
                          <td className="py-3 px-4 text-right text-slate-400">-</td>
                          <td className="py-3 px-4 text-right text-slate-400">-</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            ₹{formatAmount(receivableData.opening_balance * -1)}
                          </td>
                        </tr>

                        {receivableData.transactions.length > 0 ? (
                          receivableData.transactions.map((tx, idx) => {
                            const balance = getReceivableBalance(tx, idx);
                            const debit = Number(tx?.debit || 0);
                            const credit = Number(tx?.credit || 0);
                            return (
                              <tr key={tx?._id || idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 text-slate-600">
                                  {formatDateDisplay(tx?.date || tx?.createdAt)}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  {tx?.Payment_id === "Cash" ? "Current OPD" : "Advance OPD"}
                                  {tx?.Payment_id && (
                                    <span className="block text-[10px] font-normal text-slate-400">
                                      ID: {tx.Payment_id}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right text-rose-600 font-medium">
                                  ₹{formatAmount(debit)}
                                </td>
                                <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                                  ₹{formatAmount(credit)}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                  ₹{formatAmount(balance)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                              No transactions found for the selected period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-teal-50/60 font-bold border-t border-teal-100 text-xs sm:text-sm">
                          <td colSpan="4" className="py-3.5 px-4 text-right text-slate-700">
                            Closing Balance
                          </td>
                          <td className="py-3.5 px-4 text-right text-teal-800">
                            ₹{formatAmount(receivableData.closing_balance * -1)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (

                /* ================= APPOINTMENT LEDGER VIEW ================= */
                <>
                  {/* MOBILE CARD VIEW (Block on mobile, hidden on sm+) */}
                  {}
                  <div className="block sm:hidden divide-y divide-slate-100">
                    {/* Opening Balance Card */}
                    <div className="p-3.5 bg-amber-50/60 flex items-center justify-between border-b border-amber-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Opening Balance
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{formatDateDisplay(fromDate)}</p>
                      </div>
                      <div className="text-right font-bold text-slate-900 text-sm">
                        ₹{formatAmount(appointmentData.opening_balance)}
                      </div>
                    </div>

                    {filteredAppointmentTransactions.length > 0 ? (
                      filteredAppointmentTransactions.map((tx, idx) => {
                        const amount = Number(tx?.amount || 0);
                        const balance = getAppointmentBalance(tx, idx, filteredAppointmentTransactions);
                        const isOffline = tx?.pay_id === "offline" || tx?.pay_id === "Cash";

                        return (
                          <div key={tx?._id || idx} className="p-3.5 space-y-2.5 hover:bg-slate-50 transition-colors">
                            {/* Top row: Patient Name & Type Badge */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                                  <User className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                  <span>{tx?.patient_name || "Unknown"}</span>
                                </div>
                                {tx?.whatsapp_number && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{tx.whatsapp_number}</span>
                                  </div>
                                )}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isOffline ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isOffline ? "Current OPD" : "Advance OPD"}
                              </span>
                            </div>

                            {/* Date & Pay ID */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span>Appt: {formatDateDisplay(tx?.date_of_appointment)}</span>
                              <span className="font-mono text-slate-600">{tx?.pay_id || "N/A"}</span>
                            </div>

                            {/* Financial breakdown pills */}
                            <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                              <div className="bg-rose-50/70 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-rose-600">Debit</span>
                                <span className="text-xs font-semibold text-rose-700">
                                  {amount < 0 ? `₹${formatAmount(Math.abs(amount))}` : "₹0.00"}
                                </span>
                              </div>
                              <div className="bg-emerald-50/70 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-emerald-600">Credit</span>
                                <span className="text-xs font-semibold text-emerald-700">
                                  {amount > 0 ? `₹${formatAmount(amount)}` : "₹0.00"}
                                </span>
                              </div>
                              <div className="bg-slate-100/80 p-1.5 rounded-lg">
                                <span className="block text-[9px] uppercase font-bold text-slate-600">Balance</span>
                                <span className="text-xs font-bold text-slate-900">₹{formatAmount(balance)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No transactions found.
                      </div>
                    )}

                    {/* Closing Balance Card */}
                    <div className="p-3.5 bg-teal-50/80 flex items-center justify-between border-t border-teal-100 font-bold">
                      <span className="text-xs text-teal-900">Closing Balance</span>
                      <span className="text-sm text-teal-900">₹{formatAmount(appointmentData.closing_balance)}</span>
                    </div>
                  </div>

                  {/* DESKTOP TABLE VIEW (Hidden on mobile, block on sm+) */}
                  {}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600 tracking-wider">
                          <th className="py-3 px-4">S.No</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Patient</th>
                          <th className="py-3 px-4">Narration</th>
                         {selectedOption !== "Receipt"&& <th className="py-3 px-4 text-right">Debit</th>}
                          <th className="py-3 px-4 text-right">{selectedOption !== "Receipt"?"Credit":"Amount"}</th>
                          <th className="py-3 px-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        <tr className="bg-amber-50/50 font-medium">
                          <td className="py-3 px-4 text-slate-400">-</td>
                          <td className="py-3 px-4 text-slate-600">{formatDateDisplay(fromDate)}</td>
                          <td className="py-3 px-4 text-slate-400">-</td>
                          <td className="py-3 px-4 font-bold text-slate-900">Opening Balance</td>
                          <td className="py-3 px-4 text-right text-slate-400">-</td>
                          {selectedOption !== "Receipt"&&<td className="py-3 px-4 text-right text-slate-400">-</td>}
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            ₹{formatAmount(appointmentData.opening_balance)}
                          </td>
                        </tr>

                        {filteredAppointmentTransactions.length >= 0 ? (
                          filteredAppointmentTransactions.map((tx, idx) => {
                            const amount = Number(tx?.amount || 0);
                            const balance = getAppointmentBalance(tx, idx, filteredAppointmentTransactions);
                            const isOffline = tx?.pay_id === "offline" || tx?.pay_id === "Cash";

                            return (
                              <tr key={tx?._id || idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-800">
                                    {formatDateDisplay(tx?.date_of_appointment)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {formatTimestampDisplay(tx?.timestamp)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-800">
                                    {tx?.patient_name || "Unknown"}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {tx?.whatsapp_number || ""}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                      isOffline
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {isOffline ? "Current OPD" : "Advance OPD"}
                                  </span>
                                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                                    {tx?.pay_id || ""}
                                  </div>
                                </td>
                             {selectedOption !== "Receipt"&&   <td className="py-3 px-4 text-right text-rose-600 font-medium">
                                  {amount <= 0 ? `₹${formatAmount(Math.abs(amount))}` : "₹0.00"}
                                </td>}
                                <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                                  {amount >= 0 ? `₹${formatAmount(amount)}` : "₹0.00"}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                  ₹{formatAmount(balance)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                              No transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-teal-50/60 font-bold border-t border-teal-100 text-xs sm:text-sm">
                          {selectedOption !== "Receipt"?<td colSpan="6" className="py-3.5 px-4 text-right text-slate-700">
                            Closing Balance
                          </td>:<td colSpan="5" className="py-3.5 px-4 text-right text-slate-700">
                            Closing Balance
                          </td>}
                          <td className="py-3.5 px-4 text-right text-teal-800">
                            ₹{formatAmount(appointmentData.closing_balance)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Table Footer Bar */}
          {}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
            <span>Doctor ID: {doctorId || "N/A"}</span>
            <span>
              {(selectedOption === "Receivable" || selectedOption === "DayBook")
                ? receivableData.transactions.length
                : filteredAppointmentTransactions.length}{" "}
              Records Displayed
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LedgerView;