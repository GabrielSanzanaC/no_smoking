import React from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router'; // Importa useRouter

export default function ProfileScreen() {
  const router = useRouter(); // Obtén el router con useRouter

  // Mueve handleGoogleContinue dentro del componente
  const handleGoogleContinue = () => {
    router.push("./dailyQuestionP1"); // Navega a la pantalla
  };
  const historialContinue = () => {
    router.push("./historial"); // Navega a la pantalla
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Ionicons name="settings-outline" size={24} color="white" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={historialContinue}>
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Card */}
      <View style={styles.card}>
        <Image
          source={{ uri: "https://example.com/user.jpg" }} // Reemplázalo con tu imagen
          style={styles.profileImage}
        />
        <Text style={styles.cardText}>
          Hi John! Don’t take sleep so seriously. Ease into naptime or bedtime with a moment of stillness.
        </Text>
        <Text style={styles.cardDate}>Jul 7</Text>
      </View>

      {/* Statistics Section */}
      <View style={styles.statistics}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Mindful Day</Text>
            <Text style={styles.statValue}>1</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Mindful Minutes</Text>
            <Text style={styles.statValue}>1h24m</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Sessions</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Longest Streak</Text>
            <Text style={styles.statValue}>1 day</Text>
          </View>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={28} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGoogleContinue}>
          <Ionicons name="chatbox-ellipses-outline" size={28} color="white" />
          <Text style={styles.navText}>Daily Question</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={28} color="white" />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#071E50",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#071E50",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#0C2B80",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    color: "white",
    fontSize: 14,
  },
  activeTabText: {
    color: "#0C2B80",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1F3A93",
    margin: 20,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  cardText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  cardDate: {
    color: "#B0C4DE",
    fontSize: 12,
  },
  statistics: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: "#1F3A93",
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 12,
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#0C2B80",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
});
