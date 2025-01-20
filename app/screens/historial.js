import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const CalendarScreen = () => {
  const router = useRouter(); // Para navegación
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const history = {
    '2025-01-10': '2 cigarrillos',
    '2025-01-15': '5 cigarrillos',
    '2025-01-20': '1 cigarrillo',
  };

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
        style={[
          styles.dayContainer,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={styles.dayText}>{day}</Text>
        {history[dateKey] && <Text style={styles.historyDot}>●</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botón para regresar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('./ProfileScreen')}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      {/* Navegación del Mes */}
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

      {/* Días del Calendario */}
      <View style={styles.calendar}>
        {getDaysArray(currentMonth, currentYear).map(renderDay)}
      </View>

      {/* Historial Seleccionado */}
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
    padding: 20,
    backgroundColor: '#0F0F2D',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#4F59FF',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#33334D',
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

export default CalendarScreen;
