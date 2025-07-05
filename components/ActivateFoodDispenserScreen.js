import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import axios from 'axios';

const ActivateFoodDispenserScreen = ({ navigation }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToESP32 = async () => {
    try {
      setStatus("Connecting to ESP32...");
      setIsConnecting(true);
      
      // Direct connection without location check
      await WifiManager.connectToProtectedSSID("ESP32_Setup", "12345678", true);
      
      setStatus("Connected to ESP32 AP");
      return true;
    } catch (error) {
      setStatus("Failed to connect to ESP32: " + error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const sendCredentialsToESP32 = async () => {
    try {
      setStatus("Sending Wi-Fi credentials to ESP32...");
      const response = await axios.post(
        "http://192.168.4.1/credentials", 
        { ssid, password },
        { timeout: 15000 }
      );
  
      if (response.data === "Connected") {
        setStatus("Food Dispenser Connected to Wi-Fi ✅");
        Alert.alert("Success", "Device connected successfully!");
        navigation.navigate('Pair Iot');
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      setStatus("Failed to send credentials: " + error.message);
      Alert.alert(
        "Error", 
        "Failed to communicate with device. Please:\n\n1. Stay close to the device\n2. Ensure ESP32 is in setup mode\n3. Try again"
      );
    }
  };

  const handleProvision = async () => {
    if (ssid.trim() === '' || password.trim() === '') {
      setErrorModalVisible(true);
      return;
    }

    if (isConnecting) return;

    const connected = await connectToESP32();
    if (connected) {
      // Wait for connection to stabilize
      setTimeout(sendCredentialsToESP32, 2000);
    }
  };

  const closeErrorModal = () => setErrorModalVisible(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => !isConnecting && navigation.goBack()}>
        <Image source={require('../assets/back.png')} style={styles.back} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Let's activate your Food Dispenser</Text>
        <Text style={styles.subtitle}>
          Ensure the dispenser is powered on and in setup mode
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Wi-Fi Network Name (SSID)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Wi-Fi name"
            placeholderTextColor="#777777"
            value={ssid}
            onChangeText={setSsid}
            editable={!isConnecting}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Wi-Fi Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Wi-Fi password"
            placeholderTextColor="#777777"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isConnecting}
          />
        </View>

        <Image
          source={require('../assets/128.png')}
          style={styles.dispenserImage}
          resizeMode="contain"
        />

        <TouchableOpacity 
          style={[styles.pairButton, isConnecting && styles.disabledButton]}
          onPress={handleProvision}
          disabled={isConnecting}
        >
          <Text style={styles.pairButtonText}>
            {isConnecting ? "Connecting..." : "Pair Device"}
          </Text>
        </TouchableOpacity>

        {!!status && <Text style={styles.statusText}>{status}</Text>}
      </View>

      <Modal transparent visible={errorModalVisible} animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Missing Information</Text>
            <Text style={styles.alertMessage}>
              Please enter both your Wi-Fi network name and password to continue.
            </Text>
            <TouchableOpacity 
              style={styles.alertButton} 
              onPress={closeErrorModal}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0cfc7',
    
  },
  content: {
    flex: 1,
    backgroundColor: '#e0cfc7',
    padding: 20,
    marginTop:0,
    alignItems: 'center',
  },
  back: {
    width: 20,
    height: 20,
    marginRight: 25,
    marginTop: 30,
    marginLeft: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 7,
    marginRight: 70,
  },
  subtitle: {
    fontSize: 14,
    color: 'black',
    marginBottom: 30,
    marginRight: 100,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    color: 'black',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  dispenserImage: {
    width: 400,
    height: 350,
    marginBottom: 30,
  },
  pairButton: {
    backgroundColor: '#6c4b3c',
    borderRadius: 30,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 45,
    marginLeft: 200,
  },
  pairButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  alertButton: {
    borderRadius: 10,
    marginTop: -10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 200,
  },
  alertButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
    disabledButton: {
    backgroundColor: '#9e9e9e',
  },
  statusText: {
    marginTop: 15,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
export default ActivateFoodDispenserScreen;
