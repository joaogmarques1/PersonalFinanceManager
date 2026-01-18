import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe Logic
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setIsSidebarOpen(false);
        }
        if (isRightSwipe) {
            setIsSidebarOpen(true);
        }
    };

    return (
        <div
            className="flex h-full min-h-[calc(100vh-80px)] relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Mobile Edge Handle - Samsung Style */}
            {!isSidebarOpen && (
                <div
                    className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 w-2 h-20 bg-[#85BB65]/50 hover:bg-[#d9a553] backdrop-blur-sm border border-l-0 border-white/30 rounded-r-lg z-50 cursor-pointer shadow-sm transition-all active:scale-95"
                    onClick={() => setIsSidebarOpen(true)}
                    onTouchEnd={(e) => {
                        // Prevent conflict with parent touch handlers if necessary, 
                        // though parent handlers are on the container.
                        e.stopPropagation();
                        setIsSidebarOpen(true);
                    }}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f0eee6] w-full pt-4 md:pt-8">
                {children}
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-30 backbone-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
