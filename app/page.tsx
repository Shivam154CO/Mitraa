"use client"

import { motion } from "framer-motion"
import CreateRoomButton from "@/components/CreateRoomButton"
import NearbyRooms from "@/components/NearbyRooms"
import { useEffect, useState } from 'react'
import { Shield, Zap, Lock, ArrowRight, Share2, Clock, Smartphone, Globe, CheckCircle2, Send, MousePointer2 } from "lucide-react"
import Image from "next/image"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const event = e as BeforeInstallPromptEvent
      setDeferredPrompt(event)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-orange selection:text-black font-inter">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-brand-orange/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-brand-amber/5 rounded-full blur-[150px]" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-brand-dark/60 backdrop-blur-xl font-outfit">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-14 h-14 relative group-hover:rotate-12 transition-transform duration-500">
              <Image src="/favicon.png" alt="Mitraa Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Mitraa</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
            <a href="#features" className="hover:text-brand-orange transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-orange transition-colors">How it works</a>
            <a href="#nearby" className="hover:text-brand-orange transition-colors">Browse Rooms</a>
          </div>

          <button
            onClick={() => document.getElementById('app-main')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-orange hover:text-black hover:border-brand-orange transition-all duration-300"
          >
            Launch app
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-48 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-8 font-outfit">
                Free • No Signup • Instant
              </div>

              <h1 className="text-6xl md:text-8xl font-outfit font-black mb-8 leading-[1.1] tracking-tight text-white uppercase">
                Drop files,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-amber to-orange-400">Share Instantly.</span>
              </h1>

              <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-sans">
                Create a temporary room to shared files, text, and links. No account needed. Just drop your stuff and share the link.
              </p>

              <div id="app-main" className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 scroll-mt-32 font-outfit">
                <CreateRoomButton />
              </div>
            </motion.div>

            {/* How It Works Section */}
            <motion.div
              id="how-it-works"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative max-w-5xl mx-auto scroll-mt-32"
            >
              <div className="mb-16 text-center font-outfit">
                <p className="text-xs font-bold text-brand-orange uppercase tracking-[0.4em] mb-4 text-white">Simple Steps</p>
                <h2 className="text-4xl font-black uppercase mb-12 text-white">How It Works</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left text-white/60">
                  {[
                    { step: '01', title: 'Create Room', desc: 'Click the button to start a private room instantly.' },
                    { step: '02', title: 'Drop Files', desc: 'Drop your files, text, or links into the room.' },
                    { step: '03', title: 'Share Link', desc: 'Copy the room link and send it to your friends.' }
                  ].map((s, i) => (
                    <div key={i} className="space-y-3">
                      <span className="text-brand-orange font-black text-2xl opacity-50">{s.step}</span>
                      <h3 className="font-bold text-white text-lg">{s.title}</h3>
                      <p className="text-sm leading-relaxed font-sans">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-50" />
              <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden">
                <div className="h-10 border-b border-white/5 flex items-center px-6 justify-between bg-[#111]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="h-4 w-32 bg-white/5 rounded-full border border-white/5" />
                  <div className="w-6 h-6 rounded-lg bg-brand-orange/20 flex items-center justify-center">
                    <Zap size={12} className="text-brand-orange" />
                  </div>
                </div>

                <div className="grid grid-cols-12 h-[550px] font-outfit">
                  <div className="col-span-3 border-r border-white/5 p-6 text-left space-y-10 hidden md:block bg-black/40">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Live Room</span>
                      </div>
                      <div className="h-10 w-full bg-brand-orange/10 rounded-xl border border-brand-orange/20 flex items-center px-4">
                        <div className="h-2 w-16 bg-brand-orange/40 rounded" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">24h Expiry</p>
                      <p className="text-lg font-mono font-bold text-sky-400">23:54:12</p>
                    </div>
                    <div className="mt-20 pt-8 border-t border-white/5">
                      <div className="h-2 w-12 bg-white/10 rounded mb-4" />
                      <div className="h-20 w-full bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 p-4">
                        <div className="h-1.5 w-10 bg-brand-orange/40 rounded mb-2" />
                        <div className="h-3 w-16 bg-white/10 rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-9 p-8 bg-[#0a0a0a] relative">
                    <div className="flex justify-between items-center mb-10">
                      <div className="h-10 w-48 bg-white/5 rounded-xl border border-white/5 flex items-center px-5 gap-3">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <div className="h-2 w-24 bg-white/20 rounded" />
                      </div>
                      <div className="h-10 px-6 bg-brand-orange text-black rounded-xl flex items-center font-black text-[10px] uppercase tracking-wider shadow-glow">
                        Share link
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[320px] overflow-hidden">
                      <motion.div
                        animate={{ borderColor: ['rgba(251,146,60,0.1)', 'rgba(251,146,60,0.4)', 'rgba(251,146,60,0.1)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-6 bg-brand-orange/5 rounded-[2rem] border border-brand-orange/20 flex flex-col items-center justify-center gap-4 text-center"
                      >
                        <div className="w-12 h-12 bg-brand-orange/20 rounded-2xl flex items-center justify-center text-brand-orange">
                          <Share2 size={24} className="animate-pulse" />
                        </div>
                        <div className="w-full max-w-[140px] h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: ['0%', '100%'] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-brand-orange shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                          />
                        </div>
                        <p className="text-[9px] font-black text-brand-orange/60 uppercase tracking-[0.3em]">Uploading...</p>
                      </motion.div>

                      {[
                        { icon: <Zap size={16} />, title: 'Final_Design_V2.pdf', desc: 'Uploaded 2m ago', color: 'text-brand-orange' },
                        { icon: <Shield size={16} />, title: 'Meeting_Notes.txt', desc: 'Securely shared', color: 'text-amber-400' },
                        { icon: <Smartphone size={16} />, title: 'Mockup_mobile.png', desc: 'Shared by Peer', color: 'text-orange-300' }
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col gap-4 text-left group hover:border-brand-orange/30 transition-all duration-500"
                        >
                          <div className="flex justify-between items-center">
                            <div className={`w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center ${item.color}`}>
                              {item.icon}
                            </div>
                            <div className="h-1 w-10 bg-white/5 rounded-full" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate">{item.title}</h4>
                            <p className="text-[10px] text-white/40 font-medium">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-6 left-8 right-8 flex gap-4">
                      <div className="flex-1 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center px-6 backdrop-blur-xl">
                        <div className="h-2 w-40 bg-white/10 rounded animate-pulse" />
                      </div>
                      <div className="w-14 h-14 bg-brand-orange text-black rounded-2xl flex items-center justify-center shadow-glow">
                        <Send size={20} className="stroke-[3]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Powerful Features */}
        <section id="features" className="py-32 px-6 relative overflow-hidden scroll-mt-32">
          <div className="max-w-7xl mx-auto text-center mb-24 font-outfit">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase text-white">Why Mitraa?</h2>
            <p className="text-white/40 max-w-xl mx-auto font-sans">No accounts. No trackers. Just fast sharing.</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={24} />,
                title: "One-click rooms",
                desc: "Generate a room instantly without filling out any forms or signing up."
              },
              {
                icon: <Clock size={24} />,
                title: "Auto-cleanup",
                desc: "Everything you share is temporary. Files and rooms are deleted permanently after 24 hours."
              },
              {
                icon: <Share2 size={24} />,
                title: "Real-time sync",
                desc: "Your friends see your files as soon as you drop them. No refreshing required."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-brand-orange/30 transition-all duration-500 shadow-2xl font-outfit">
                <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl mb-6 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-black transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase text-white">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-sans">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discovery Section Integration */}
        <section id="nearby" className="py-20 px-6 relative border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <NearbyRooms />
          </div>
        </section>

        {/* Footer / CTA Section */}
        <section id="safety" className="py-32 px-6 relative font-outfit">
          <div className="max-w-4xl mx-auto bg-brand-orange rounded-[3rem] p-16 text-center shadow-glow-lg text-black relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Globe size={120} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 uppercase">Start sharing now</h2>
            <p className="text-black/60 text-lg mb-12 font-bold max-w-lg mx-auto leading-relaxed font-sans">
              Create your first room and send a file in seconds. Simple, private, and fast.
            </p>
            <button
              onClick={() => document.getElementById('app-main')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
            >
              Get started
            </button>
          </div>

          <footer className="mt-32 max-w-7xl mx-auto border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
            <span>&copy; 2026 Mitraa &bull; Built for privacy</span>
            <span>Created by Shivam Pawar &bull; DYP student project</span>
          </footer>
        </section>
      </main>
    </div>
  )
}