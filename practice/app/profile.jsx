import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Profile() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text>profile page,  new setting page</Text>
    
    </View>
  );
}

 //<Link href="/about"><Text>About</Text></Link>