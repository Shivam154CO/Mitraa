"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Users, ArrowRight, Lock, Radio, Globe, Zap, Clock } from "lucide-react"
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
                // Silent error in discovery
            } finally {
                setLoading(false)
            }
        }

        fetchNearby()
        const interval = setInterval(fetchNearby, 10000)
        return () => clearInterval(interval)
    }, [])

    if (loading && rooms.length === 0) return null
    if (!loading && rooms.length === 0) return null

    return (
        <div className="w-full relative py-20 font-outfit">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-10">
                <div className="text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Radio className="w-3 h-3 animate-pulse" />
                        Live Discovery
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 uppercase">
                        Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-amber text-stroke">Rooms</span>
                    </h2>
                    <p className="text-white/40 max-w-md font-sans text-sm leading-relaxed">
                        Join ephemeral rooms discovered on your local network protocol. No links required.
                    </p>
                </div>

                <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <div className="w-12 h-12 bg-brand-orange/20 rounded-2xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div className="text-left font-sans">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Discovery Status</p>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">Listening...</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            onClick={() => router.push(`/${room.id}`)}
                            className="group relative cursor-pointer"
                        >
                            {/* Card Background Layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] border border-white/10 group-hover:border-brand-orange/40 transition-all duration-500 shadow-2xl" />

                            {/* Shine Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange/20 to-blue-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-40 transition-opacity" />

                            <div className="relative p-10 flex flex-col gap-10">
                                <div className="flex justify-between items-center">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${room.isPrivate
                                        ? 'bg-brand-amber/10 text-brand-amber shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                                        : 'bg-brand-orange/10 text-brand-orange shadow-[0_0_20px_rgba(251,146,60,0.1)]'
                                        }`}>
                                        {room.isPrivate ? <Lock size={24} /> : <Zap size={24} />}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">
                                            {room.isPrivate ? 'Protected' : 'Public'}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-white group-hover:text-brand-orange transition-colors tracking-tighter uppercase truncate pr-4">
                                        {room.id}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 font-sans">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            <Users size={12} className="text-brand-orange" />
                                            <span>Live Room</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            <Clock size={12} className="text-sky-400" />
                                            <span>{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-white/5 font-sans">
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover:text-brand-orange transition-colors">Join Instant Space</span>
                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand-orange group-hover:text-black transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
