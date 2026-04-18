import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

export default function PharmacyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pharmacy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 20, fontFamily: Fonts.semiBold, color: Colors.textPrimary },
});
