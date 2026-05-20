import React, { useEffect, useState } from "react";
import { Link } from "react-router";
// Swal (SweetAlert2) and moment are being replaced by native browser features/JS for compatibility
// import moment from "moment";
// import Swal from "sweetalert2"; 
import axios from "axios";
import Cookies from 'js-cookie';
// --- Custom Alert/Confirm (Replaces SweetAlert2) ---
// Using custom console messages or simple confirm/alert replacement
const customConfirm = (title, text) => {
    return new Promise((resolve) => {
        // Since we cannot use window.confirm or alert, we simulate the logic flow
        // In a production environment, this would be a custom modal UI.
        const userConfirmed = window.confirm(`${title}\n${text}`);
        resolve({ isConfirmed: userConfirmed });
    });
};

const customAlert = (title, text, icon) => {
    // Similarly, replace Swal.fire with a simple notification mechanism
    console.log(`ALERT (${icon}): ${title} - ${text}`);
};


// --- Date Utility (Replaces Moment.js) ---
const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
};

// Check if two Date objects represent the same day
const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// Check if date1 is before date2 (for checking past dates)
const isBeforeDay = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 < d2;
};
// --- Constants and State Initialization ---

const DateSetting = () => {
  
  // Note: Using a hardcoded ID from the user's original request for API calls
  const USER_ID = Cookies.get('user');
  const BASE_API_URL = import.meta.env.VITE_API_URL;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableDays, setAvailableDays] = useState([]); 
  const [holidays, setHolidays] = useState([]); // Removed initial hardcoded date
  const [xdays, setxdays] = useState([]);
  const [next7days, setnext7days] = useState([]);
  const [finaldata, setfinaldata] = useState({});

  // --- Date Calculations ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = [...Array(daysInMonth).keys()].map((i) => i + 1);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --- Handlers ---
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const toggleAvailability = (dayIndex) => {
    setAvailableDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a,b)=>a-b)
    );
  };

  const handleDateClick = (day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const formattedDate = formatDate(date);
    
    // Check if the clicked date is in the past
    const isPast = isBeforeDay(date, today);

    // Prevent interaction with past dates
    if (isPast) return; 

    if (!availableDays.includes(date.getDay())) return;

    setHolidays((prev) =>
      prev.includes(formattedDate)
        ? prev.filter((d) => d !== formattedDate)
        : [...prev, formattedDate]
    );
  };

  // --- Effects & API Logic ---

  // 1. Fetch initial user data
  useEffect(() => {
    const fetchdata = async () => {
      try {
        let res = await axios.post(
          `${BASE_API_URL}/get_profile/${USER_ID}/`,
          {},{
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "1234",
            },
          }
        );

        setAvailableDays(res.data.date.parameter.week.map((i) => Number(i.name)));
        setHolidays(res.data.date.parameter.holiday.map((i) => i.name));
        console.log(USER_ID)
      } catch (error) {
          console.error("Error fetching user profile:", error);
      }
    };
    fetchdata();
  }, []);

  // 2. Generate next 7 days
  const getNext7Days = () => {
    let arr = [];
    for (let i = 0; i < 7; i++) {
      let d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      arr.push(formatDate(d));
    }
    setnext7days(arr);
  };

  // 3. Recalculate xdays (disabled dates) and final data on state change
  useEffect(() => {
    getNext7Days();

    // The logic to add +1 day to holidays seems specific, retaining original structure:
    const updatedData = holidays.map((dateString) => {
      let newDate = new Date(dateString);
      newDate.setDate(newDate.getDate() ); 
      return formatDate(newDate);
    });

    const todayNormalized = new Date();
    todayNormalized.setHours(0, 0, 0, 0);

    let next15 = [];

    for (let i = 0; i < 15; i++) {
      let d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(todayNormalized.getDate() + i);
      
      if (!availableDays.includes(d.getDay())) {
        next15.push(formatDate(d));
      }
    }

    const x = [...updatedData, ...next15];
    setxdays(x);

    // Prepare final data
    let formattedFinal = {
      date: {
        parameter: {
          week: availableDays.map((item, index) => ({
            id: index,
            name: item,
          })),
          holiday: holidays.map((item, index) => ({
            id: index,
            name: item,
          })),
        },
        disabledate: x.map((item, index) => ({ id: index, name: item })),
      },
    };

    setfinaldata(formattedFinal);
  }, [holidays, availableDays]);

  // 4. Save Settings
  const save = async () => {
    // console.log(finaldata)
    const result = await customConfirm(
      "Are you sure?",
      "You are about to update your availability settings."
    );
    
    if (result.isConfirmed) {
      try {
        await axios.post(
          `${BASE_API_URL}/update_user/${USER_ID}/`,
          finaldata,{
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "1234",
            },
          }
        );
        customAlert("Updated!", "Your availability settings have been saved.", "success");
      } catch (error) {
        console.error("Error updating user:", error);
        customAlert("Error!", "Failed to update settings.", "error");
      }
    }
  };

  // --- Inline Styles (Attractive UI) ---
  const UI_COLOR_PRIMARY = '#249CA2'; // Teal/Cyan
  const UI_COLOR_SUCCESS = '#479F6D'; // Green
  const UI_COLOR_DANGER = '#E16065'; // Red
  const UI_COLOR_INACTIVE = '#A0AEC0'; // Light Gray
  const UI_COLOR_BG = '#f7f9fc';

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '40px',
      fontFamily: '"Inter", sans-serif',
    },
    header: {
      backgroundColor: UI_COLOR_PRIMARY,
      width: '100%',
      height: 50,
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      padding: '0 20px',
      marginBottom: 20,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    backLink: {
        textDecoration: 'none', 
        width: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    backText: {
      fontWeight: 600,
      fontSize: 14,
      color: 'white',
      marginLeft: 10,
    },
    calendarCard: {
      width: "320px",
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      textAlign: "center",
    },
    sectionTitle: {
      color: '#333',
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10,
    },
    weekdayToggleContainer: {
      display: "flex",
      justifyContent: "space-between",
      gap: "4px",
      marginTop: "10px",
      marginBottom: "20px",
      flexWrap: 'wrap',
    },
    weekdayButton: (isActive) => ({
      padding: "8px 10px",
      background: isActive ? UI_COLOR_SUCCESS : UI_COLOR_INACTIVE,
      color: "#fff",
      border: "none",
      cursor: "pointer",
      borderRadius: "6px",
      fontSize: 10,
      fontWeight: 500,
      flexGrow: 1,
      minWidth: '35px',
      transition: 'background 0.2s, transform 0.1s',
      boxShadow: isActive ? '0 2px 4px rgba(71, 159, 109, 0.4)' : 'none',
    }),
    navHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },
    navButton: {
      fontSize: "16px",
      backgroundColor: 'transparent',
      color: UI_COLOR_PRIMARY,
      border: 'none',
      cursor: 'pointer',
      padding: '5px 10px',
      borderRadius: '5px',
      transition: 'opacity 0.2s',
      fontWeight: 'bold',
    },
    monthYear: {
      color: '#333',
      fontSize: 16,
      fontWeight: 700,
    },
    weekdaysGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      fontWeight: "bold",
      marginBottom: '5px',
    },
    weekdayLabel: {
      padding: "5px 0",
      color: '#555',
      fontSize: 12,
    },
    daysGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "5px",
    },
    dayCell: (isHoliday, isAvailable, isPast, isToday) => {
        let background = UI_COLOR_INACTIVE;
        if (isHoliday) {
            background = UI_COLOR_DANGER;
        } else if (isAvailable) {
            background = UI_COLOR_SUCCESS;
        }
        
        return ({
            padding: "10px 5px",
            background: background,
            color: "#fff",
            borderRadius: "6px",
            cursor: isAvailable && !isPast ? "pointer" : "not-allowed",
            fontSize: 12,
            fontWeight: isToday ? 700 : 500,
            opacity: isPast ? 0.4 : 1, 
            border: isToday ? `2px solid ${UI_COLOR_PRIMARY}` : 'none',
            lineHeight: '12px',
            boxShadow: isHoliday ? '0 2px 4px rgba(225, 96, 101, 0.4)' : (isAvailable ? '0 2px 4px rgba(71, 159, 109, 0.2)' : 'none'),
            transition: 'transform 0.1s, box-shadow 0.1s',
        })
    },
    legendContainer: {
      width: 320,
      marginTop: 20,
      padding: '10px 0',
    },
    legendItem: (color) => ({
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      color: '#555',
      marginTop: 5,
    }),
    legendColorBox: (color) => ({
      width: 10,
      height: 10,
      backgroundColor: color,
      marginRight: 8,
      borderRadius: '2px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }),
    saveButtonWrapper: {
      marginTop: 25,
    },
    saveButton: {
      padding: '12px 25px',
      backgroundColor: UI_COLOR_PRIMARY,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      transition: 'background 0.2s, transform 0.1s',
      boxShadow: '0 4px 10px rgba(36, 156, 162, 0.4)',
    }
  };


  return (
    <div style={styles.container}>

      {/* Calendar Card */}
      <div style={styles.calendarCard}>
        
        {/* Set Available Days */}
        <div>
          <label style={styles.sectionTitle}>📅 **Set Weekly Availability**</label>
          <div style={styles.weekdayToggleContainer}>
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => toggleAvailability(index)}
                style={styles.weekdayButton(availableDays.includes(index))}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Navigation */}
        <div style={styles.navHeader}>
          <button onClick={prevMonth} style={styles.navButton}>{"<"}</button>
          <h3 style={styles.monthYear}>
            {getMonthName(currentDate)} {year}
          </h3>
          <button onClick={nextMonth} style={styles.navButton}>{">"}</button>
        </div>

        {/* Weekday Headers */}
        <div style={styles.weekdaysGrid}>
          {weekDays.map((day) => (
            <div key={day} style={styles.weekdayLabel}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={styles.daysGrid}>
          {/* Empty spaces before first day */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={"empty-" + i} style={{ padding: "10px" }}></div>
          ))}

          {/* Days of the month */}
          {daysArray.map((day) => {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0); // Normalize
            const formattedDate = formatDate(date);
            const dayIndex = date.getDay();
            
            const isAvailable = availableDays.includes(dayIndex);
            const isHoliday = holidays.includes(formattedDate);
            
            const todayNormalized = new Date();
            todayNormalized.setHours(0, 0, 0, 0);

            const isToday = isSameDay(date, todayNormalized);
            const isPast = isBeforeDay(date, todayNormalized);

            // Only available days in the future are clickable to set/unset holiday
            const isSelectable = isAvailable && !isPast;


            return (
              <div
                key={day}
                onClick={() => isSelectable && handleDateClick(day)}
                style={styles.dayCell(isHoliday, isAvailable, isPast, isToday)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legendContainer}>
        <label style={styles.legendItem(UI_COLOR_INACTIVE)}>
          <div style={styles.legendColorBox(UI_COLOR_INACTIVE)}></div>
          **Unavailable** (Weekly off or past date).
        </label>
        <label style={styles.legendItem(UI_COLOR_SUCCESS)}>
          <div style={styles.legendColorBox(UI_COLOR_SUCCESS)}></div>
          **Available** (Click on a future date to set as a holiday).
        </label>
        <label style={styles.legendItem(UI_COLOR_DANGER)}>
          <div style={styles.legendColorBox(UI_COLOR_DANGER)}></div>
          **Holiday** (Manually marked as off).
        </label>
      </div>

      {/* Save Button */}
      <div style={styles.saveButtonWrapper}>
        <button onClick={save} style={styles.saveButton}>
          **Save Settings**
        </button>
      </div>
          
    </div>
  );
};

export default DateSetting;