
'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc, collection, getDocs, query, orderBy, increment, updateDoc, where } from 'firebase/firestore'
import { useFirestore, useUser } from '@/firebase'
import type { Car, TimelineEntry, InventoryItem } from '@/lib/types/car'

export function useCar(carId: string) {
  const { user } = useUser();
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
        setLoading(true);
        // Get car from root `cars` collection
        let carRef = doc(firestore, 'cars', carId);
        let carSnap = await getDoc(carRef);

        if (!carSnap.exists()) {
            console.warn("Car not found in public collection.");
            throw new Error('Car not found');
        }
        
        const carData = { id: carSnap.id, ...carSnap.data() } as Car
        setCar(carData)
        
        // Increment views count
        await updateDoc(carRef, { views: increment(1) })
        
        // Load timeline
        const timelineRef = collection(carRef, 'timeline')
        const timelineQuery = query(timelineRef, orderBy('date', 'desc'))
        const timelineSnap = await getDocs(timelineQuery)
        const timelineData = timelineSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TimelineEntry[]
        setTimeline(timelineData)
        
        // Load inventory
        const inventoryRef = collection(carRef, 'inventory')
        const inventorySnap = await getDocs(inventoryRef)
        const inventoryData = inventorySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InventoryItem[]
        setInventory(inventoryData)
        
      } catch (error) {
        console.error('Error loading car:', error)
        setCar(null); // Explicitly set to null on error
      } finally {
        setLoading(false)
      }
    }
    
    if (carId && firestore) {
        loadCar()
    } else {
        setLoading(false);
    }
  }, [carId, firestore, user]) // Add user to dependency array

  return { car, timeline, inventory, loading }
}
