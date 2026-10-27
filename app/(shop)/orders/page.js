'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Phone, Truck } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const PEACH_LIGHT = '#F7EDE4';
const PEACH_WASH = '#FBE8D9';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';
const SAGE = '#7C9473';
const RUST = '#B0503A';
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

const STATUS_STYLES = {
  placed:    { color: INK_SOFT, background: '#F5F1EC' },
  confirmed: { color: PEACH,    background: PEACH_LIGHT },
  packed:    { color: PEACH,    background: PEACH_LIGHT },
  shipped:   { color: '#B8763F', background: PEACH_WASH },
  delivered: { color: SAGE,     background: '#EEF2EA' },
  cancelled: { color: RUST,     background: '#FBEAE6' },
  returned:  { color: INK_SOFT, background: '#F5F1EC' },
};

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch('/api/orders/by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setOrders(data.orders || []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10 sm:py-14 min-h-[60vh]" style={{ background: PAPER }}>
      <h1 className="text-[24px] sm:text-[28px] mb-1.5" style={{ fontFamily: FONT_SERIF, color: INK }}>
        My Orders
      </h1>
      <p className="text-sm mb-7" style={{ color: INK_SOFT }}>
        Enter the phone number you used at checkout to view your orders.
      </p>

      <form onSubmit={handleLookup} className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Phone size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: INK_SOFT }} />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
            className="w-full pl-9 pr-3.5 py-2.5 text-sm outline-none"
            style={{ border: `1px solid ${LINE}`, borderRadius: '3px', color: INK, background: PAPER }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-medium px-5 py-2.5 shrink-0 transition-opacity active:opacity-80 disabled:opacity-50"
          style={{ background: PEACH, color: PAPER, borderRadius: '3px' }}
        >
          {loading ? 'Searching…' : 'Find Orders'}
        </button>
      </form>

      {error && <p className="text-sm mb-4" style={{ color: RUST }}>{error}</p>}

      {orders !== null && orders.length === 0 && !error && (
        <div className="text-center py-16">
          <Package size={26} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: PEACH, opacity: 0.5 }} />
          <p className="text-sm" style={{ color: INK_SOFT }}>No orders found for this number</p>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {orders?.map((o) => {
          const statusStyle = STATUS_STYLES[o.status] || { color: INK_SOFT, background: '#F5F1EC' };
          return (
            <div key={o._id} className="p-4" style={{ border: `1px solid ${LINE}`, borderRadius: '4px' }}>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs" style={{ color: INK_SOFT }}>#{o.orderNumber}</span>
                <span
                  className="text-[10.5px] font-medium px-2.5 py-1 capitalize"
                  style={{ ...statusStyle, borderRadius: '3px' }}
                >
                  {o.status}
                </span>
              </div>

              <div className="space-y-3 mb-3.5">
                {o.items.map((it, i) => {
                  const variantLabel = [it.sleeveType, it.zipType, it.pantOption?.name, it.shawlOption?.name]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-11 h-11 overflow-hidden shrink-0 relative" style={{ background: PEACH_WASH, borderRadius: '3px' }}>
                        {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: INK }}>{it.name}</p>
                        <p className="text-xs" style={{ color: INK_SOFT }}>
                          Qty {it.qty}{variantLabel ? ` · ${variantLabel}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-sm pt-3.5" style={{ borderTop: `1px solid ${LINE}` }}>
                <span style={{ color: INK_SOFT }}>
                  {o.items.length} item{o.items.length > 1 ? 's' : ''}
                </span>
                <span style={{ color: PEACH }}>{formatINR(o.total)}</span>
              </div>

              {o.courier?.trackingId && (
                <div className="flex items-center gap-1.5 text-[11px] mt-2" style={{ color: INK_SOFT }}>
                  <Truck size={11} strokeWidth={1.5} style={{ color: PEACH }} />
                  {o.courier.partner} · {o.courier.trackingId}
                </div>
              )}

              <p className="text-[11px] mt-1.5" style={{ color: INK_SOFT, opacity: 0.7 }}>
                {new Date(o.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}