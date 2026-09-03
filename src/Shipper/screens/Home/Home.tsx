import { StyleSheet, View } from 'react-native'
import OrderHome from './components/OrderHome';


export default function Home() {

  return (
    <View style={styles.container}>
      <OrderHome />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})