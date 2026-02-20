import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mitraa Room',
    robots: {
        index: false,
        follow: false,
    },
}

export default function RoomLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
