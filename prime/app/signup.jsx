import { Link } from "expo-router";
import { Button, StyleSheet, Text, TextInput, View, Alert} from 'react-native';
import { BlurView} from "expo-blur";
import  {useState} from "react";
//import { useEffect } from 'react';
//import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ImageBackground, Pressable } from "react-native-web";

const App = () =>{

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    const [name, setName] = useState("");
        const [nameVerify, setNameVerify] = useState(false);
    
        const [email, setEmail] = useState("");
        const [emailVerify, setEmailVerify] = useState(false);
    
        const [password, setPassword] = useState("");
        const [passwordVerify, setPasswordVerify] = useState(false);

        const [serverError, setServerError] = useState("");
    
        function handleName(text) {
            setName(text);
            if(text.length >= 3 && text.length <= 20){
                setNameVerify(true);
            }
            else{
                setNameVerify(false);
            }
        }

        function handlePassword(text){
            setPassword(text);

            const hasUpperCase = /[A-Z]/.test(text);
            const hasLowerCase = /[a-z]/.test(text);
            const hasNumber =  /[0-9]/.test(text);
             const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(text);
            
            if(password.length >= 4 &&
                hasUpperCase &&
                hasLowerCase &&
                hasNumber &&
                hasSpecialChar
            ) {
                setPasswordVerify(true);
            } 
            else {
                setPasswordVerify(false);
                Alert.alert("password must cantain uppercase, lowercase, number and specialchar");
            }
        }
        function handleEmail(text){
            setEmail(text);
            if(emailRegex.test(text)){
                setEmailVerify(true);
            }
            else{
                setEmailVerify(false);
            }
        }

        async function handleSignUp(){
            console.log("signup btn pressed");
            if(!emailVerify || !passwordVerify || !nameVerify){
                alert("please enter valid details");
                return;
            }

            try{
                const res = await fetch("http://127.0.0.1:5000/api/auth/signup", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        username: name,
                        email: email,
                        password: password
                    }),
                })

                const data = await res.json();
                
                if(res.status === 201){
                    window.location.href = "/UI";
                    return;
                }
                if(res.status === 409){
                    setServerError("Account Already Exist");
                    return;
                }

                //Any other error
                setServerError(data.message || "Sign up failed");

            }catch(error){
                console.log("Sign up error", error);
                setServerError("Network error try again");
            }
        }

       /* useEffect(() = {
          GoogleSignin.configure({
            iosClientId: "435868451228-hoftgst2bengto33pr1dtt8jlrcb2ufo.apps.googleusercontent.com",
            webClientId: "435868451228-t3fnl5795qu3v16oog6nia6p5kqngfss.apps.googleusercontent.com",

            profileImageSize: 150,
          })
        })
*/
    return(
        <View style={styles.container}>
        <ImageBackground 
        style = {styles.background}
        blurRadius = {10}
        >
            <BlurView intensity={70} tint = "light" style = {styles.glassCard}>
            <Text style = {styles.subText}>
                Sign up to explore your infographics dashboard
            </Text>
            {/*<Text style={styles.title}>Welcome to Prime</Text>*/}

            <TextInput 
            style = {[styles.input, name.length < 1? null : nameVerify ? styles.validInput : styles.invalidInput]}
            placeholder="usename"
            placeholderTextColor="rgba(0,0,0,0.5)"
            onChangeText={handleName}
            value={name}
            />
            <TextInput 
            style = {[styles.input, email.length < 1? null: emailVerify ? styles.validInput : styles.invalidInput]}
            placeholder="Email"
            placeholderTextColor="rgba(0,0,0,0.5)"
            onChangeText={handleEmail}
            value={email}
            />
            <TextInput 
            style = {[styles.input, password.length < 1? null: passwordVerify? styles.validInput : styles.invalidInput]}
            placeholder="password"
            placeholderTextColor="rgba(0,0,0,0.5)"
            onChangeText={handlePassword}
            value={password}
            />

            <Pressable style={styles.signupBtn} onPress={handleSignUp}>
                <Text style={styles.signupText}>Sign Up</Text>
            </Pressable>

            {serverError && (
                <Text style = {{marginTop: 10, color: "red"}}>
                    {serverError}.{" "}
                    <Text
                    style = {{textDecorationLine: "underline"}}
                    onPress={() => window.location.href = "/login"}
                    >
                        Log in
                    </Text>
                </Text>
            )}

            </BlurView>
        </ImageBackground>
        </View>
    ) 
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#E0EAFC",
    },

    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
    },

    glassCard: {
        width: 490,
        height: 500,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#9ec5ff",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    heading: {
        fontSize: 28,
        color: "#fff",
        fontWeight: 700,
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: "f0f0f0",
        textAlign: 'center',
        width: "80%",
        marginBottom: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        color: "#1E1E1E",
        marginBottom: 10,
    },
    
    input: {
        width: 280,
        height: 45,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        marginVertical: 8,
        paddingHorizontal: 14,
        fontSize: 15,
        color: "#000",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 5,
        margin: 30,
    },
    validInput: {
        borderColor: "rgba(0, 200, 100, 0.6)",
    },
    invalidInput: {
        borderColor: "rgba(255, 0, 0, 0.6)"
    },
    signupBtn:{
        width: 100,
        paddingVertical: 10,
        backgroundColor: "#ebd348ff",
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    signupText:{
        color: "",
        fontSize: 18,
        fontWeight: "600",
    }
})

export default App;