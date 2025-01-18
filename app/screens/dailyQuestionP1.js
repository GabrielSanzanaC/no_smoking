import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router'; // Importa useRouter

export default function TaskSelectorScreen() {
  const [selectedTasks, setSelectedTasks] = useState([]);

  const router = useRouter(); // Inicializa el router
  const handleGoogleContinue = () => {
    router.push("./dailyQuestionP2"); // Navega a la pantalla
  };

  const tasks = [
    { id: 'gym', label: 'Gym', icon: 'H' },
    { id: 'travel', label: 'Travel', icon: '🌍' },
    { id: 'study', label: 'Study', icon: '🔬' },
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'music', label: 'Music', icon: '🎶' },
    { id: 'friends', label: 'Friends', icon: '👥' },
  ];

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[
              styles.stepCircle,
              index === 0 && styles.activeStepCircle,
            ]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>Which of your tasks did you do yesterday?</Text>

      {/* Task Buttons */}
      <View style={styles.taskContainer}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskButton,
              selectedTasks.includes(task.id) && styles.selectedTaskButton,
            ]}
            onPress={() => toggleTaskSelection(task.id)}
          >
            <Text style={styles.taskIcon}>{task.icon}</Text>
            <Text style={styles.taskLabel}>{task.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleGoogleContinue}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F2D',
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 150,
    marginBottom: 20,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#33334D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#4F59FF',
  },
  stepText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  taskButton: {
    width: 100,
    height: 100,
    backgroundColor: '#33334D',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedTaskButton: {
    backgroundColor: '#4F59FF',
  },
  taskIcon: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 5,
  },
  taskLabel: {
    fontSize: 14,
    color: '#FFF',
  },
  nextButton: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F59FF',
  },
});
