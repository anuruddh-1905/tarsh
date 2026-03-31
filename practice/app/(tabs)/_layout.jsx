import { Background } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { Pressable, Text, Alert, Image} from "react-native"; 
import { HoverEffect } from "react-native-gesture-handler";
import {Tabs} from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
/*function LogoTittle() {
  return(
    <Image 
    style = {{height: 30, width: 30}}
    source={{uri: "https://reactnative.dev/img/tiny_logo.png"}}
    />
  );
}

export default function RootLayout() {
  return(
    <Stack
    screenOptions={{
headerStyle: {backgroundColor: '#6a51ae'},
    headerRight: () => (
      <Pressable onPress = {() => Alert.alert("Menu Button Pressed!")}>
      <Text style = {{color: '#fff', fontSize: 16}}>Menu</Text>
      </Pressable>
    ),
    headerTitle: (props) =>  <LogoTittle {...props}/>,
    //headerTitleAlign: 'center',
    }}
    >
     <Stack.Screen name = "index" 
     options = {{title: "HOME",}}
    />
     <Stack.Screen name = "about" options = {{title: "ABOUT"}}/>
     </Stack>
  );
}*/

export default function RootLayout() {
  return (
    <Tabs
    screenOptions={{}}>
      <Tabs.Screen name="index" options={{tittle: "Home", tabBarIcon: ({color}) => (
        <FontAwesome name="home" color = {color} Size = {24}/>
      )}}/>
      <Tabs.Screen name="about" options={{tittle: "about", tabBarIcon: ({color}) => (
        <FontAwesome name="bars" color = {color} Size = {24}/>
      )}}/>
      <Tabs.Screen name="Explore" options={{tittle: "Explore", tabBarIcon: ({color}) => (
        <FontAwesome name="search" color = {color} Size = {24}/>
      )}}/>
      <Tabs.Screen name="profile" options={{tittle: "profile", tabBarIcon: ({color}) => (
        <FontAwesome name="user" color = {color} Size = {24}/>
      )}}/>
    </Tabs>
  );
}//  in the screenoptions edit the header and lower side of app and all the styling will be applied equially on every page
