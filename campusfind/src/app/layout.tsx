import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import QuickPersonaBar from '@/components/QuickPersonaBar';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Link from 'next/link';
import { Shield, Compass, Heart, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CampusFind — College Lost & Found',
  description: 'Lost something? Find it on Campus. The official collegiate platform for lost, found, and verified item recovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <QuickPersonaBar />
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <MobileBottomNav />

          {/* Footer */}
          <footer className="bg-slate-950 border-t border-slate-800/80 mt-16 pt-12 pb-8 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Col 1: Brand */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="font-heading font-extrabold text-lg text-white">
                      Campus<span className="text-cyan-400">Find</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The official digital lost &amp; found network connecting students, faculty, and campus security for verified item recoveries.
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    &laquo;Lost something? Find it on Campus.&raquo;
                  </p>
                </div>

                {/* Col 2: Quick Links */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Campus Services</h4>
                  <ul className="space-y-1.5">
                    <li><Link href="/items?type=lost" className="hover:text-cyan-400 transition-colors">Recently Lost Items</Link></li>
                    <li><Link href="/items?type=found" className="hover:text-cyan-400 transition-colors">Recently Found Items</Link></li>
                    <li><Link href="/matches" className="hover:text-cyan-400 transition-colors">Smart AI Matches</Link></li>
                    <li><Link href="/map" className="hover:text-cyan-400 transition-colors">Interactive Campus Map</Link></li>
                    <li><Link href="/claims" className="hover:text-cyan-400 transition-colors">Ownership Verification</Link></li>
                  </ul>
                </div>

                {/* Col 3: Safe Handover */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Safe Handover Protocol</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Always arrange in-person exchanges at designated university locations:
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Security Post, Main Gatehouse</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Central Library Circulation Desk</span>
                    </div>
                  </div>
                </div>

                {/* Col 4: Campus Support */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Campus Security Helpline</h4>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>+1 (555) 234-CAMPUS</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    24/7 Security Patrol &amp; Lost Property Office (Locker Room 4, Building A).
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Staff &amp; Admin Portal</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <p>&copy; 2026 CampusFind — Metropolitan Institute of Technology. All rights reserved.</p>
                <p className="flex items-center gap-1">
                  Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for College Students &amp; Campus Safety
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
