import React, {useEffect, useState} from 'react';
import { Text, View, style } from "react-native";
import { FlatList, ScrollView } from 'react-native-gesture-handler';


export default function Index() {
  const [Data, SetData] = useState([]);

const getAPIData = async () => {
       const url = "https://jsonplaceholder.typicode.com/posts";
       let result = await fetch(url);
       result = await result.json();
       console.warn(result);
       SetData(result);
}
    useEffect(() => {
       getAPIData();
    },[])


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text>Home</Text>
      <Text>List With API Call</Text>
      {
        Data.length ? 
        <FlatList 
        data = {Data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => ( <ScrollView style = {{borderBottomColor: "orange", padding: 10, borderBottomWidth: 5}}>
        <Text style = {{fontSize: 15}}>{item.id}</Text>
        <Text style = {{fontSize: 10}}>{item.tittle}</Text>
        <Text style = {{fontSize: 10}}>{item.body}</Text>
        </ScrollView>
        )
        }
        />
        :
        null
      }
       </View>
    
  );   
}
  //{ <Link href="/about"><Text>About</Text></Link>}
  // similarily you can call name etc
  /*For a Single post;
  <Text>{Data.id}</Text>*/

  /*  for list
  Data.map((item)=> <View key = {item.id}>
          <Text>{item.tittle}</Text>
          <Text>{item.id}</Text>  */