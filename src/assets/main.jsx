import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Mob_setting from './mobile_components/Setting'

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Massages from './mobile_components/chats/Massages.jsx';
import AppointDetails from './mobile_components/AppointDetails.jsx';
import DateSetting from './mobile_components/setting/DateSetting.jsx';
import Slots from './mobile_components/setting/Slots.jsx';
import Payment from './mobile_components/setting/Payment.jsx';
import Patientform from './mobile_components/Patientform.jsx';
import Login from './components/login/Login.jsx';
import Addstaff from './components/staff/Addstaff.jsx';
import AddDoctors from './components/createdoctors/AddDocters.jsx';
import LedgerView from './mobile_components/setting/LedgerView.jsx';
import Brodcast from './mobile_components/chats/Brodcast.jsx';
import Avslots from './mobile_components/Setting.jsx'
import Mobstaff from './mobile_components/staff/Staffmob.jsx'
import AddStaff from './components/staff/Addstaff.jsx';
import Accessibility from './mobile_components/setting/Accessibility.jsx';
import { LoaderProvider } from './components/loader/LoaderContext.jsx'
import { UserProvider } from "./context/UserContext.jsx";
// import DoctorReschedule from './mobile_components/setting/Reschedule.jsx'
import Addproduct from './mobile_components/newupdate/Addproduct.jsx'
import Addpatient from './mobile_components/newupdate/Addpatient.jsx'
import Makebill from './mobile_components/newupdate/Makebill.jsx'
import BrackupFarm from './mobile_components/newupdate/BrackupFarm.jsx'
import CurrentOPD from './mobile_components/newupdate/CurrentOPD.jsx'
import UpdateBrackup from './mobile_components/newupdate/UpdateBrackup.jsx'
import EditReceipt from './mobile_components/newupdate/EditReceipt.jsx'
import DoctorLedgerPage from './mobile_components/newupdate/DoctorLedger.jsx'
import RefundUser from './mobile_components/newupdate/RefundUser.jsx'
import AssignSlots from '../pages/newupdate/AssignSlots.jsx'
import { WhatsappAppointList } from '../pages/newupdate/WhatsappAppointList.jsx'

createRoot(document.getElementById('root')).render(
      <BrowserRouter>
  <LoaderProvider>

    

     <UserProvider>
      {/* <StrictMode> */}
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:id/:name" element={<Massages />} />
          <Route path="/a/:id/" element={<AppointDetails />} />
          <Route path="/datesetting/" element={<DateSetting />} />
          <Route path="/slotsetting/" element={<Slots />} />
          <Route path="/paymentsetting/" element={<Payment />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/profile/" element={<AddDoctors />} />
          <Route path="/Addstaff/" element={<Addstaff />} />
          <Route path="/patientform/:date/:slot/:bookings/" element={<Patientform />} />
          <Route path="/ledgers" element={<LedgerView />} />
          <Route path="/brodcast" element={<Brodcast />} />
          <Route path="/avslots" element={<Avslots />} />
          <Route path="/addstaff" element={<AddStaff />} />
          <Route path="/staff" element={<Mobstaff />} />
          <Route path="/editstaff/:id" element={<AddStaff />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/av" element={<Mob_setting />} />
          <Route path="/reshedule" element={<DoctorReschedule />} />
          <Route path="/adddescription" element={<Addproduct />} />
          <Route path="/addpatient" element={<Addpatient />} />
          <Route path="/makebill" element={<Makebill />} />
          <Route path="/brackup" element={<BrackupFarm />} />
          <Route path="/updatebrackup" element={<UpdateBrackup />} />
          <Route path="/editamount" element={<EditReceipt />} />
          <Route path="/currentOPD" element={<CurrentOPD />} />
          <Route path="/doctorledger" element={<DoctorLedgerPage />} />
          <Route path="/refunduser" element={<RefundUser />} />
          <Route path="/assignslot" element={<AssignSlots />} />
        </Routes>
      {/* </StrictMode> */}
    </UserProvider>


    
  </LoaderProvider>

        
  
      </BrowserRouter>
)
