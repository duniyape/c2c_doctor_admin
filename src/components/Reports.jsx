  import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import useApi from '../api/useApi';
  import Cookies from 'js-cookie';
  import { Link } from "react-router";
  
import DoctorLedgerPage from "./DoctorLedger";
import DayBook from "./DayBook";
import { HeartPulse, User, Lock, Loader2, Download } from 'lucide-react';


  const LedgerView = () => {

    const hasPermission = true
    const [list, setlist] = useState([])
    const { postData } = useApi();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [refunddata, setrefunddata] = useState('')

    // {"_id":{"$oid":"68d28c6c93bac1c47ffe013a"},"patient_name":"indra","guardian_name":"father","date_of_appointment":"2025-09-16","time_slot":"01:00 PM - 02:00 PM","doctor_phone_id":"67ee5e1bde4cb48c515073ee","email":"none","symptoms":"none","age":"0 years, 0 months, 21 days","timestamp":{"$numberInt":"1758628971"},"whatsapp_number":"918959690512","date_of_birth":"2025-09-02","city":"none","address":"none","role":"appointment","status":"success","createdAt":"x","vaccine":"No","razorpay_url":"Offline Transaction","payment_status":"paid","pay_id":"offline","appoint_number":"20250916-6","amount":{"$numberDouble":"220.0"},"appointment_index":{"$numberInt":"51"}}

    // Filter transactions by date
    const filteredTransactions = list
    .filter((tx) => {
      const txDate = new Date(tx.timestamp);
      return (
        (!fromDate || txDate >= new Date(fromDate)) &&
        (!toDate || txDate <= new Date(toDate))
      );
    });


      const getdate_timestamp=(timestamp)=>{
    const date = new Date(timestamp * 1000);
    const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
const dd = String(date.getDate()).padStart(2, '0');
const hh = String(date.getHours()).padStart(2, '0');
const min = String(date.getMinutes()).padStart(2, '0');
const sec = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`
  }
     


    // Calculate balance dynamically
    let runningBalance = 0;
    const transactionsWithBalance = filteredTransactions.map((tx) => {
      runningBalance += tx.amount;
      return { ...tx, balance: runningBalance, aptype: tx.amount===0?'Reappointment':'New'};
    });

    let runningBalance2 = 0;
    const transactionsWithBalanceonline= filteredTransactions.filter((item)=>(item.pay_id!=='offline')).map((tx) => {
      runningBalance2 += tx.amount;
      return { ...tx, balance: runningBalance2, aptype: tx.amount===0?'Reappointment':'New'};
    });

    let runningBalance3 = 0;
    const transactionsWithBalanceoffline= filteredTransactions.filter((item)=>(item.pay_id==='offline')).map((tx) => {
      runningBalance3 += tx.amount;
      return { ...tx, balance: runningBalance3, aptype: tx.amount===0?'Reappointment':'New'};
    });
    



      useEffect(() => {
          const fetchAppointments = async () => {
                let res = await postData("/get_appointment", {});

                const data = res.filter((item) => (parseFloat(item.amount)>=0&&item.doctor_phone_id===Cookies.get('user')))

                const withtimestamp = data.map((tx) => {
              return { ...tx,timestamp:getdate_timestamp(tx.timestamp) };
              });

                setlist(withtimestamp);
          };
          fetchAppointments();


          const fetchdesable = async () => {
                let res = await postData("/get_refund_report", {date:'2020-04-21'});
                setrefunddata(res);
              
          };
fetchdesable();


      }, []);



const [selectedOption, setSelectedOption] = useState('Receipt');

  const options = [
    { value: 'Receipt', label: 'Combined OPD Report' },
    { value: 'Advance', label: 'Advance OPD Report' },
    { value: 'Current', label: 'Current OPD Report' },
    // { value: 'Refund', label: 'Refund Report' },
    { value: 'Ledger', label: 'Ledger' },
    { value: 'Statement', label: 'Receivable Statement' },
    { value: 'Daybook', label: 'Day Book' },
  ];

  const handleSelect = (e) => {
    setSelectedOption(e.target.value);
  };

  const selectStyles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    selectWrapper: {
      position: 'relative',
      width: '300px',
      zIndex: 10
    },
    select: {
      width: '100%',
      padding: '16px 20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid black',
      outline: 'none',
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      cursor: 'pointer',
      appearance: 'none',
      transition: 'all 0.3s ease',
      backgroundImage: 'linear-gradient(45deg, transparent 50%, #999 50%), linear-gradient(135deg, #999 50%, transparent 50%)',
      backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)',
      backgroundSize: '5px 5px, 5px 5px',
      backgroundRepeat: 'no-repeat'
    },
    selectFocus: {
      transform: 'translateY(-2px)',
      // boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)'
    },
    option: {
      padding: '10px',
      fontSize: '16px'
    },
    placeholder: {
      color: '#999',
      fontStyle: 'italic'
    }
  };


   const [message, setMessage] = useState("");

  // function to receive data from child
  const handleChildData = (data) => {
    setMessage(data);
  };


  function downloadJSONAsExcel() {
  // Step 1: Convert JSON to worksheet

  // const dataset = selectedOption==='Ledger'?transactionsWithBalance.map(item => ({
  //       date: item.timestamp,
  //       patient_name: item.patient_name,
  //       particular :`${item.whatsapp_number}, ${item.pay_id}`,
  //       Dr:0,
  //       Cr: item.amount,
  //       balance: `${item.balance}Cr`
  //     })):transactionsWithBalance.map(item => ({
  //       date: item.timestamp,
  //       patient_name: item.patient_name,
  //       date_of_appointment: item.date_of_appointment,
  //       mobile_number : item.whatsapp_number,
  //       payment_id: item.pay_id,
  //       type: item.aptype,
  //       amount: item.amount,
  //       balance: item.balance,
  //     }));

  let dataset = []

  if (selectedOption==='Ledger') {

    dataset = transactionsWithBalance.map(item => ({
        date: item.timestamp,
        patient_name: item.patient_name,
        particular :`${item.whatsapp_number}, ${item.pay_id}`,
        Dr:0,
        Cr: item.amount,
        balance: `${item.balance}Cr`
      }))
    
  }else if (selectedOption==='Receipt') {

    dataset = transactionsWithBalance.map(item => ({
     date: item.timestamp,
        patient_name: item.patient_name,
        date_of_appointment: item.date_of_appointment,
        mobile_number : item.whatsapp_number,
        payment_id: item.pay_id,
        type: item.aptype,
        amount: item.amount,
        balance: item.balance,
      }))
    
  }else if (selectedOption==='Advance') {

     dataset = transactionsWithBalanceonline.map(item => ({
     date: item.timestamp,
        patient_name: item.patient_name,
        date_of_appointment: item.date_of_appointment,
        mobile_number : item.whatsapp_number,
        payment_id: item.pay_id,
        type: item.aptype,
        amount: item.amount,
        balance: item.balance,
      }))
    
  }else if (selectedOption==='Current') {

    dataset = transactionsWithBalanceoffline.map(item => ({
     date: item.timestamp,
        patient_name: item.patient_name,
        date_of_appointment: item.date_of_appointment,
        mobile_number : item.whatsapp_number,
        payment_id: item.pay_id,
        type: item.aptype,
        amount: item.amount,
        balance: item.balance,
      }))
    
  }else if (selectedOption==='Statement'){

    //   const formatDate = (dateStr) =>
    // new Date(dateStr).toLocaleDateString('en-IN', {
    //   day: '2-digit',
    //   month: 'short',
    //   year: 'numeric',
    // });

  const formatAmount = (num) => Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const abs = (n) => Math.abs(n);

    dataset = message.transactions.map((tx, idx) => {
                    const previousBalance =
                      idx === 0 ? message.opening_balance : message.transactions[idx - 1].runningBalance;
                    tx.runningBalance = previousBalance +   tx.debit- tx.credit;

                    return {
                      date : tx.date,
                      Payment_id: tx.Payment_id,
                      debit: tx.debit,
                      credit :tx.credit,
                      balance : tx.runningBalance >= 0
                            ? `${formatAmount(tx.runningBalance)} Cr`
                            : `${formatAmount(abs(tx.runningBalance))} Cr`
                    }
  })


  }else if (selectedOption==='Daybook'){

    //   const formatDate = (dateStr) =>
    // new Date(dateStr).toLocaleDateString('en-IN', {
    //   day: '2-digit',
    //   month: 'short',
    //   year: 'numeric',
    // });

  const formatAmount = (num) => Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const abs = (n) => Math.abs(n);

    dataset = message.transactions.map((tx, idx) => {
                    const previousBalance =
                      idx === 0 ? message.opening_balance : message.transactions[idx - 1].runningBalance;
                    tx.runningBalance = previousBalance +   tx.debit- tx.credit;

                    return {
                      date : tx.date,
                      Payment_id: tx.Payment_id,
                      debit: tx.debit,
                      credit :tx.credit,
                      balance : tx.runningBalance >= 0
                            ? `${formatAmount(tx.runningBalance)} Cr`
                            : `${formatAmount(abs(tx.runningBalance))} Cr`
                    }
  })


  }

  

  // const filteredData = dataset.map(item => ({

  //       date: item.timestamp,
  //       patient_name: item.patient_name,
  //       date_of_appointment: item.date_of_appointment,
  //       mobile_number : item.whatsapp_number,
  //       payment_id: item.pay_id,
  //       type: item.aptype,
  //       amount: item.amount,
  //       balance: item.balance,
  //     }));

      const jsonData = dataset

  const filename = "data.xlsx"
  const worksheet = XLSX.utils.json_to_sheet(jsonData);

  // Step 2: Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Step 3: Export to file
  XLSX.writeFile(workbook, filename);
}


// Call function






      if (hasPermission) {
            
     
    return (
      <div style={{ maxWidth: "100%", fontFamily: "Arial" ,fontSize:12}}>




        {/* <h2 style={{ textAlign: "center" }}>Ledger View</h2> */}

        

        <div style={{padding:20}}>

        {/* Date Filters */}
       { selectedOption!=='Daybook' &&<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
         <div>
            <label>From: </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ padding: "5px", marginLeft: "5px" }}
            />
          </div>
          <div>
            <label>To: </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ padding: "5px", marginLeft: "5px" }}
            />
          </div>
        </div>}

        <div style={{display:'flex',alignItems:'center',gap:20}}>
        <select
          value={selectedOption}
          onChange={handleSelect}
          style={selectStyles.select}
          onFocus={(e) => {
            e.target.style.transform = selectStyles.selectFocus.transform;
            e.target.style.boxShadow = selectStyles.selectFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.target.style.transform = 'none';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
          }}
        >
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
              style={option.value === '' ? selectStyles.placeholder : selectStyles.option}
            >
              {option.label}
            </option>
          ))}
        </select>

        <Download
  onClick={downloadJSONAsExcel}
  color="#003c35"
  size={18}
  className={`w-10 h-10`}
  style={{ cursor: "pointer", padding: "0 12px" }}
/>
        {/* <i onClick={downloadJSONAsExcel} style={{ color: "#075E54", cursor: "pointer", fontSize: "15px" , padding:'0px 12px'}} className="fa-solid fa-download"/> */}

        </div>

        {/* Ledger Table */}
        {selectedOption==='Receipt'&& <div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f4f4f4", padding: "10px", fontWeight: "bold" }}>
            <div style={{ flex: 1 }}>S.no</div>
            <div style={{ flex: 1 }}>Date</div>
            <div style={{ flex: 1 }}>Ap. Date</div>
            <div style={{ flex: 2 }}>Narration</div>
            <div style={{ flex: 1, textAlign: "right" }}>Amount</div>
            <div style={{ flex: 1, textAlign: "right" }}>Balance</div>
          </div>
          {transactionsWithBalance.length > 0 ? (
            transactionsWithBalance.map((tx, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  padding: "10px",
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>{index+1}</div>
                <div style={{ flex: 1 }}>{tx.timestamp}</div>
                <div style={{ flex: 1 }}>{tx.date_of_appointment}</div>
                <div style={{ flex: 1 }}>{tx.patient_name}</div>
                {/* <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div> */}
                <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id==='offline'?'Current OPD':'Advance OPD'}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  {tx.amount < 0 ? `-${Math.abs(tx.amount)}` : `+${tx.amount}`}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>{tx.balance} ₹</div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", textAlign: "center" }}>No transactions found</div>
          )}
        </div> }

         {selectedOption==='Advance'&& <div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f4f4f4", padding: "10px", fontWeight: "bold" }}>
            <div style={{ flex: 1 }}>S.no</div>
            <div style={{ flex: 1 }}>Date</div>
            <div style={{ flex: 1 }}>Ap. Date</div>
            <div style={{ flex: 2 }}>Narration</div>
            <div style={{ flex: 1, textAlign: "right" }}>Amount</div>
            <div style={{ flex: 1, textAlign: "right" }}>Balance</div>
          </div>
          {transactionsWithBalanceonline.length > 0 ? (
            transactionsWithBalanceonline.filter((item)=>(item.pay_id!=='offline')).map((tx, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  padding: "10px",
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>{index+1}</div>
                <div style={{ flex: 1 }}>{tx.timestamp}</div>
                <div style={{ flex: 1 }}>{tx.date_of_appointment}</div>
                <div style={{ flex: 1 }}>{tx.patient_name}</div>
                <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id==='offline'?'Current OPD':'Advance OPD'}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  {tx.amount < 0 ? `-${Math.abs(tx.amount)}` : `+${tx.amount}`}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>{tx.balance} ₹</div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", textAlign: "center" }}>No transactions found</div>
          )}
        </div> }

         {selectedOption==='Current'&& <div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f4f4f4", padding: "10px", fontWeight: "bold" }}>
            <div style={{ flex: 1 }}>S.no</div>
            <div style={{ flex: 1 }}>Date</div>
            <div style={{ flex: 1 }}>Ap. Date</div>
            <div style={{ flex: 2 }}>Narration</div>
            <div style={{ flex: 1, textAlign: "right" }}>Amount</div>
            <div style={{ flex: 1, textAlign: "right" }}>Balance</div>
          </div>
          {transactionsWithBalanceoffline.length > 0 ? (
            transactionsWithBalanceoffline.filter((item)=>(item.pay_id==='offline')).map((tx, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  padding: "10px",
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>{index+1}</div>
                <div style={{ flex: 1 }}>{tx.timestamp}</div>
                <div style={{ flex: 1 }}>{tx.date_of_appointment}</div>
                <div style={{ flex: 1 }}>{tx.patient_name}</div>
                <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id==='offline'?'Current OPD':'Advance OPD'}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  {tx.amount < 0 ? `-${Math.abs(tx.amount)}` : `+${tx.amount}`}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>{tx.balance} ₹</div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", textAlign: "center" }}>No transactions found</div>
          )}
        </div> }

      {selectedOption==='Refund'&& <div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f4f4f4", padding: "10px", fontWeight: "bold" }}>
            <div style={{ flex: 1 }}>Slots</div>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ flex: 2 }}>Narration</div>
            <div style={{ flex: 1, textAlign: "right" }}>Amount</div>
          </div>
          {refunddata.length > 0 ? (
            refunddata.map((tx, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  padding: "10px",
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>{tx.time_slot}</div>
                <div style={{ flex: 1}}>{tx.patient_name} </div>
                <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  {tx.amount < 0 ? `${Math.abs(tx.amount)}` : `${tx.amount}₹`}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", textAlign: "center" }}>No transactions found</div>
          )}
        </div>}


         {selectedOption==='Ledger'&& <div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f4f4f4", padding: "10px", fontWeight: "bold" }}>
            <div style={{ flex: 1 }}>S.no.</div>
            <div style={{ flex: 1 }}>Date</div>
            <div style={{ flex: 2 }}>Narration</div>
            <div style={{ flex: 1, textAlign: "right" }}>Dr</div>
            <div style={{ flex: 1, textAlign: "right" }}>Cr</div>
            <div style={{ flex: 1, textAlign: "right" }}>Balance</div>
          </div>
          {transactionsWithBalance.length > 0 ? (
            transactionsWithBalance.map((tx, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  padding: "10px",
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>{index+1}</div>
                <div style={{ flex: 1 }}>{tx.timestamp}</div>
                {/* <div style={{ flex: 1 }}>{tx.date_of_appointment}</div> */}
                <div style={{ flex: 2,display:'flex',flexDirection:'column' }}><label>{tx.pay_id==='offline'?'Current OPD':'Advance OPD'}</label><label style={{fontSize:10}}>{tx.whatsapp_number}</label></div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  0
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    color: tx.amount < 0 ? "red" : "green",
                  }}
                >
                  {tx.amount < 0 ? `${Math.abs(tx.amount)}` : `${tx.amount}`}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>{tx.balance}Cr</div>


                
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", textAlign: "center" }}>No transactions found</div>
          )}


          
        </div> }

        {
          selectedOption==='Statement'&&<DoctorLedgerPage fromDate={fromDate} toDate={toDate} sendDataToParent={handleChildData}/>
        }

         {
          selectedOption==='Daybook'&&<DayBook fromDate={fromDate} toDate={toDate} sendDataToParent={handleChildData}/>
        }


        </div>

        {/* <button style={{
          // position:'absolute',
          // top:60,
          // right:20
        }} onClick={downloadJSONAsExcel}>Download</button> */}

      </div>
    );
}else{
    return(
        <div style={{
            width:'100%',
            height:'100vh',
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
            alignItems:'center',
            gap:15
        }}>
            <label>You don't have permission to this page</label>
            <button>
                <Link to="/"><label style={{color:'white'}}>Go Back</label></Link>
            </button>
        </div>
        )
}
  };

  export default LedgerView;
