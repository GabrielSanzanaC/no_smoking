import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const FullMonthChart = ({ visible, onClose, data }) => {
  const chartConfig = {
    backgroundColor: "transparent",
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: "#ffa726",
    },
    propsForBackgroundLines: {
      stroke: "transparent",
    },
    decimalPlaces: 0,
  };

  // Función para validar y normalizar datos
  const normalizeData = (data) => {
    // Verifica que 'data' sea un arreglo antes de procesarlo
    if (!Array.isArray(data)) {
      console.warn("Se esperaba un arreglo, pero se recibió:", data);
      return []; // Devuelve un arreglo vacío si la entrada no es válida
    }

    return data.map(value => {
      // Si el valor no es un número finito o es NaN, lo reemplaza por 0
      if (!Number.isFinite(value) || Number.isNaN(value)) {
        return 0; // O cualquier valor por defecto que consideres apropiado
      }
      return value;
    });
  };
  
  // Verificar que data y data.datasets sean válidos antes de usarlos
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    console.warn("Data o datasets no son válidos:", data);
    return null; // Retorna null o algún valor predeterminado si no se tienen datos válidos
  }

  const normalizedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: normalizeData(dataset.data),
    })),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cigarros fumados en el mes</Text>
          <View style={styles.chartContainer}>
            <ScrollView horizontal>
              <LineChart
                data={normalizedData}
                width={screenWidth * 2} // Aumenta el ancho para permitir el desplazamiento horizontal
                height={250}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                transparent={true} // Fondo transparente para el gráfico
              />
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#072040',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#F2F2F2',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    width: '90%',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Fondo igual al de los cuadros de estadísticas
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#F2F2F2',
    fontSize: 16,
  },
});

export default FullMonthChart;