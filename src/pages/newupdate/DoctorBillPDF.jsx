import React from 'react';

import logo from '../../assets/docl.png';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import imgs from '../../assets/sign.png'

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: 'Times-Roman',
        backgroundColor: '#F8F8F8'
        
    },

    headerSectionBox: {
        border: '1pt solid #000288ff',
        padding: 10,
        paddingTop: 35,
        position: 'relative',
        marginTop: 10,
        marginBottom: 0,
    },

    doctorInfoAbsoluteContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        textAlign: 'right',
        fontSize: 8,
        lineHeight: 1.2,
        // color: '#333333',
        color:'#0011aaff',
        zIndex: 10,
        marginTop: 10
    },
    doctormainInfoAbsoluteContainer: {
        position: 'absolute',
        top: 7,
        right: 10,
        textAlign: 'right',
        fontSize: 12,
        lineHeight: 1.2,
        // color: '#333333',
        color:'#0011aaff',
        zIndex: 10,
    },

    indoorFinalBillText: {
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 9,
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 8,
        paddingVertical: 1,
        border: '1pt solid #333333',
        // color: '#333333',
        zIndex: 1,
        color:'#0011aaff'
    },

    hospitalHeaderContent: {
        border: '1pt solid #333333',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#1e266dff',
        marginTop: 10,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 9,
        backgroundColor: '#ffffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        border: '1pt solid #181f5dff',
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 30,
    },
    hospitalDetails: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexGrow: 1,
        color: '#ffffffff',
        marginLeft: 0,
        paddingLeft: 5,

    },
    hospitalName: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
        width: '100%',
        backgroundColor:'#272070ff',
        padding:10,
        borderRadius:15
    },
    hospitalAddress: {
        fontSize: 12,
        marginTop: 2,
        textAlign: 'left',
        width: '100%',
          color: '#181f5dff',
    },

    patientInfoSection: {
        marginTop: 5,
        marginBottom: 5,
        color:'#0011aaff',
        // color: '#333333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 10,
        marginRight: 5,
    },
    infoValue: {
        fontSize: 10,
        flexGrow: 1,
        borderBottom: '1pt dotted #0011aaff',
        paddingBottom: 0.5,
        lineHeight: 1,
        textAlign: 'left',
    },

    tableContainer: {
        border: '1pt solid #0011aaff',
        marginTop: 0,
        marginBottom: 0,
    },
    blankTableHeader: {
        height: 20,
        borderBottom: '1pt solid #0011aaff',
        backgroundColor: '#E0E0E0',
    },
    tableRowfull: {
        flexDirection: 'row',
        borderBottom: '1pt solid #0011aaff',
        alignItems: 'center',
        minHeight: 20,
        backgroundColor: '#E0E0E0',
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1pt solid #0011aaff',
        alignItems: 'center',
        minHeight: 20,
    },
    tableCell: {
        paddingVertical: 3,
        paddingHorizontal: 4,
        borderRight: '1pt solid #0011aaff',
        textAlign: 'left',
        fontSize: 10,
        color: '#0011aaff',
    },
    cellSNo: { flex: 0.5, textAlign: 'center' },
    cellDescription: { flex: 3, textAlign: 'left' },
    cellRateRs: { flex: 1, textAlign: 'right' },
    cellX: { flex: 0.5, textAlign: 'center' },
    cellDay: { flex: 0.8, textAlign: 'center' },
    cellTotalRs: { flex: 1.5, textAlign: 'right', borderRightWidth: 0 },

    totalBillRow: {
        flexDirection: 'row',
        borderTop: '1pt solid #0011aaff',
        backgroundColor: '#E0E0E0',
        paddingVertical: 6,
        fontWeight: 'bold',
        fontSize: 11,
        color: '#0011aaff',
    },
     discountrow: {
        flexDirection: 'row',
        borderTop: '1pt solid #0011aaff',
        paddingVertical: 6,
        fontWeight: 500,
        fontSize: 11,
        color: '#0011aaff',
    },
    totalBillLabel: {
        flex: 4.8,
        textAlign: 'right',
        paddingRight: 8,
    },
    totalBillAmount: {
        flex: 1.5,
        textAlign: 'right',
        paddingRight: 4,
    },

    footerSectionBox: {
        border: '1pt solid #0011aaff',
        padding: 10,
        marginTop: 0,
        color: '#0011aaff',
        position: 'relative',
    },
    receiptNote: {
        fontSize: 10,
        marginBottom: 5,
    },
    receiptNoValue: {
        borderBottom: '1pt dotted #0011aaff',
        paddingBottom: 1,
    },
    authorisedSignatoryContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: 10,
        width: '100%',
        borderBottom: '1pt solid #0011aaff',
        paddingBottom: 2,
    },
    authorisedSignatoryText: {
        fontSize: 10,
        width: 'auto',
        paddingRight: 5,
    },
    bottomNote: {
        fontSize: 8,
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 'bold',
        color: '#0011aaff',
    },signatureImage: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  }
});

