
mkdir -p ~/PassVaultApp/assets && cd ~/PassVaultApp

# 2. Create placeholder assets
touch assets/icon.png assets/adaptive-icon.png assets/splash.png assets/favicon.png

# 3. Create App.js
cat > App.js << 'EOF'
import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, Alert, StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [data, setData] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    const init = async () => {
      const savedMaster = await AsyncStorage.getItem("MASTER_PASSWORD");
      if (!savedMaster) await AsyncStorage.setItem("MASTER_PASSWORD", "1234");
      setMasterPassword(savedMaster || "1234");

      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Unlock PassVault",
          });
          if (result.success) {
            loadData();
            setUnlocked(true);
          }
        }
      }
    };
    init();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem("DATA");
    if (stored) setData(JSON.parse(stored));
  };

  const saveData = async (newData) => {
    setData(newData);
    await AsyncStorage.setItem("DATA", JSON.stringify(newData));
  };

  const handleUnlock = () => {
    if (inputPassword === masterPassword) {
      loadData();
      setUnlocked(true);
    } else {
      Alert.alert("Wrong Password", "Try again.");
    }
  };

  const addEntry = () => {
    if (!newTitle || !newValue) { Alert.alert("Missing Fields", "Enter both title and value."); return; }
    const newData = [...data, { id: Date.now().toString(), title: newTitle, value: newValue }];
    saveData(newData);
    setNewTitle(""); setNewValue("");
  };

  const deleteEntry = (id) => {
    const filtered = data.filter((item) => item.id !== id);
    saveData(filtered);
  };

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>🔐 PassVault</Text>
        <TextInput secureTextEntry placeholder="Enter Master Password" value={inputPassword} onChangeText={setInputPassword} style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={handleUnlock}><Text style={styles.buttonText}>Unlock</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📂 Your Vault</Text>
      <View style={styles.row}>
        <TextInput placeholder="Title (e.g. Gmail)" value={newTitle} onChangeText={setNewTitle} style={styles.input} />
        <TextInput placeholder="Password/Document" value={newValue} onChangeText={setNewValue} style={styles.input} />
      </View>
      <TouchableOpacity style={styles.button} onPress={addEntry}><Text style={styles.buttonText}>Add Entry</Text></TouchableOpacity>
      <FlatList data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardValue}>{item.value}</Text>
          <TouchableOpacity onPress={() => deleteEntry(item.id)}><Text style={styles.deleteText}>🗑 Delete</Text></TouchableOpacity>
        </View>
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:"#f9f9f9" },
  title:{ fontSize:24,fontWeight:"bold",textAlign:"center",marginBottom:20 },
  input:{ borderWidth:1,borderColor:"#ccc",padding:10,borderRadius:10,marginBottom:10,flex:1 },
  button:{ backgroundColor:"#007bff",padding:15,borderRadius:10,alignItems:"center",marginBottom:15 },
  buttonText:{ color:"white", fontWeight:"bold" },
  row:{ flexDirection:"row", gap:10 },
  card:{ backgroundColor:"white", padding:15, borderRadius:10, marginBottom:10, shadowColor:"#000", shadowOpacity:0.1, shadowRadius:5, elevation:2 },
  cardTitle:{ fontSize:18,fontWeight:"bold" },
  cardValue:{ fontSize:16,marginVertical:5 },
  deleteText:{ color:"red", marginTop:5 }
});
EOF

# 4. Create package.json
cat > package.json << 'EOF'
{
  "name": "PassVaultApp",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "~1.21.0",
    "expo": "~51.0.0",
    "expo-local-authentication": "~13.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.74.1",
    "react-native-web": "~0.19.10"
  },
  "private": true
}
EOF

# 5. Create babel.config.js
cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
EOF

# 6. Create app.json
cat > app.json << 'EOF'
{
  "expo": {
    "name": "PassVaultApp",
    "slug": "PassVaultApp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#ffffff" },
    "assetBundlePatterns": ["**/*"],
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#ffffff" } },
    "web": { "favicon": "./assets/favicon.png" }
  }
}
EOF


git init
git add .
git commit -m "Initial commit - Full PassVault App"
git branch -M main
git remote add origin 
https://github.com/Kaushik0236/VaultApp.