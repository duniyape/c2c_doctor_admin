const DetailItem = ({ label, value, isStatus }) => {
    let valueNode;
    const statusClasses = 'bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold';
    
    if (isStatus) {
        valueNode = <span className={statusClasses}>{value}</span>;
    } else {
        valueNode = <span className="text-gray-900 font-semibold">{value || 'N/A'}</span>;
    }

    return (
        <div className="flex justify-between items-start py-3 border-b border-gray-100">
            <span className="text-gray-600 text-sm w-1/2">{label}</span>
            <div className="text-right w-1/2">
                {valueNode}
            </div>
        </div>
    );
};


const AppointmentDetailsView = ({ appointment, onBack }) => {
    // In a real app, you'd fetch this detail by ID, but here we use mock data
    const detail = appointment; 

    const handleSendAlert = () => {
        console.log(`Sending alert for appointment ID: ${detail.id}`);
        // Placeholder for actual alert logic (e.g., notifying staff)
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            {/* Header/Back Button */}
            <header className="flex items-center justify-between border-b pb-4 mb-6">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-gray-600 hover:text-green-600 transition duration-150"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="font-medium">Back</span>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <div className="w-20"></div> {/* Spacer for alignment */}
            </header>

            {/* Details Grid */}
            <div className="max-w-xl mx-auto">
                <DetailItem label="Patient Name" value={detail.patientName} />
                <DetailItem label="Guardian Name" value={detail.guardianName} />
                <DetailItem label="Date of appointment" value={detail.date} />
                <DetailItem label="Time slot" value={detail.timeSlot} />
                <DetailItem label="Contact number" value={detail.contactNumber} />
                <DetailItem label="Appointment number" value={detail.id} />
                <DetailItem label="Payment ID" value={detail.paymentId} />
                <DetailItem label="Age" value={detail.age} />
                <DetailItem label="Date of Birth" value={detail.dateOfBirth} />
                <DetailItem label="City" value={detail.city} />
                <DetailItem label="Address" value={detail.address} />
                <DetailItem label="E-Mail ID" value={detail.emailId} />
                <DetailItem label="Symptoms" value={detail.symptoms} />
                <DetailItem label="Status" value={detail.status} isStatus={true} />
            </div>

            {/* Notes Section */}
            <div className="mt-8 pt-4 border-t border-gray-100 max-w-xl mx-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                    {detail.notes || 'No specific notes recorded.'}
                </p>
            </div>

            {/* Action Button */}
            <div className="mt-10 text-center">
                <button
                    onClick={handleSendAlert}
                    className={`px-6 py-3 text-base font-medium text-white ${PRIMARY_COLOR} rounded-xl hover:bg-green-700 transition duration-150 shadow-lg`}
                >
                    SEND ALERT
                </button>
            </div>
        </div>
    );
};
