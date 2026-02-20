"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, Users, ArrowRight, Zap } from "lucide-react"
import type { Room } from "@/lib/types"

export default function NearbyRooms() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchNearby = async () => {
            try {
                const res = await fetch("/api/rooms/nearby")
                if (res.ok) {
                    const data = await res.json()
                    setRooms(data)
                }
            } catch (err) {
                console.error("Discovery error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchNearby()
        const interval = setInterval(fetchNearby, 10000) // Refresh every 10s
        return () => clearInterval(interval)
    }, [])

    if (loading && rooms.length === 0) return null
    if (!loading && rooms.length === 0) return null

    return (
        <div className="w-full max-w-4xl mx-auto mb-20 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-sky-400 rounded-full animate-ping opacity-20"></div>
                        <MapPin className="w-6 h-6 text-sky-600 relative z-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Rooms Near You</h2>
                        <p className="text-sm text-sky-600 font-medium">Auto-discovered on your network</p>
                    </div>
                </div>

                <div className="px-3 py-1 bg-sky-100 rounded-full flex items-center space-x-2">
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">Live Discover</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            onClick={() => router.push(`/${room.id}`)}
                            className="cursor-pointer group relative bg-white border border-sky-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                                        <Users className="w-6 h-6 text-sky-600 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-sky-700 transition-colors">
                                            Room {room.id.toUpperCase()}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-400">Created {new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-gray-200">|</span>
                                            <div className="flex items-center space-x-1">
                                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[10px] font-bold text-amber-600 uppercase">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-sky-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                </div>
                            </div>

                            {/* Progress bar decoration */}
                            <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="h-full bg-sky-500 opacity-20"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
