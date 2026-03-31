import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Explore() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text>Explore page,  NEW  dashboaed page</Text>
      <Link href="/about"><Text>About</Text></Link>
    </View>
  );
}
