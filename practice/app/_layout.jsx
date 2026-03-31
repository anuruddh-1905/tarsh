import { Background } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { Pressable, Text, Alert, Image} from "react-native"; 
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {Drawer} from "expo-router/drawer"
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

// TAB NAVIGATION

/*export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)"
      options={{
        headerShown: false
      }}
      />
    </Stack>
  )
}*/
 
export default function RootLayout () {
  return (
    <GestureHandlerRootView style = {{flex: 1}}>
      <Drawer 
      screenOptions={{

      }}
      >
        <Drawer.Screen
        name="Explore"
        options={{
          title: "Dashboard tittle",
          drawerLabel: "dashboard lable",
          drawerIcon: ({color}) => (
            <FontAwesome name="dashboard" size={24} color={color}/>
          ),
        }}
        />
        <Drawer.Screen
        name="profile"
        options={{
          title: "Seting tittle",
          drawerLabel: "seting lable",
          drawerIcon: ({color}) => (
            <FontAwesome name="cog" size={24} color={color}/>
          ),
        }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
// in the screen options custmize the heading and drawer as you want , color, font sizw,  visit the official docs