import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  disabledContainer: {
    opacity: 0.1,
  },
  disabledText: {
    color: '#A9A9A9',
  },
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  rectangle: {
    width: "90%",
    backgroundColor: "#072040",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0px 2px 3.84px rgba(0,0,0,0.25)",
    elevation: 10,
    alignItems: "center",
  },
  centeredContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleText: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "beige",
    color: "black",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: "#059E9E",
    width: "100%",
  },
  button: {
    backgroundColor: "#059E9E",
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: "center",
    marginBottom: 15,
    elevation: 5,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
    width: "80%",
  },
  buttonText: {
    color: "#F2F2F2",
    fontWeight: "bold",
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    width: '40%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#05F89E', // Azul cuando selecciona una opción
  },
  optionText: {
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  switchButtonText: {
    color: "#F2F2F2",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    backgroundColor: "#1F82BF",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  socialButtonText: {
    color: "#F2F2F2",
    fontWeight: "bold",
    fontSize: 14,
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resultAmount: {
    color: '#E3E34B',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
  },
  dropdownContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    color: "#F2F2F2",
    marginLeft: 10,
    fontSize: 14,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  
});
