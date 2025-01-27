import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig'; // Asegúrate de que la ruta sea correcta

const BackgroundCircles = () => {
  const circles = Array.from({ length: 15 }); // Aumentar la cantidad de círculos
  const circleRefs = useRef([]);

  useEffect(() => {
    const moveCircles = () => {
      circleRefs.current.forEach((circle) => {
        const randomX = Math.random() * 2 - 1; // Movimiento aleatorio en X
        const randomY = Math.random() * 2 - 1; // Movimiento aleatorio en Y
        const duration = Math.random() * 3000 + 2000; // Duración aleatoria entre 2000 y 5000 ms
        const moveAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(circle, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(circle, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ])
        );
        moveAnimation.start();
      });
    };

    moveCircles();
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      {circles.map((_, index) => {
        const circleAnimation = useRef(new Animated.Value(0)).current;
        circleRefs.current[index] = circleAnimation;

        const size = Math.random() * 50 + 50; // Tamaño aleatorio entre 50 y 100
        const opacity = Math.random() * 0.5 + 0.3; // Opacidad aleatoria entre 0.3 y 0.8
        const color = `rgba(7, 32, 64, ${opacity})`;

        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                backgroundColor: color,
                borderColor: '#ffffff', // Borde blanco
                borderWidth: 2, // Ancho del borde
                shadowColor: '#000', // Sombra
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                transform: [
                  {
                    translateX: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 100 * (Math.random() < 0.5 ? 1 : -1)],
                    }),
                  },
                  {
                    translateY: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 100 * (Math.random() < 0.5 ? 1 : -1)],
                    }),
                  },
                  {
                    rotate: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${Math.random() * 360}deg`],
                    }),
                  },
                ],
                opacity: circleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const HistoryScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState({});
  const [showRecords, setShowRecords] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "usuarios", user.uid);
        const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

        const querySnapshot = await getDocs(cigarettesCollectionRef);
        const historyData = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!historyData[data.fecha]) {
            historyData[data.fecha] = [];
          }
          historyData[data.fecha].push(data);
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
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isSelected = selectedDate === day;
    const hasRecords = Array.isArray(history[dateKey]) && history[dateKey].length > 0;

    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayContainer, hasRecords && styles.hasRecords]}
        onPress={() => {
          const [year, month, day] = dateKey.split("-").map(Number); // Extraer año, mes y día
          setSelectedDate(new Date(year, month - 1, day)); // Crear fecha correctamente
          setShowRecords(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          Animated.timing(heightAnim, {
            toValue: hasRecords ? 100 : 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }}
      >
        {isSelected && <View style={styles.selectedCircle} />}
        <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
        <Text style={[styles.dayNameText, isSelected && styles.selectedDayText]}>
          {new Date(currentYear, currentMonth, day).toLocaleString("default", { weekday: "short" })}
        </Text>
        {hasRecords && <View style={styles.recordIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderRecords = () => {
    const dateKey = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
    const dailyRecords = Array.isArray(history[dateKey]) ? history[dateKey] : [];
    const totalCigars = dailyRecords.reduce((total, record) => total + record.cigarettesSmoked, 0);
    return (
      <Animated.View style={[styles.recordsContainer, { opacity: fadeAnim, height: heightAnim }]}>
        <Text style={styles.totalCigarsText}>Total de cigarros: {totalCigars}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <BackgroundCircles />
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Text style={styles.buttonText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" }).charAt(0).toUpperCase() +
            new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" }).slice(1)}{" "}
          {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={styles.buttonText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getDaysArray(currentMonth, currentYear)}
        renderItem={({ item }) => renderDay(item)}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        snapToInterval={60}
        snapToAlignment="center"
        decelerationRate="fast"
        style={styles.list}
      />

      {showRecords && renderRecords()}

      <TouchableOpacity style={styles.scrollToTopButton} onPress={() => router.push("./ProfileScreen")}>
        <Text style={styles.scrollToTopText}>↑</Text>
        <Text style={styles.scrollToTopLabel}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollToTopButton: {
    position: "absolute",
    bottom: 30,
    left: 20, // Mover el botón a la parte inferior izquierda
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollToTopText: {
    color: "#fff",
    fontSize: 20,
  },
  scrollToTopLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#7595BF",
    position: "relative",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "beige",
  },
  buttonText: {
    fontSize: 24,
    color: "beige",
  },
  list: {
    flexGrow: 0,
  },
  dayContainer: {
    width: 60,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    marginTop: 20,
  },
  selectedCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#059E9E",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -22.5 }, { translateY: -22.5 }, { rotate: "45deg" }],
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00796b",
  },
  selectedDayText: {
    color: "#ffb300",
  },
  dayNameText: {
    fontSize: 14,
    color: "#00796b",
  },
  hasRecords: {
    borderColor: "#ffeb3b",
    borderWidth: 2,
  },
  recordIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffeb3b",
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  recordsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center", // Centrar contenido verticalmente
    alignItems: "flex-start", // Centrar contenido horizontalmente
    minHeight: 50, // Altura mínima para el rectángulo
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#e0f7fa",
  },
  recordNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  recordInfo: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  recordText: {
    fontSize: 16,
    color: "#555",
  },
});

export default HistoryScreen;