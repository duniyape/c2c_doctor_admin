import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Eye, Briefcase } from 'lucide-react';

const StaffList = ({ staffData, onAddClick, onViewClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStaff = staffData.filter((staff) => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.speciality && staff.speciality.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  };

  return (
    <div className=" bg-slate-50 p-4 font-sans">
      
      {/* Header */}
      <div className="max-w-7xl p-4 shadow-lg rounded-2xl bg-white mx-auto mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-teal-600">Staff Management</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage hospital employee records.</p>
        </div>
      
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center gap-4 flex-col md:flex-row">
        <div className="bg-white px-2 py-1 rounded-xl shadow-sm border border-slate-200 flex items-center max-w-md w-full">
          <div className="p-2 text-slate-400"><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="Search staff..." 
            className="w-full outline-none text-slate-700 placeholder-slate-400 bg-transparent px-2 text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          <button onClick={onAddClick} className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 md:py-2.5 rounded-xl shadow-lg shadow-teal-200/50 transition-all flex items-center justify-center gap-2 font-medium">
          <Plus size={20} /> <span className="md:hidden">Add New</span> <span className="hidden md:inline">Add New Staff</span>
        </button>
      </div>

      {/* List Header (Desktop Only) */}
      <div className="max-w-7xl mx-auto hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100/50 rounded-t-xl border-b border-slate-200">
        <div className="col-span-1">Avatar</div>
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Role & Speciality</div>
        <div className="col-span-3">Contact</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* Rows */}
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-2">
        {filteredStaff.map((staff, index) => (
          <div key={index} className="group bg-white p-4 md:py-3 md:px-6 rounded-xl md:rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-200">
            
            {/* LAYOUT STRATEGY:
                Mobile: Flex Row (Avatar Left | Info Middle | Action Right)
                Desktop: Grid 12 Columns (Existing Layout)
            */}
            <div className="flex flex-row items-center md:grid md:grid-cols-12 gap-4">

              {/* 1. Avatar */}
              <div className="md:col-span-1 shrink-0">
                {staff.imageUrl ? (
                  <img src={staff.imageUrl} alt={staff.name} className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm bg-teal-100 text-teal-700 border border-teal-200">
                    {getInitials(staff.name)}
                  </div>
                )}
              </div>

              {/* 2. Name & Basic Info (Mobile Wrapper) */}
              <div className="flex-1 min-w-0 md:col-span-4 md:block">
                {/* Name */}
                <h3 className="font-bold text-slate-700 text-base truncate">{staff.name}</h3>
                
                {/* Mobile View: Shows Role & ID under name */}
                <div className="md:hidden flex flex-wrap items-center gap-2 mt-1">
                   <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {staff.role}
                   </span>
                   <span className="text-[10px] text-slate-400">#{staff.EmpID}</span>
                </div>
              </div>

              {/* 3. Role & Speciality (Desktop View) */}
              {/* Hidden on Mobile, Visible on Desktop */}
              <div className="hidden md:flex col-span-3 flex-col items-start justify-center gap-1">
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 capitalize">
                  {staff.role}
                </span>
                {staff.speciality && (
                  <span className="text-xs text-slate-500 font-medium tracking-wide">
                    {staff.speciality}
                  </span>
                )}
              </div>

              {/* 4. Contact Info */}
              {/* Mobile: Hidden (Too cluttered) OR Simplified. Let's simplify. */}
              <div className="hidden md:block col-span-3">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 hover:text-teal-600 transition-colors cursor-pointer">
                    <Mail size={14} />{staff.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} />{staff.phone}
                  </div>
                </div>
              </div>

              {/* 5. Action Button */}
              <div className="md:col-span-1 flex justify-end md:justify-center shrink-0">
                <button 
                  onClick={() => onViewClick(staff)} 
                  className="p-2 md:p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all active:scale-95 bg-slate-50 md:bg-transparent" 
                  title="View & Edit Details"
                >
                  <Eye size={20} />
                </button>
              </div>

            </div>
          </div>
        ))}
        
        {filteredStaff.length === 0 && (
           <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
             No staff found matching "{searchTerm}"
           </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;