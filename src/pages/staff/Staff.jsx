
import React, { useState,useEffect } from 'react';
import StaffList from './StaffList';
import ViewStaffModal from './ViewStaffModal';
import AddStaffModal from './AddStaffModal';
import useApi from '../../api/useApi';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

function Staff() {
  // Modal States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermOpen, setIsPermOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const {postData}=useApi()
  // Initial Data
  const [staffList, setStaffList] = useState([
    
  ]);
   const fetchdata = async () => {
          let res = await postData(`/staff/${Cookies.get('user')}/`,{});
          if(Array.isArray(res)){
            setStaffList(res)
            console.log("Staff List:", res);
          }
            };

   useEffect(() => {
        fetchdata()
      }, []);

  // --- Handlers ---

  // 1. Click Eye Icon -> Open View Modal
  const handleViewClick = (staff) => {
    setSelectedStaff(staff);
    setIsViewOpen(true);
  };

  // 2. Click "Add New Staff" Button -> Open Form
  const handleAddNewClick = () => {
    setSelectedStaff(null);
    setIsFormOpen(true);
  };

  // 3. Click "Edit Details" (Button 1) in View Modal
  const handleEditDetailsClick = (staff) => {
    setIsViewOpen(false); // Close View
    setSelectedStaff(staff);
    setIsFormOpen(true);  // Open Form
  };

  // 4. Click "Edit Permissions" (Button 2) in View Modal
  const handleEditPermsClick = (staff) => {
    setIsViewOpen(false); // Close View
    setSelectedStaff(staff);
    setIsPermOpen(true);  // Open Permission Modal
  };

  // 5. Save Data (From Add/Edit Form)
  const handleSaveStaff = async(updatedData) => {
    if (selectedStaff) {
      const { _id, ...cleanData } = updatedData;
      postData(`/update_user/${_id}/`,cleanData).then((e)=>{
      if(e){
        console.log(e)
        Swal.fire({
          title: "Updated!",
          text: "Your file has been Updated.",
          icon: "success"
        });
    setStaffList(staffList.map(s => s.EmpID === updatedData.EmpID ? updatedData : s));
      }
    })
    } else {
      // Create
      try {
                // Fetch existing employee records
                const snapshot = await postData(`/staff/${Cookies.get('user')}/`,{});
                console.log(snapshot)
                if (Array.isArray(snapshot)) {
                  if(snapshot.length>0){
                  const empNumbers = snapshot
                  .map(emp => emp.EmpID)  // Extract EmpID
                  .filter(id => /^EMP\d+$/.test(id))  // Ensure valid EMP format
                  .map(id => parseInt(id.replace("EMP", ""), 10))  // Convert to number
                  .sort((a, b) => a - b);  // Sort in ascending order
          
                  // Generate next employee ID
                  const nextEmpNumber = empNumbers.length > 0 ? Math.max(...empNumbers) + 1 : 1001;
                  const newEmpID = `EMP${nextEmpNumber}`;
                    // Update database with new employee ID
                    await postData("/add_user",{...updatedData,doctorId:Cookies.get('user'),accessToken:Cookies.get('token'),phonenumberID:Cookies.get('phoneid'),EmpID:newEmpID})
                    console.log("done", newEmpID);
                    Swal.fire({
                      title: "Successful!",
                      text: `Staff created successfully ID : ${newEmpID}`,
                      icon: "success"
                    });
                  }
                } 
                else {
                    // If no employees exist, start from EMP1001
                    await postData("/add_user",{...updatedData,doctorId:Cookies.get('user'),accessToken:Cookies.get('token'),phonenumberID:Cookies.get('phoneid'),EmpID:"EMP1001"})
                    console.log("done", "EMP1001");
                    Swal.fire({
                      title: "Successful!",
                      text: `Staff created successfully ID : EMP1001`,
                      icon: "success"
                    });
                    // setFormData(data)
                }
                fetchdata()
            } catch (error) {
                console.log(error);
            }
      
    }

     
    setIsFormOpen(false);
    // Optional: Re-open view to see changes?
    // setSelectedStaff(updatedData);
    // setIsViewOpen(true);
  };

  // 7. Delete Staff (Button 3)
  const handleDeleteStaff = (empId) => {
    if (window.confirm("Are you sure you want to delete this staff profile permanently?")) {
      setStaffList(staffList.filter(s => s.EmpID !== empId));
      setIsViewOpen(false);
    }
  };

  return (
    <div>
      <StaffList 
        staffData={staffList} 
        onAddClick={handleAddNewClick}
        onViewClick={handleViewClick} 
      />

      {/* 1. View Modal (The Hub) */}
      <ViewStaffModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        staff={selectedStaff}
        onEditDetails={handleEditDetailsClick}     // Button 1 Action
        onEditPermissions={handleEditPermsClick}   // Button 2 Action
        onDelete={handleDeleteStaff}               // Button 3 Action
      />

      {/* 2. Form Modal (Add or Edit Details) */}
      <AddStaffModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveStaff}
        initialData={selectedStaff} 
      />

    </div>
  );
}

export default Staff;