const DoctorBillPDF = ({ formData ,fd }) => {

    console.log(formData)

    const formatNumber = (num) => {
        const val = parseFloat(num);
        return isNaN(val) || val === 0 ? '' : val.toFixed(2);
    };

    const getTotal = (rate, days) => {
        const r = parseFloat(rate) || 0;
        const d = parseFloat(days) || 1;
        return (r * d).toFixed(2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Ensure 'en-GB' locale for DD/MM/YYYY format
        return date.toLocaleDateString('en-GB');
    };

    const total = () => {
        const totalAmount = formData.list.reduce((sum, item) => {
  const rate = Number(item.rate) || 0;
  const days = Number(item.days) || 1;
  return sum + rate * days;
}, 0);
console.log(totalAmount.toFixed(2))
return totalAmount.toFixed(2)
    };

    const billItems = [
        { label: 'ICU Charge', rate: formData.icu?.rate, days: formData.icu?.days, showXDay: true },
        { label: 'Room Rent', rate: formData.room?.rate, days: formData.room?.days, showXDay: true },
        { label: "Doctor's Fee", rate: formData.doctor?.rate, days: formData.doctor?.days, showXDay: true },
        { label: 'Nursing Fee', rate: formData.nurse?.rate, days: formData.nurse?.days, showXDay: true },
    ];

    if (formData.extra1Label || (parseFloat(formData.extra1) || 0) > 0) {
        billItems.push({ label: formData.extra1Label || '', rate: formData.extra1, days: 1, showXDay: false });
    } else {
        billItems.push({ label: '', rate: '', days: '', showXDay: false });
    }
    if (formData.extra2Label || (parseFloat(formData.extra2) || 0) > 0) {
        billItems.push({ label: formData.extra2Label || '', rate: formData.extra2, days: 1, showXDay: false });
    } else {
        billItems.push({ label: '', rate: '', days: '', showXDay: false });
    }
    if (formData.extra3Label || (parseFloat(formData.extra3) || 0) > 0) {
        billItems.push({ label: formData.extra3Label || '', rate: formData.extra3, days: 1, showXDay: false });
    } else {
        billItems.push({ label: '', rate: '', days: '', showXDay: false });
    }

    while (billItems.length < 7) {
        billItems.push({ label: '', rate: '', days: '', showXDay: false });
    }
    if (billItems.length > 7) {
        billItems.splice(7);
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.headerSectionBox}>
                    <Text style={styles.indoorFinalBillText}>Indoor Final Bill</Text>

                    <View style={styles.doctormainInfoAbsoluteContainer}>
                        <Text>Dr. Neeraj Bansal</Text>
                    </View>

                    <View style={styles.doctorInfoAbsoluteContainer}>
                        <Text>M.B.B.S. & M.D. (Pediatrics)</Text>
                        <Text>New Born and Child Specialist</Text>
                    </View>

                    <View style={styles.hospitalHeaderContent}>
                        <View style={styles.logoContainer}>
                            <Image src={logo} style={styles.logoImage} />
                        </View>
                        <View style={styles.hospitalDetails}>
                            <Text style={styles.hospitalName}>KALRA MULTISPECIALTY HOSPITAL</Text>
                            <Text style={styles.hospitalAddress}>Ajit Road, Opp. St. No. 04, BATHINDA</Text>
                        </View>
                    </View>

                    <View style={styles.patientInfoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Bill No:</Text>
                            <Text style={styles.infoValue}>{formData.billNo || ''}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name:</Text>
                            <Text style={styles.infoValue}>{fd.sex==='Male'?formData.name +" S/o "+fd.fatherName:fd.name +" D/o "+fd.fatherName}</Text>
                            <Text style={[styles.infoLabel, { marginLeft: 20 }]}>Age/Sex:</Text>
                            <Text style={styles.infoValue}>{formData.ageSex || ''}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Admission:</Text>
                            <Text style={styles.infoValue}>{formatDate(formData.admissionDate)}</Text>
                            <Text style={[styles.infoLabel, { marginLeft: 20 }]}>Date of Discharge:</Text>
                            <Text style={styles.infoValue}>{formatDate(formData.dischargeDate)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Issue:</Text>
                            <Text style={styles.infoValue}>{formatDate(formData.issueDate)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Diagnosis:</Text>
                            <Text style={styles.infoValue}>{formData.diagnosis || ''}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tableContainer}>
                    {/* <View style={styles.blankTableHeader} /> */}

                    <View style={styles.tableRowfull}>
                            <Text style={[styles.tableCell, styles.cellSNo]}>Sno.</Text>
                            <Text style={[styles.tableCell, styles.cellDescription]}>Particular</Text>
                            <Text style={[styles.tableCell, styles.cellRateRs]}>
                                Rate
                            </Text>
                            <Text style={[styles.tableCell, styles.cellX]}>
                                
                            </Text>
                            <Text style={[styles.tableCell, styles.cellDay]}>
                                Day(s) / Qty
                            </Text>
                            <Text style={[styles.tableCell, styles.cellTotalRs]}>
                                Amount
                            </Text>
                        </View>

                    {formData.list.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.cellSNo]}>{item.name ? `${index + 1}.` : ''}</Text>
                            <Text style={[styles.tableCell, styles.cellDescription]}>{item.name}</Text>
                            <Text style={[styles.tableCell, styles.cellRateRs]}>
                                {item.rate && (parseFloat(item.rate) || 0) !== 0 ? `Rs ${formatNumber(item.rate)} ` : ''}
                            </Text>
                            <Text style={[styles.tableCell, styles.cellX]}>
                                { item.rate && item.days && (parseFloat(item.rate) || 0) !== 0 && (parseFloat(item.days) || 0) !== 0 ? 'X' : ''}
                            </Text>
                            <Text style={[styles.tableCell, styles.cellDay]}>
                                {item.days && item.rate && (parseFloat(item.rate) || 0) !== 0 && (parseFloat(item.days) || 0) !== 0 ? `${item.days} ${item.type==='Qw'?`Qty`:`Day(s)`}` : ''}
                            </Text>
                            <Text style={[styles.tableCell, styles.cellTotalRs]}>
                                {(parseFloat(item.rate) || 0) !== 0 ? `Rs ${getTotal(item.rate, item.days)} ` : ''}
                            </Text>
                        </View>
                    ))}

                { formData.discount>0&&<> <View style={styles.discountrow}>
                        <Text style={styles.totalBillLabel}>Total</Text>
                        <Text style={styles.totalBillAmount}>Rs {total()}</Text>
                    </View>
                    <View style={styles.discountrow}>
                        <Text style={styles.totalBillLabel}>Discount</Text>
                        <Text style={styles.totalBillAmount}>Rs {formData.discount}</Text>
                    </View></>  }

                    <View style={styles.totalBillRow}>
                        <Text style={styles.totalBillLabel}>Total Bill</Text>
                        <Text style={styles.totalBillAmount}>Rs {formData.discount>0?(total()-formData.discount).toFixed(2):total()}</Text>
                    </View>
                </View>

                <View style={styles.footerSectionBox}>
                    <Text style={styles.receiptNote}>
                        Received against receipt No: <Text style={styles.receiptNoValue}>{formData.billNo || '__________'}</Text>
                    </Text>
                    <View style={styles.authorisedSignatoryContainer}>
                        <Image
                                    src={imgs} // <-- yahan aap apna signature image path den
                                    style={styles.signatureImage}
                                  />
                        <Text style={styles.authorisedSignatoryText}>Authorised Signatory</Text>
                    </View>
                    <Text style={styles.bottomNote}>Subject to Bathinda Jurisdiction Only</Text>
                </View>
            </Page>
        </Document>
    );
};

export default DoctorBillPDF;