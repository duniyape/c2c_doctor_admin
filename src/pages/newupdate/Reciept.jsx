import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image
} from "@react-pdf/renderer";
import imgs from '../../assets/sign.png'
// Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: "Helvetica",
    color:'#2B32A6'
  },
  borderBox: {
    border: "1pt solid #2B32A6",
    padding: 15,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 36,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  receiptBox: {
    marginVertical: 8,
    border: "1pt solid #2B32A6",
    borderRadius: 10,
    padding: 4,
    alignSelf: "center",
  },
  receiptText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    fontWeight:'bold'
  },
  label: {
    fontWeight: "bold",
    // borderBottom: "1pt dotted #2B32A6",
    marginVertical: 15,
  },
  label1: {
    fontWeight: "bold",
    borderBottom: "1pt dotted #2B32A6",
    // marginVertical: 15,
  },
  dottedLine: {
    borderBottom: "1pt dotted #2B32A6",
    // marginVertical: 15,
    height: 50,
  },
  rsBox: {
    flexDirection: "row",
    marginTop: 20,
    width:200,
  },
  rsLabel: {
    backgroundColor: "#2B32A6",
    color: "white",
    fontWeight: "bold",
    padding: 4,
    width: 40,
    textAlign: "center",
    padding:15
  },
  rsValue: {
    border: "1pt solid #2B32A6",
    flexGrow: 1,
    textAlign: "center",
    padding: 10,
    fontSize:18,
    color:'black',
    fontStyle:'italic'
  },
  footer: {
    // marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signature: {
    fontWeight: "bold",
  },
  signatureImage: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  },
});





// PDF Document
const Reciept = (props) => (

  
//   <PDFViewer>
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.borderBox}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.hospitalName}>
              KALRA MULTI SPECIALTY HOSPITAL
            </Text>
            <Text style={styles.subText}>Ajit Road, Bathinda</Text>
            <Text style={styles.subText}>
              Dr Neeraj Bansal, Pediatrics Department
            </Text>
            <View style={styles.receiptBox}>
              <Text style={styles.receiptText}>( INDOOR RECEIPT )</Text>
            </View>
          </View>

          {/* S.no and Date */}
          <View style={styles.row}>
            <Text>S no. <Text style={{fontSize:16,color:'black', fontStyle:'italic', fontWeight:200}}>{props.s.id}</Text></Text>
            <Text>Date : <Text style={{fontSize:16,color:'black', fontStyle:'italic', fontWeight:200}}>{props.s.date}</Text></Text>
          </View>

          {/* Patient Name */}
          <Text style={styles.label1}>Name of Patient : <Text style={{fontSize:18,color:'black', fontStyle:'italic', fontWeight:200}}>{props.s.name}</Text></Text>
          <View style={styles.dottedLine}><Text style={{fontSize:18,color:'black', fontStyle:'italic', fontWeight:200,marginTop:28}}>{props.s.sex==='Male'?'S/o':'D/o'} {props.s.fatherName}</Text></View>
          <View style={styles.dottedLine} />

          {/* Rs Section */}
          <View style={styles.rsBox}>
            <Text style={styles.rsLabel}>Rs.</Text>
            <Text style={styles.rsValue}>{props.s.amount}/-</Text>
          </View>

          {/* Footer Signature */}
          <View style={styles.footer}>
            <Image
            src={imgs} // <-- yahan aap apna signature image path den
            style={styles.signatureImage}
          />
            {/* <Text style={styles.signature}>Signature</Text> */}
          </View>
          <View style={styles.footer}>
      
            <Text style={styles.signature}>Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
//   </PDFViewer>

);

export default Reciept;