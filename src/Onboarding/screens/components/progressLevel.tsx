import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../../constants/colors'

const gray = "#9FA1AC";


export default function ProgressLevel({progressLevel}: {progressLevel: number}) {
    
  return (
    <View style={styles.container}>
                       <View
                           style={styles.progressCont}
                       >
                            
                           <View style={{ alignItems: 'center' }}>
                               <View
                                   style={{
                                     width: 25,
                                       height: 25,
                                       borderRadius: 25,
                                        justifyContent: 'center',
                                       alignItems: 'center',
                                       backgroundColor: progressLevel <= 1? undefined : Colors.primary,
                                       borderWidth: progressLevel <= 1? 2 : undefined,
                                       borderColor: progressLevel <= 1? Colors.primary : undefined,  
                                   }}
                               >
                                   <Text style={{ color: progressLevel <= 1? Colors.primary : Colors.text.white, fontWeight: '600' }}>1</Text>
                               </View>
                               <Text style={{color: progressLevel <= 1? Colors.text.black :  Colors.primary, marginTop: 8, fontWeight: '600' }}>Personal</Text>
                           </View>
                           <View
                               style={{
                                   flex: 1,
                                   height: 2,
                                   backgroundColor: progressLevel <= 1?  gray : Colors.primary,
                                   marginBottom: 25,
                               }}
                           />
   
                         
                           <View style={{ alignItems: 'center' }}>
                               <View
                                   style={{
                                       width: 25,
                                       height: 25,
                                       borderRadius: 25,
                                       backgroundColor: progressLevel <= 1? gray : progressLevel <= 2? undefined : Colors.primary,
                                       borderWidth: progressLevel <= 1? undefined : progressLevel <=2? 2:  undefined,
                                       borderColor: progressLevel <= 1? undefined : progressLevel <=2? Colors.primary : undefined,
                                       justifyContent: 'center',
                                       alignItems: 'center',
                                   }}
                               >
                                   <Text style={{ color: progressLevel <= 1? Colors.text.white : progressLevel <=2? Colors.primary : Colors.text.white, fontWeight: '600' }}>2</Text>
                               </View>
   
                               <Text style={{ color: progressLevel <= 1? "#9CA3AF" : progressLevel <=2? Colors.text.black : Colors.primary, marginTop: 8, 
                                fontWeight: progressLevel <= 1? undefined : progressLevel <=2? "600" : "600" }}>
                                   Ownership
                               </Text>
                           </View>
   
                         
                           <View
                               style={{
                                   flex: 1,
                                   height: 2,
                                   backgroundColor: progressLevel <= 2? gray : Colors.primary,
                                   marginBottom: 25,
                               }}
                           />
   
                         
                           <View style={{ alignItems: 'center' }}>
                               <View
                                   style={{
                                       width: 25,
                                       height: 25,
                                       borderRadius: 25,
                                       backgroundColor: progressLevel <= 2? gray : progressLevel <= 3? undefined : Colors.primary,
                                       borderWidth: progressLevel <= 2? undefined : progressLevel <=3? 2 : undefined,
                                       borderColor: progressLevel <= 2? undefined : progressLevel <=3? Colors.primary : undefined,
                                       justifyContent: 'center',
                                       alignItems: 'center',
                                   }}
                               >
                                   <Text style={{ color: progressLevel <= 2? Colors.text.white : progressLevel <= 3? Colors.primary : Colors.text.white, fontWeight: '600' }}>3</Text>
                               </View>
   
                               <Text
                                   style={{
                                       marginTop: 8,
                                       color: progressLevel <= 2? '#9CA3AF' : progressLevel <=3? Colors.text.black : Colors.primary,
                                       fontWeight:  progressLevel <= 2? undefined : progressLevel <=3? "600" : "600",
                                   }}
                               >
                                   Payment
                               </Text>
                           </View>
   
                           
                           <View
                               style={{
                                   flex: 1,
                                   height: 2,
                                   backgroundColor: progressLevel <= 3? gray : Colors.primary,
                                   marginBottom: 25,
                               }}
                           />
   
                          
                           <View style={{ alignItems: 'center' }}>
                               <View
                                   style={{
                                       width: 25,
                                       height: 25,
                                       borderRadius: 25,
                                       backgroundColor: progressLevel > 3? undefined : gray,
                                       borderWidth: progressLevel > 3? 2 : undefined,
                                       borderColor: progressLevel > 3? Colors.primary : undefined,
                                       justifyContent: 'center',
                                       alignItems: 'center',
                                   }}
                               >
                                   <Text style={{ color: progressLevel > 3? Colors.primary : Colors.text.white, fontWeight: '600' }}>4</Text>
                               </View>
   
                               <Text
                                   style={{
                                       marginTop: 8,
                                       color: progressLevel > 3? Colors.text.black : '#9CA3AF',
                                       fontWeight: progressLevel > 3?  "600" : undefined
                                   }}
                               >
                                   Preview
                               </Text>
                           </View>
                       </View>
                   </View>
   
   
   
  )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20
    },
    progressCont: {
         flexDirection: 'row',
                               alignItems: 'center',
    }
})