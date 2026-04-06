import React, { useEffect, useState } from "react";
import moment from "moment";
import useApi from "../../api/useApi";
import { Link } from "react-router";
import Cookies from 'js-cookie';
const DoctorReschedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [selected, setSelected] = useState([]);
    const [showModal, setShowModal] = useState(false);
    // const [newDate, setNewDate] = useState("");
    const [filterDate, setFilterDate] = useState(moment().format("YYYY-MM-DD"));
    const { postData,getData } = useApi();

    const [dates, setdates] = useState([])
    const [timeslot, settimeslot] = useState([])

     const [newDate, setNewDate] = useState("");
     const [selectedTimeslot, setselectedTimeslot] = useState("")

  const dropdownStyle = {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width:'100%',
    marginTop:20
  };


  const gettimeslot=async(s)=>{
        let res = await getData(`/fatch_date_and_time/${s}`, {});
        // console.log(res)
            // if (Array.isArray(res)) {
                settimeslot(res)
                // setselectedTimeslot(res[0].date)
            // }
  }

  useEffect(() => {
    if (newDate) {
        settimeslot([])
        gettimeslot(newDate)
    }
  }, [newDate])
  

    useEffect(() => {
        const fetchAppointments = async () => {
            let res = await postData("/get_appointment", {});
            if (Array.isArray(res)) {
                setAppointments(
                    res.filter(
                        (item) =>
                            item.doctor_phone_id===Cookies.get('user'),
                            item.status === "success" &&
                            item.date_of_appointment === filterDate &&
                            !item.statusC
                    )
                );
            }
        };

        const datetime = async () => {
            let res = await getData("/fatch_date_and_time/date", {});
            // if (Array.isArray(res)) {
                setdates(res)
                setNewDate(res[0].date)
                gettimeslot(res[0].date)
            // }
        };

        fetchAppointments();
        datetime();
    }, [filterDate]);

    const [List, setList] = useState([])

const handleSelect = (id, appt) => {
    setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    setList((prevList) => {
        // agar id already hai list me -> remove karo (deselect case)
        if (prevList.some((item) => item.id === appt._id)) {
            return prevList.filter((item) => item.id !== appt._id);
        }
        // warna add karo (select case)
        return [
            ...prevList,
            {
                id: appt._id,
                old_date: appt.date_of_appointment,
                old_time: appt.time_slot,
            },
        ];
    });
};

 const fetchAppointments = async () => {
            let res = await postData("/get_appointment", {});
            if (Array.isArray(res)) {
                setAppointments(
                    res.filter(
                        (item) =>
                            item.status === "success" &&
                            item.date_of_appointment === filterDate
                    )
                );
            }
        };


    const handleRescheduleClick = () => {
        setShowModal(true);
        setNewDate("");
    };

    const confirmReschedule = async() => {
        if (!newDate) {
            alert("Please choose a new date.");
            return;
        }
        if (!selectedTimeslot) {
            alert("Please choose a new Time Slot.");
            return;
        }

        let res = await postData("/update-reschedule", {"resadule_time":selectedTimeslot,"date":newDate,"list":List});
            console.log(res)

        alert(
            `Schedule updated successfully`
        );
        fetchAppointments();
        // console.log({"resadule_time":selectedTimeslot,"date":newDate,"list":List})
        setShowModal(false);
        setSelected([]);
        setList([]);
    };

    // This component assumes you have Tailwind CSS set up in your project
// and that the state variables (appointments, filterDate, selected, etc.) 
// and functions (setFilterDate, handleSelect, handleRescheduleClick, etc.) 
// are defined in the component's body.

return (
    <>
        {/* Container: Full width, centered content, light background, padding */}
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
            
            {/* Header: Title and Date Picker */}
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl sm:text-3xl font-bold text-teal-700 flex items-center">
                    Appointments –
                    {/* Date Picker (Inline styling for input type="date" is often needed for custom look) */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="ml-4 p-2  border border-gray-300 rounded-lg text-sm   text-gray-700 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                    />
                </h2>
            </div>

            {/* Appointment List Container */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {appointments.length > 0 ? (
                    appointments.map((appt, index) => (
                        /* Card: White background, rounded corners, shadow, hover effect */
                        <div 
                            key={appt.appoint_number} 
                            className={`bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out border ${selected.includes(appt.appoint_number) ? 'border-teal-500 ring-2 ring-teal-300' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between pb-3 border-b mb-3">
                                <span className="text-xl font-semibold text-teal-600 mr-2">{index + 1}.</span>
                                <span className="flex-1 text-lg font-medium text-gray-800 truncate">
                                    {appt.patient_name}
                                </span>
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selected.includes(appt.appoint_number)}
                                    onChange={() => handleSelect(appt.appoint_number, appt)}
                                    className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span className="flex items-center">
                                    <span role="img" aria-label="date" className="mr-1">📅</span>
                                    {appt.date_of_appointment}
                                </span>
                                <span className="flex items-center font-medium text-gray-700">
                                    <span role="img" aria-label="time" className="mr-1">⏰</span>
                                    {appt.time_slot}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Empty Message */
                    <p className="col-span-full text-center text-gray-500 py-10 text-lg">
                        No appointments for this date.
                    </p>
                )}
            </div>

            {/* Reschedule Button */}
            {selected.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl flex justify-center">
                    <button 
                        onClick={handleRescheduleClick} 
                        className="w-full max-w-sm px-6 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition duration-150 ease-in-out"
                    >
                        Reschedule ({selected.length})
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                /* Modal Overlay: Fixed, full screen, semi-transparent background */
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    
                    {/* Modal Box: White background, rounded, shadow, max width */}
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                        <h3 className="text-xl font-bold mb-5 text-teal-700">
                            Select New Date & Time
                        </h3>
                        
                        {/* Date Dropdown */}
                        <select
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white appearance-none"
                        >
                            {/* Assuming the fixed logic from the previous turn to show AVAILABLE options */}
                            {dates.map((date) => (
                                (date.enabled !== false) && (
                                    <option key={date.id} value={date.id}>
                                        {date.title}
                                    </option>
                                )
                            ))}
                        </select>

                        {/* Timeslot Dropdown */}
                        <select
                            value={selectedTimeslot}
                            onChange={(e) => setselectedTimeslot(e.target.value)}
                            className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white appearance-none"
                        >
                            {/* Assuming the fixed logic from the previous turn to show AVAILABLE options */}
                            {timeslot.map((slot) => (
                                (slot.enabled !== false) && (
                                    <option key={slot.id} value={slot.id}>
                                        {slot.title}
                                    </option>
                                )
                            ))}
                        </select>
                        
                        {/* Modal Actions */}
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmReschedule}
                                className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
);
}

export default DoctorReschedule;
