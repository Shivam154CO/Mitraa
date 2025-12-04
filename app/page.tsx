"use client"

import { motion } from "framer-motion"
import CreateRoomButton from "@/components/CreateRoomButton"
import { useEffect, useState } from 'react'
import Image from 'next/image'


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

  const installApp = async () => {
    if (!deferredPrompt) return
    
    try {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('App installed')
      } else {
        console.log('App install dismissed')
      }
    } catch (error) {
      console.error('Error installing app:', error)
    } finally {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 -right-20 w-96 h-96 bg-gradient-to-br from-sky-200/30 to-cyan-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-sky-200/30 rounded-full blur-3xl"
        />
      </div>

      <nav className="relative w-full px-6 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="relative group">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="absolute -inset-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 rounded-full opacity-20 blur"
              />
              
              <div className="relative w-14 h-14 bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-sky-500/30 overflow-hidden">
                <div className="relative w-10 h-10">
                  <Image
                    src="/favicon.png"
                    alt="Mitraa Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                    x: [0, 2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1 right-3 w-1.5 h-1.5 bg-white rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, 3, 0],
                    x: [0, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute bottom-1 left-3 w-1 h-1 bg-white/80 rounded-full"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl" />
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col"
              >
                <h1 className="text-3xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                    Mitraa
                  </span>
                  <motion.span
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sky-500 ml-0.5"
                  >
                    .
                  </motion.span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-4 h-px bg-gradient-to-r from-sky-400 to-cyan-400" />
                  <p className="text-xs font-medium text-sky-600/90 tracking-[0.2em]">
                    Transfer Files Seamlessly
                  </p>
                  <div className="w-4 h-px bg-gradient-to-r from-cyan-400 to-blue-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent mt-2"
              />
            </div>
          </motion.div>

        </div>
      </nav>

      {showInstall && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={installApp}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium z-50"
        >
          📱 Install App
        </motion.button>
      )}

      <main className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full mb-8 shadow-sm"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Free • No Signup • Instant</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Drop Files,
              </span>
              <br />
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Share Instantly
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Create temporary rooms to share files, text, and links.
              <br />
              <span className="font-semibold text-sky-600">No account needed. Just drop and go.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20"
          >
            <div className="inline-block">
              <CreateRoomButton />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "No Registration",
                description: "Drop files without any signup"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "24h Auto-Delete ",
                description: "Rooms & files vanish after 24 hours"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                ),
                title: "Instant Share",
                description: "Copy link & share immediately"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mb-4">
                  <div className="text-sky-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="w-full max-w-md flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mb-4">
                <div className="text-sky-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Rooms</h3>
              <p className="text-gray-600 text-sm">One-click room generation</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            How It Works
          </h2>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-200 -translate-y-1/2 hidden md:block" />
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                  action: "Create",
                  detail: "Click to generate a unique room instantly"
                },
                {
                  step: "02",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  ),
                  action: "Upload",
                  detail: "Drop your files, paste text, or add links"
                },
                {
                  step: "03",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  ),
                  action: "Share",
                  detail: "Copy the link and share with anyone"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.2 }}
                  className="relative"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10">
                    {item.step}
                  </div>
                  
                  <div className="group relative pt-12 pb-8 px-6 bg-white/70 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    >
                      <div className="text-sky-600">
                        {item.icon}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{item.action}</h3>
                    <p className="text-gray-600 text-center">{item.detail}</p>
                    
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 text-sky-300">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 rounded-3xl p-12 shadow-xl">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Share Instantly?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands who trust Mitraa for fast, secure, and temporary file sharing
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <CreateRoomButton />
            </motion.div>
          </div>
        </motion.div>
      </main>

    </div>
  )
}