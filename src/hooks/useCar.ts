'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc, collection, getDocs, query, orderBy, increment, updateDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import type { Car, TimelineEntry, InventoryItem } from '@/lib/types/car'

export function useCar(carId: string) {
  const [car, setCar] = useState<Car | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCar() {
      if (!firestore) {
        setLoading(false);
        return;
      }
      try {
        // Загрузить основные данные авто
        const carRef = doc(firestore, 'cars', carId)
        const carSnap = await getDoc(carRef)
        
        if (!carSnap.exists()) {
          // Fallback to searching in user subcollections
           const usersSnap = await getDocs(collection(firestore, 'users'));
           let foundCar = null;
           let carData = null;
           for (const userDoc of usersSnap.docs) {
               const userCarRef = doc(firestore, 'users', userDoc.id, 'cars', carId);
               const userCarSnap = await getDoc(userCarRef);
               if (userCarSnap.exists()) {
                   foundCar = userCarSnap;
                   carData = { id: foundCar.id, ...foundCar.data() } as Car;
                   setCar(carData);
                   break;
               }
           }
           
           if (!foundCar) {
             throw new Error('Car not found')
           }

        } else {
             const carData = { id: carSnap.id, ...carSnap.data() } as Car
             setCar(carData)
             // Увеличить счётчик просмотров
             await updateDoc(carRef, { views: increment(1) })
        }
        
        // Загрузить timeline
        const timelineRef = collection(firestore, 'cars', carId, 'timeline')
        const timelineQuery = query(timelineRef, orderBy('date', 'desc'))
        const timelineSnap = await getDocs(timelineQuery)
        const timelineData = timelineSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TimelineEntry[]
        setTimeline(timelineData)
        
        // Загрузить инвентарь
        const inventoryRef = collection(firestore, 'cars', carId, 'inventory')
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
