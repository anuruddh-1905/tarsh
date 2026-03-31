import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import {Link} from "expo-router";
import {useState} from 'react';


export default function Login(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailValid, setEmailValid] = useState(null);
    const [passwordValid, setPasswordValid] = useState(null);
    const [serverError, setServerError] = useState(null);



    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    const validEmail = (text) => {
        setEmail(text);
        setEmailValid(emailRegex.test(text))
    }
    const validPassword = (text) => {
        setPassword(text);
        setPasswordValid(text.length >= 4);
    }

    async function handleLogin(){
        if(!emailValid || !passwordValid){
            setServerError("please enter valid details");
            return;
        }

        try{
            const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({email, password}),
            });

            const data = await res.json();

            if(res.status === 200){
                window.location.href = "\UI";
                return;
            }

            if(res.status === 401){
                setServerError("invalid email or password");
                return;
            }

            setServerError(data.message || "Login Failed");
        }catch(_error){
            setServerError("Network error.  Try again");
            
        }
    }

    return(
        <View style = {Styles.container}>

            <View style = {Styles.glassCard}>
            <Text style={Styles.title}>Login</Text>

            <TextInput style = {[Styles.input ,  emailValid == null? null : emailValid ? Styles.Validinput : Styles.invalidinput]}
            placeholder='Email'
            value={email}
            onChangeText={validEmail}
            />

            <TextInput style = {[Styles.input,  passwordValid == null? null : passwordValid ? Styles.Validinput : Styles.invalidinput]}
            placeholder='Password'
            value={password}
            onChangeText={validPassword}
            />

            <Link href="/forgetpassword" asChild>
            <Pressable style={Styles.forgotBtn}>
            <Text style={Styles.forgotText}>Forgot Password?</Text>
            </Pressable>
            </Link>

            <Pressable style={Styles.loginBtn} onPress = {handleLogin}>
                <Text style={Styles.loginText}>Login</Text>
            </Pressable>

            {serverError && (
                <Text style = {{marginTop: 10, color: "red"}}>
                    {serverError}
                </Text>
            )}
           </View>
        </View>
    );
}

const Styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: "#F1F5F9",
    },

    title:{
        fontSize: 32,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 40,
    },

    input: {
        width: "80%",
        height: 55,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        paddingHorizontal: 15,
        marginVertical: 10,
        fontSize: 16
    },

    Validinput:{
        borderColor: "green",
    },

    invalidinput: {
        borderColor: "red",
    },

    forgotText: {
        color: "#2563EB",
        fontWeight: "600",
        fontSize: 14,
        letterSpacing: 0.3,
    },

    forgotBtn:{
        alignSelf: "flex-end",
        marginRight: "10%",
        marginBottom: 20,
        backgroundColor: "#E2E8F0",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height:2},
        shadowRadius: 4,
        elevation: 3
    },

    loginBtn:{
        alignSelf: "auto",
        marginRight: "10%",
        marginBottom: 20,
        backgroundColor: "#E2E8F0",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height:2},
        shadowRadius: 4,
        elevation: 3
    },

    loginText:{
        color: "#2563EB",
        fontSize: 18,
        fontWeight: "600",
    },

    glassCard:{
        width:"50%",
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 8},
        shadowRadius: 20,
        elevation: 10,
    }
});