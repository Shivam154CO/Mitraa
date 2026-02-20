"use client"

import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { X, Copy, Check, Share2 } from "lucide-react"
import { useState, useEffect } from "react"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    roomId: string
}

export default function ShareModal({ isOpen, onClose, roomId }: ShareModalProps) {
    const [copied, setCopied] = useState(false)
    const [shareUrl, setShareUrl] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setShareUrl(window.location.href)
        }
    }, [])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join Mitraa Room ${roomId.toUpperCase()}`,
                    text: "Share text and files instantly with me on Mitraa!",
                    url: shareUrl,
                })
            } catch (err) {
                console.log("Error sharing:", err)
            }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 text-center flex-1 ml-6">
                                    Invite Others
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-gray-50 rounded-2xl mb-6 shadow-inner">
                                    <QRCodeSVG
                                        value={shareUrl}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                        className="rounded-lg"
                                    />
                                </div>

                                <p className="text-sm text-gray-500 text-center mb-8 px-4">
                                    Scan this QR code from another device to instantly join room <span className="font-bold text-sky-700">{roomId.toUpperCase()}</span>.
                                </p>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all group"
                                    >
                                        <div className="flex flex-col items-start truncate mr-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Room URL</span>
                                            <span className="text-sm text-gray-700 truncate w-full">{shareUrl}</span>
                                        </div>
                                        <div className="flex-shrink-0 p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:border-sky-200 transition-colors">
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-sky-600" />
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span>Other Share Options</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 py-4 px-6 text-center border-t border-gray-100">
                            <p className="text-[11px] text-gray-400 font-medium">
                                Mitraa Handover - No login required
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
