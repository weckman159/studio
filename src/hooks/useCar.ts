
'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc, collection, getDocs, query, orderBy, increment, updateDoc } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import type { Car, TimelineEntry, InventoryItem } from '@/lib/types/car'

export function useCar(carId: string) {
  const [car, setCar] = useState<Car | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const firestore = useFirestore();

  useEffect(() => {
    async function loadCar() {
      if (!firestore) {
        setLoading(false);
        return;
      }
      try {
        // Загрузить основные данные авто
        // First, try to get from the root 'cars' collection
        let carRef = doc(firestore, 'cars', carId);
        let carSnap = await getDoc(carRef);

        if (!carSnap.exists()) {
          // Fallback to searching in user subcollections
           const usersSnap = await getDocs(collection(firestore, 'users'));
           for (const userDoc of usersSnap.docs) {
               const userCarRef = doc(firestore, 'users', userDoc.id, 'cars', carId);
               const userCarSnap = await getDoc(userCarRef);
               if (userCarSnap.exists()) {
                   carSnap = userCarSnap;
                   carRef = userCarRef;
                   break;
               }
           }
        }
        
        if (!carSnap.exists()) {
            throw new Error('Car not found')
        }
        
        const carData = { id: carSnap.id, ...carSnap.data() } as Car
        setCar(carData)
        
        // Увеличить счётчик просмотров
        await updateDoc(carRef, { views: increment(1) })
        
        // Загрузить timeline
        const timelineRef = collection(carRef, 'timeline')
        const timelineQuery = query(timelineRef, orderBy('date', 'desc'))
        const timelineSnap = await getDocs(timelineQuery)
        const timelineData = timelineSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TimelineEntry[]
        setTimeline(timelineData)
        
        // Загрузить инвентарь
        const inventoryRef = collection(carRef, 'inventory')
        const inventorySnap = await getDocs(inventoryRef)
        const inventoryData = inventorySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InventoryItem[]
        setInventory(inventoryData)
        
      } catch (error) {
        console.error('Error loading car:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (carId) {
        loadCar()
    } else {
        setLoading(false);
    }
  }, [carId, firestore])

  return { car, timeline, inventory, loading }
}
