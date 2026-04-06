// src/pages/DoctorLedgerPage.jsx
import moment from 'moment';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
  import Cookies from 'js-cookie';
export default function DayBook({fromDate,toDate , sendDataToParent}) {
  const [formData, setFormData] = useState({
    doctorId: Cookies.get('user'), // In future, make this a dropdown
    from: moment(new Date()).format('YYYY-MM-DD'),
    to: moment(new Date()).format('YYYY-MM-DD'),
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { doctorId, from, to } = formData;

    if (new Date(from) > new Date(to)) {
      Swal.fire('Invalid Range', 'Start date cannot be after end date.', 'error');
      return;
    }

    setLoading(true);
    setData(null);



    const url = `https://api.care2connect.in/v1/doctor/${doctorId}?from=${formData.from}&to=${moment(formData.from).add(1, 'days').format("YYYY-MM-DD")}`;

    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const result = await response.json();
      setData(result);

       sendDataToParent(result);


      if (result.transaction_count === 0) {
        Swal.fire('No Transactions', 'No fee records found for this period.', 'info');
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      Swal.fire('Connection Failed', 'Could not load doctor ledger. Try later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatAmount = (num) => Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const abs = (n) => Math.abs(n);






  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" }}>
      {/* <h2 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", color: "#1f2937", marginBottom: "8px" }}>Doctor Consolidated Ledger</h2> */}
      {/* <p style={{ textAlign: "center", color: "#4b5563", marginBottom: "32px" }}>
        View earnings and payment history for Doctor ID: <strong>{formData.doctorId}</strong>
      </p> */}

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        style={{ background: "#f9fafb", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "32px" }}
      >
        {/* <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Doctor ID</label>
          <input
            type="text"
            value={formData.doctorId}
            disabled
            style={{ width: "100%", padding: "8px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px" }}
          />
        </div> */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Select Date</label>
          <input
            type="date"
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
          />
        </div>
        {/* <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>To Date</label>
          <input
            type="date"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
          />
        </div> */}

        <div style={{ gridColumn: "span 3", display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 32px", background: loading ? "#60a5fa" : "#2563eb", color: "#fff", fontWeight: "500", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <span style={{ height: "20px", width: "20px", border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }}></span>
                Loading...
              </>
            ) : (
              '🔍 Load Ledger'
            )}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
          <span style={{ height: "32px", width: "32px", border: "4px solid #2563eb", borderTop: "4px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite", marginRight: "12px" }}></span>
          Fetching doctor fee data...
        </div>
      )}

      {/* Ledger Data */}
      {!loading && data && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            {/* <div style={{ background: "#eff6ff", padding: "20px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#1e40af" }}>Opening Balance</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}>
                {data.opening_balance >= 0
                  ? `${formatAmount(data.opening_balance)} Dr`
                  : `${formatAmount(abs(data.opening_balance))} Cr`}
              </p>
            </div> */}

            {/* <div style={{ background: "#ecfdf5", padding: "20px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#047857" }}>Fees Earned (Cr)</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}>₹{formatAmount(data.period_credit)}</p>
            </div> */}

            {/* <div style={{ background: "#f5f3ff", padding: "20px", borderRadius: "12px", border: "1px solid #ddd6fe" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#6b21a8" }}>Closing Balance</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px", color: "#6d28d9" }}>
                {data.closing_balance >= 0
                  ? `${formatAmount(data.closing_balance)} Dr`
                  : `${formatAmount(abs(data.closing_balance))} Cr`}
              </p>
            </div> */}
          </div>

          {/* Transactions Table */}
          <div style={{ border: "1px solid #d1d5db", borderRadius: "12px", overflow: "hidden", boxShadow: "0px 2px 6px rgba(0,0,0,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", color: "#1f2937", textTransform: "uppercase", fontSize: "12px" }}>
                  <th style={{ padding: "12px 2px", fontWeight: "bold", textAlign: "left" }}>Date</th>
                  {/* <th style={{ padding: "12px 24px", fontWeight: "bold", textAlign: "left" }}>Voucher No</th> */}
                  <th style={{ padding: "12px 2px", fontWeight: "bold", textAlign: "left" }}>Narration</th>
                  <th style={{ padding: "12px 2px", fontWeight: "bold", textAlign: "right" }}>Debit (₹)</th>
                  <th style={{ padding: "12px 2px", fontWeight: "bold", textAlign: "right" }}>Credit (₹)</th>
                  <th style={{ padding: "12px 2px", fontWeight: "bold", textAlign: "right" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "#fef9c3", fontWeight: "600" }}>
                  <td colSpan="4" style={{ padding: "12px 24px", textAlign: "right" }}>Opening Balance</td>
                  <td style={{ padding: "12px 2px", textAlign: "right" }}>
                    {data.opening_balance >= 0
                      ? `${formatAmount(data.opening_balance)} Dr`
                      : `${formatAmount(abs(data.opening_balance))} Cr`}
                  </td>
                </tr>

                {data.transactions.length > 0 ? (
                  data.transactions.map((tx, idx) => {
                    const previousBalance =
                      idx === 0 ? data.opening_balance : data.transactions[idx - 1].runningBalance;
                    tx.runningBalance = previousBalance +   tx.debit- tx.credit;


                    return (
                      <tr key={idx} style={{ cursor: "pointer" }} onMouseOver={(e) => e.currentTarget.style.background="#f9fafb"} onMouseOut={(e) => e.currentTarget.style.background="white"}>
                        <td style={{ padding: "12px 2px", color: "#4b5563" }}>{formatDate(tx.date)}</td>
                        {/* <td
                          style={{ padding: "12px 24px", fontFamily: "monospace", fontSize: "14px", color: "#1d4ed8", textDecoration: "underline" }}
                          onClick={() => {
                            Swal.fire({
                              title: 'Voucher Details',
                              html: `
                                <div style="text-align:left;">
                                  <p><strong>Voucher:</strong> ${tx.voucher_number}</p>
                                  <p><strong>Type:</strong> ${tx.voucher_type}</p>
                                  <p><strong>Mode:</strong> ${tx.voucher_mode}</p>
                                  <p><strong>Narration:</strong> ${tx.narration}</p>
                                  <p><strong>Credit:</strong> ₹${formatAmount(tx.credit)}</p>
                                  <p><strong>Debit:</strong> ₹${formatAmount(tx.debit)}</p>
                                </div>
                              `,
                              confirmButtonText: 'Close',
                            });
                          }}
                        >
                          {tx.voucher_number}
                        </td> */}
                        <td style={{ padding: "12px 2px", fontSize:8 }}>{tx.Payment_id==='Cash'?'Current OPD':'Advance OPD'}</td>
                        <td style={{ padding: "12px 2px", textAlign: "right", color: "#b91c1c", fontWeight: "500" }}>₹{formatAmount(tx.debit)}</td>
                        <td style={{ padding: "12px 2px", textAlign: "right", color: "#15803d", fontWeight: "500" }}>₹{formatAmount(tx.credit)}</td>
                        <td style={{ padding: "12px 2px", textAlign: "right", fontWeight: "600" }}>
                          {tx.runningBalance >= 0
                            ? `${formatAmount(tx.runningBalance)} Cr`
                            : `${formatAmount(abs(tx.runningBalance))} Cr`}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
                      No transactions in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Final Summary */}
          <div style={{ marginTop: "24px", textAlign: "right", color: "#4b5563", fontWeight: "600" }}>
            Final Balance:{' '}
            {data.closing_balance >= 0
              ? `${formatAmount(data.closing_balance)} Dr`
              : `${formatAmount(abs(data.closing_balance))} Cr`}
          </div>

        </div>
      )}
    </div>
  );
}
