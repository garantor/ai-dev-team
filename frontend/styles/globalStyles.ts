import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkText: {
    color: '#007bff',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 20,
  },
  radioOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
  },
  radioOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioText: {
    color: '#555',
  },
  radioTextSelected: {
    color: '#fff',
  },
});
