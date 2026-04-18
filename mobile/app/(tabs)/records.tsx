import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

export default function RecordsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Records</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 20, fontFamily: Fonts.semiBold, color: Colors.textPrimary },
});
