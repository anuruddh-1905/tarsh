import { Link } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

const UI = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const theme = useMemo(
      () =>
        isDark
          ? {
              outBg: '#020617',
              title: '#F8FAFC',
              inBg: '#0F172A',
              inBorder: '#334155',
              fileName: '#94A3B8',
              loginBorder: '#38BDF8',
              loginText: '#38BDF8',
              signupBg: '#0284C7',
              signupShadow: '#0369A1',
              uploadIdle: '#2563EB',
              uploadBusy: '#64748B',
              uploadText: '#ffffff',
              success: '#4ADE80',
              error: '#F87171',
            }
          : {
              outBg: '#F1F5F9',
              title: '#1E293B',
              inBg: '#F8FAFC',
              inBorder: '#CBD5E1',
              fileName: '#334155',
              loginBorder: '#2563EB',
              loginText: '#2563EB',
              signupBg: '#2563EB',
              signupShadow: '#2563EB',
              uploadIdle: '#2563EB',
              uploadBusy: '#93C5FD',
              uploadText: '#ffffff',
              success: '#16A34A',
              error: '#DC2626',
            },
      [isDark],
    );

    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedurl, setGeneratedurl] = useState(null);
    const [status, setStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState(' ');

    const composed = useMemo(
      () => ({
        out: StyleSheet.flatten([
          styles.out,
          { backgroundColor: theme.outBg },
        ]),
        topRightButtons: StyleSheet.flatten([styles.topRightButtons]),
        loginBtn: StyleSheet.flatten([
          styles.loginBtn,
          { borderColor: theme.loginBorder },
        ]),
        loginText: StyleSheet.flatten([
          styles.loginText,
          { color: theme.loginText },
        ]),
        signupBtn: StyleSheet.flatten([
          styles.signupBtn,
          {
            backgroundColor: theme.signupBg,
            shadowColor: theme.signupShadow,
          },
        ]),
        title: StyleSheet.flatten([
          styles.tittle,
          { color: theme.title },
        ]),
        in: StyleSheet.flatten([
          styles.in,
          {
            backgroundColor: theme.inBg,
            borderColor: theme.inBorder,
          },
        ]),
        uploadButton: StyleSheet.flatten([
          styles.uploadButton,
          {
            backgroundColor: isProcessing
              ? theme.uploadBusy
              : theme.uploadIdle,
          },
        ]),
        uploadButtonText: StyleSheet.flatten([
          styles.uploadButtonText,
          { color: theme.uploadText },
        ]),
        fileName: StyleSheet.flatten([
          styles.fileName,
          { color: theme.fileName },
        ]),
        successMessage: StyleSheet.flatten([
          styles.successMessage,
          { color: theme.success },
        ]),
        errorMessage: StyleSheet.flatten([
          styles.errorMessage,
          { color: theme.error },
        ]),
      }),
      [theme, isProcessing],
    );

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
    <View style={composed.out}>

        <View style={composed.topRightButtons}>
  <Link href="/login" asChild>
    <Pressable style={composed.loginBtn}>
      <Text style={composed.loginText}>Login</Text>
    </Pressable>
  </Link>

  <Link href="/signup" asChild>
    <Pressable style={composed.signupBtn}>
      <Text style={styles.signupText}>Sign Up</Text>
    </Pressable>
  </Link>
</View>

      

        <Text style={composed.title}>Prime</Text>
        <View style={composed.in}>

            {/*<Text style={styles.PlaceholderText}>upload your pdf here</Text>*/}
            {!generatedurl ? (
            <Pressable
            style={composed.uploadButton}
            onPress={handleSelectAndUpload}
            disabled={isProcessing}
            >
            <Text style={composed.uploadButtonText}> 
                {isProcessing ? 'processing..' : 'Upload PDF'}
            </Text>
            </Pressable>
            ) : (
                <Pressable 
                style={styles.downloadButton}
                onPress={() => {
                const link = document.createElement("a");
                link.href = generatedurl;
                link.download = "infographic.pdf"; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
                >
                    <Text style={styles.downloadButtonText}>📥 Download Infographic</Text>
                </Pressable>
            )}

            {selectedFile && (
                <Text style={composed.fileName}>📄 {selectedFile.name}</Text>
            )}

            {status === "success" && (
  <Text style={composed.successMessage}>✅ File is ready for download!</Text>
)}

{status === "error" && (
  <Text style={composed.errorMessage}>❌ {statusMessage}</Text>
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
        padding: 20,
    },

    topRightButtons: {
  position: 'absolute',
  top: 20,
  right: 20,
  flexDirection: 'row',
  alignItems: 'center',
  zIndex: 100,
},

loginBtn: {
  borderWidth: 1.5,
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginRight: 12,
},

loginText: {
  fontWeight: "600",
  fontSize: 14,
},

signupBtn: {
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 8,
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 3,
},

signupText: {
  color: '#ffffff',
  fontWeight: '600',
  fontSize: 14,
},



    in:{
        width: '70%',
        height: 220,
        borderRadius: 16,
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
        fontWeight: '700',
        marginBottom: 100,
        letterSpacing: 1,
        textTransform: 'uppercase',      
    },

    butt: {
      flexDirection: 'row',
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
    fontWeight: '500',
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
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    fileName: {
        marginTop: 10,
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
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    successMessage: {
  fontSize: 16,
  marginTop: 15,
  fontWeight: "600",
},

errorMessage: {
  fontSize: 16,
  marginTop: 15,
  fontWeight: "600",
},


})

export default UI;