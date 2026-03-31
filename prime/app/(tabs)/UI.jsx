import { StyleSheet, Text, View } from 'react-native';
import {Link} from 'expo-router';
import { Pressable } from 'react-native-web';
import * as DocumentPicker from "expo-document-picker";
import { useState } from 'react';

const UI = () => {
     
    const[selectedFile, setSelectedFile] = useState(null);
    const[isProcessing, setIsProcessing] = useState(null);
    const[generatedurl, setGeneratedurl] = useState(null);
    const[status, setStatus] = useState(null);
    const[statusMessage, setStatusMessage] = useState(" ");

    const handleSelectAndUpload = async () => {
  try {
    
    const result = await DocumentPicker.getDocumentAsync({
  type: [
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
    "application/vnd.ms-excel", 
    "text/csv" 
  ],
});

    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      alert("No file selected");
      return;
    }

    const file = result.assets[0];
    setSelectedFile(file);
    console.log("📄 Selected File:", file.name);

   const fileBlob = await fetch(file.uri).then(res => res.blob()); 
   const formData = new FormData();

   formData.append("pdfFile", fileBlob, file.name);

    setIsProcessing(true);
    const response = await fetch("http://127.0.0.1:5000/api/infographic/create", {
      method: "POST",
      body: formData,
    });

    const resultData = await response.json();
    console.log("✅ Upload success:", resultData);

    if (response.ok) {
      setGeneratedurl(`http://127.0.0.1:5000/api/infographic/download/${resultData.infographicId}`);
      setStatus("success");
      setStatusMessage("✅ Infographic generated successfully!");
    } else {
      setStatus("error");
      setStatusMessage(resultData.message || "⚠️ Upload failed.");
    }
  } catch (error) {
    console.error("❌ Upload error:", error);
    setStatus("error");
    setStatusMessage("An error occurred during upload.");
  } finally {
    setIsProcessing(false);
  }
};

return (
    <View style = {styles.out}>

        <View style={styles.topRightButtons}>
  <Link href="/login" asChild>
    <Pressable style={styles.loginBtn}>
      <Text style={styles.loginText}>Login</Text>
    </Pressable>
  </Link>

  <Link href="/signup" asChild>
    <Pressable style={styles.signupBtn}>
      <Text style={styles.signupText}>Sign Up</Text>
    </Pressable>
  </Link>
</View>

      

        <Text style = {styles.tittle}>Prime</Text>
        <View style = {styles.in}>

            {/*<Text style={styles.PlaceholderText}>upload your pdf here</Text>*/}
            {!generatedurl ? (
            <Pressable
            style = {[styles.uploadButton, {backgroundColor : isProcessing ? "#93C5FD" : "#2563EB"}]}
            onPress={handleSelectAndUpload}
            disabled = {isProcessing}
            >
            <Text style = {styles.uploadButtonText}> 
                {isProcessing? "processing.." : "Upload PDF"}
            </Text>
            </Pressable>
            ) : (
                <Pressable 
                style = {styles.downloadButton}
                onPress={() => {
                const link = document.createElement("a");
                link.href = generatedurl;
                link.download = "infographic.pdf"; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
                >
                    <Text style = {styles.downloadButtonText}>📥 Download Infographic</Text>
                </Pressable>
            )}

            {selectedFile && (
                <Text style={styles.fileName}>📄 {selectedFile.name}</Text>
            )}

            {status === "success" && (
  <Text style={styles.successMessage}>✅ File is ready for download!</Text>
)}

{status === "error" && (
  <Text style={styles.errorMessage}>❌ {statusMessage}</Text>
)}


        </View>
        
    </View>
)
}

const styles = StyleSheet.create({
    out: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 20,
    },

    topRightButtons: {
  position: "absolute",
  top: 20,
  right: 20,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  zIndex: 100,
},

loginBtn: {
  borderWidth: 1.5,
  borderColor: "#2563EB",
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 8,
},

loginText: {
  color: "#2563EB",
  fontWeight: "600",
  fontSize: 14,
},

signupBtn: {
  backgroundColor: "#2563EB",
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 8,
  shadowColor: "#2563EB",
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 3,
},

signupText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 14,
},



    in:{
        width: '70%',
        height: 220,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderColor: '#CBD5E1',
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        shadowColor: '#000',
        shadowOffset: {width:0, height:3},
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6
    },
    tittle: {
        fontSize: 42,
        fontWeight: 700,
        color:'#1E293B',
        marginBottom: 100,
        letterSpacing: 1,
        textTransform: 'uppercase',      
    },

    butt: {
      flexDirection: 'row',
      gap: 25,
      color: '#39FF14',
      fontWeight: 'bold',
      width: '100%',
      marginTop: 75,
    },
    
    icon: {
       backgroundColor: '#2563EB',
       borderRadius: 8,
       paddingVertical: 12,
       paddingHorizontal: 30,
       justifyContent: 'center',
       alignItems: 'center',
       shadowColor: '#000',
       shadowOffset: {width: 0, height: 2},
       shadowOpacity: 0.15,
       shadowRadius: 4,
       elevation: 5,
    },

    buttontext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom:25,
    fontWeight: '500'
    },

    PlaceholderText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 500,
    },

    uploadButton:{
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },

    uploadButtonText: {
        color: "#ffff",
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: 0.3,
    },

    fileName: {
        marginTop: 10,
        color: "#334155",
        fontSize: 14,
        fontStyle: 'italic'
    },

    downloadButton: {
        backgroundColor: "#22C55E",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        marginTop: 10,
    },

    downloadButtonText: {
        color: '#fff',
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: 0.3,
    },

    successMessage: {
  color: "#16A34A", // green
  fontSize: 16,
  marginTop: 15,
  fontWeight: "600",
},

errorMessage: {
  color: "#DC2626", // red
  fontSize: 16,
  marginTop: 15,
  fontWeight: "600",
},


})

export default UI;