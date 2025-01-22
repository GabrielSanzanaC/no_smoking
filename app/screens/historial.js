import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig'; // Asegúrate de que la ruta sea correcta

const HistoryScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "usuarios", user.uid);
        const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

        const querySnapshot = await getDocs(cigarettesCollectionRef);
        const historyData = {};
        querySnapshot.forEach(doc => {
          const data = doc.data();
          historyData[data.fecha] = `Fumaste ${data.cigarettesSmoked} cigarrillos`;
        });
        setHistory(historyData);
      }
    };

    fetchHistory();
  }, [currentMonth, currentYear]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const getDaysArray = (month, year) => {
    const numDays = daysInMonth(month, year);
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderDay = (day) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = selectedDate === day;
    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayContainer, isSelected && styles.selectedDay]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={styles.dayText}>{day}</Text>
        {history[dateKey] && <Text style={styles.historyDot}>●</Text>}
      </TouchableOpacity>
    );
  };

  const handleNavigateToDashboard = () => {
    router.push('./ProfileScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab} onPress={handleNavigateToDashboard}>
          <Text style={styles.tabText}>Tablero</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Historial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        {getDaysArray(currentMonth, currentYear).map(renderDay)}
      </View>

      {selectedDate && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>
            Historial del {selectedDate}/{currentMonth + 1}/{currentYear}
          </Text>
          <Text style={styles.historyDetail}>
            {history[`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`] || 'No hay registros'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0F0F2D',
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
    flex: 1,
    alignItems: "center",
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
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 18,
    color: '#FFF',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayContainer: {
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F3A93',
    borderRadius: 5,
  },
  selectedDay: {
    backgroundColor: '#4F59FF',
  },
  dayText: {
    fontSize: 16,
    color: '#FFF',
  },
  historyDot: {
    fontSize: 10,
    color: '#FFF',
  },
  historyContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#33334D',
    borderRadius: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  historyDetail: {
    fontSize: 14,
    color: '#FFF',
  },
});

export default HistoryScreen;