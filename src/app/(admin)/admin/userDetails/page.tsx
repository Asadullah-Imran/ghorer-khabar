"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  Map,
  MapPin,
  RotateCcw,
  ShieldOff,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { USERS_LIST } from "@/lib/dummy-data/admin/userData";

export default function UserDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <UserDetailsContent />
    </Suspense>
  );
}

function UserDetailsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const user = USERS_LIST.find((u) => u.id === userId) || USERS_LIST[0];
  return (
    <div className="flex h-screen bg-background-dark text-white font-display overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Content Container */}
        <div className="p-8 space-y-6 flex-1">
          {/* Back Navigation */}
          <Link
            href="/admin/users"
            className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> User Management /{" "}
            <span className="text-white">User Details</span>
          </Link>

          {/* --- Profile Header Section --- */}
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-border-dark overflow-hidden border-4 border-border-dark" />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary border-4 border-surface-dark rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <span
                    className={`${
                      user.role === "Seller"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-primary/10 text-primary"
                    } text-[10px] font-bold px-2 py-0.5 rounded uppercase`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`${
                      user.status === "Active"
                        ? "bg-primary/10 text-primary"
                        : "bg-red-500/10 text-red-400"
                    } text-[10px] font-bold px-2 py-0.5 rounded uppercase`}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <ShieldOff size={12} /> {user.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> Uttara, Dhaka
                  </span>
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <ActionButton
                icon={<RotateCcw size={16} />}
                label="Reset Password"
              />
              <ActionButton icon={<Edit3 size={16} />} label="Edit Profile" />
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors">
                <ShieldOff size={16} /> Suspend
              </button>
            </div>
          </div>

          {/* --- KPI Stats Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Orders"
              value={user.orders}
              sub={user.revenue}
              subColor="text-text-muted"
            />
            <StatCard label="Seller Rating" value="4.8" sub="★★★★★ (124)" />
            <StatCard label="Total Orders" value={user.orders} sub="Lifetime" />
            <div className="bg-surface-dark border border-border-dark p-5 rounded-xl">
              <p className="text-xs text-text-muted mb-1">Account Status</p>
              <div className="flex items-center gap-2 font-bold mb-2">
                {user.status === "Active" ? "Active" : "Inactive"}{" "}
                <CheckCircle2
                  size={16}
                  className={
                    user.status === "Active" ? "text-primary" : "text-red-400"
                  }
                />
              </div>
              <div className="w-full bg-background-dark h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full w-full ${
                    user.status === "Active"
                      ? "bg-primary shadow-[0_0_8px_rgba(17,212,180,0.5)]"
                      : "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* --- Main Content Tabs & Grid --- */}
          <div className="flex gap-4 border-b border-border-dark mb-8">
            <TabItem label="Overview" active />
            <TabItem label="Activity / Orders" />
            <TabItem label="KYC & Docs" />
            <TabItem label="System Logs" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Contact & Docs */}
            <div className="lg:col-span-2 space-y-6">
              <SectionBox title="Contact Information" edit>
                <div className="grid grid-cols-2 gap-y-6">
                  <InfoItem label="Email Address" value={user.email} verified />
                  <InfoItem label="Phone Number" value={user.phone} verified />
                  <InfoItem label="WhatsApp" value="Open Chat" link />
                  <InfoItem label="Alt Phone" value="Not provided" muted />
                </div>
              </SectionBox>

              <SectionBox title="Registered Address">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-text-muted mb-1">
                        Full Address
                      </p>
                      <p className="text-sm leading-relaxed">
                        House 45, Road 12, Sector 4<br />
                        Uttara Model Town, Dhaka-1230
                        <br />
                        Bangladesh
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-text-muted mb-1">
                        Zone / Region
                      </p>
                      <p className="text-sm">Dhaka North / Zone 1</p>
                    </div>
                  </div>
                  <div className="w-64 h-32 bg-background-dark rounded-lg border border-border-dark flex items-center justify-center relative overflow-hidden group">
                    <Map className="text-border-dark" size={40} />
                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-bold">
                      <Eye size={14} /> View on Map
                    </button>
                  </div>
                </div>
              </SectionBox>

              <SectionBox title="Verification Documents" viewAll>
                <div className="grid grid-cols-3 gap-4">
                  <DocThumbnail label="Kitchen Photo" />
                  <DocThumbnail label="Trade License" />
                  <DocThumbnail label="NID Front" checked />
                </div>
              </SectionBox>
            </div>

            {/* Right Column: Recent Orders & Audit Trail */}
            <div className="space-y-6">
              <SectionBox title="Recent Orders">
                <div className="space-y-4">
                  <OrderRow
                    id="#ORD-9921"
                    price="৳ 450"
                    status="PREPARING"
                    time="Today, 10:30 AM"
                  />
                  <OrderRow
                    id="#ORD-9918"
                    price="৳ 1,200"
                    status="DELIVERED"
                    time="Yesterday"
                  />
                  <OrderRow
                    id="#ORD-9840"
                    price="৳ 320"
                    status="DELIVERED"
                    time="2 days ago"
                  />
                  <button className="w-full text-center text-xs font-bold text-primary mt-4 uppercase tracking-widest hover:text-primary/80 transition-colors">
                    View Full History
                  </button>
                </div>
              </SectionBox>

              <SectionBox title="Audit Trail">
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border-dark">
                  <AuditItem
                    title="Profile updated by Admin (You)"
                    sub="Today, 10:45 AM • Changed phone number"
                    color="border-primary"
                  />
                  <AuditItem
                    title="Suspicious Login Attempt"
                    sub="Yesterday, 02:15 AM • IP 192.168.1.1"
                    color="border-orange-500"
                  />
                  <AuditItem
                    title="KYC Documents Approved"
                    sub="Oct 20, 2023 • By System Automator"
                    color="border-green-500"
                  />
                </div>
              </SectionBox>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Internal Helper Components ---

function ActionButton({ icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-sm hover:bg-border-dark transition-colors">
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, sub, subColor = "text-text-muted" }: any) {
  return (
    <div className="bg-surface-dark border border-border-dark p-5 rounded-xl">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className={`text-[10px] font-bold ${subColor}`}>{sub}</p>
    </div>
  );
}

function SectionBox({ title, children, edit, viewAll }: any) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border-dark flex justify-between items-center">
        <h3 className="font-bold text-sm">{title}</h3>
        {edit && (
          <button className="text-xs text-primary font-bold hover:text-primary/80 transition-colors">
            Edit
          </button>
        )}
        {viewAll && (
          <button className="text-xs text-primary font-bold hover:text-primary/80 transition-colors">
            View All →
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, verified, link, muted }: any) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-text-muted mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${
            muted ? "text-text-muted italic" : "font-medium"
          }`}
        >
          {value}
        </span>
        {verified && <CheckCircle2 size={14} className="text-primary" />}
        {link && (
          <ExternalLink size={14} className="text-primary cursor-pointer" />
        )}
      </div>
    </div>
  );
}

function DocThumbnail({ label, checked }: any) {
  return (
    <div className="space-y-2">
      <div className="aspect-video bg-background-dark rounded-lg border border-border-dark flex items-center justify-center relative">
        <div className="w-8 h-10 bg-border-dark/30 border border-border-dark rounded" />
        {checked && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center border-2 border-background-dark">
            <CheckCircle2 size={10} />
          </div>
        )}
      </div>
      <p className="text-[10px] text-center font-bold text-text-muted uppercase">
        {label}
      </p>
    </div>
  );
}

function OrderRow({ id, price, status, time }: any) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-bold mb-1">{id}</p>
        <p className="text-[10px] text-text-muted">{time}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold mb-1">{price}</p>
        <span
          className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
            status === "PREPARING"
              ? "bg-secondary/10 text-secondary"
              : "bg-primary/10 text-primary"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function AuditItem({ title, sub, color }: any) {
  return (
    <div className="pl-6 relative">
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-surface-dark border-2 ${color} z-10`}
      />
      <p className="text-xs font-bold mb-0.5">{title}</p>
      <p className="text-[10px] text-text-muted">{sub}</p>
    </div>
  );
}

function TabItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`pb-4 text-xs font-bold uppercase tracking-wider transition-colors ${
        active
          ? "text-primary border-b-2 border-primary"
          : "text-text-muted hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
