import {View, Text, Pressable, TextInput, StyleSheet} from "react-native";
import {useState} from "react";
import { useRouter } from "expo-router";

export default function ForgetPassword() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async () => {
        if(!email || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if(newPassword !== confirmPassword){
            setError("New password and confirm password do not match");
            return;
        }
        
        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({
                    email: email,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();

            if(res.status === 200){
                router.replace("/login");
                return;
            }

            setError(data.message || "Failed to reset Password");
        }catch(_error){
            setError("Network error try again");
        };
    }
    return(
        <View style = {Styles.container}>
            <View style = {Styles.card}>
                <Text style = {Styles.title}>Reset Password</Text>

                <TextInput 
                style={Styles.input}
                placeholder="Enter your Email on this site"
                value = {email}
                onChangeText={setEmail}
                />

                <TextInput
                style={Styles.input}
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={setNewPassword}
                />

                <TextInput 
                style={Styles.input}
                placeholder="confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                />

                {error ? <Text style = {Styles.errorText}>{error}</Text> : null}

                <Pressable style = {Styles.button} onPress={handleChangePassword}>
                    <Text style = {Styles.buttonText}>Change Password</Text>
                </Pressable>
            </View>
        </View>
    );
}
    const Styles = StyleSheet.create({
        container:{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: "#F1F5F9"
        },

        card: {
            width: "50%",
            padding: 30,
            borderRadius: 16,
            backgroundColor: "#F8FAFC",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: {width: 0, height: 6},
            shadowRadius: 12,
            elevation: 8,
        },

        title: {
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 30,
            color: "#1E293B"
        },

        input: {
            width: "80%",
            height: 50,
            borderWidth: 1.5,
            borderColor: "#CBD5E1",
            borderRadius: 10,
            paddingHorizontal: 14,
            margingBottom: 15,
            backgroundColor: "#fff",
            margin: 10
        },

        errorText: {
            color: "#DC2626",
            marginBottom: 15,
            fontWeight: 600
        },

        button: {
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 10,
        },

        buttonText:{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600"
        },
    })
