import React from 'react';
import {
  Shield, Smartphone, Monitor, Tablet, Trash2,
  MapPin, Clock, Wifi, ChevronLeft, ShieldCheck,
  ShieldAlert, RefreshCw, Loader2, Globe, Laptop
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { securityApi, UserDevice } from '../../services/api/security';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../Button';
import { SEO } from '../SEO';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';

export const DevicesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: devices, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['security', 'devices'],
    queryFn: securityApi.getDevices
  });

  const trustMutation = useMutation({
    mutationFn: (deviceId: number) => securityApi.trustDevice(deviceId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['security', 'devices'] });
    },
    onError: () => toast.error('Failed to update device trust status')
  });

  const revokeMutation = useMutation({
    mutationFn: (deviceId: number) => securityApi.revokeDevice(deviceId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['security', 'devices'] });
    },
    onError: () => toast.error('Failed to revoke device')
  });

  const getDeviceIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mobile') || lowerName.includes('iphone') || lowerName.includes('android')) return <Smartphone className="w-6 h-6" />;
    if (lowerName.includes('tablet') || lowerName.includes('ipad')) return <Tablet className="w-6 h-6" />;
    if (lowerName.includes('desktop') || lowerName.includes('laptop') || lowerName.includes('windows') || lowerName.includes('mac')) return <Monitor className="w-6 h-6" />;
    return <Laptop className="w-6 h-6" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mobileLayout = (
    <div className="min-h-screen bg-background pb-20">
      {/* <div className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-outline">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surfaceHigh rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-headline">Recognized Devices</h1>
        <div className="ml-auto">
          <button 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="p-2 hover:bg-surfaceHigh rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div> */}

      <div className="p-4 space-y-4">
        <div className="bg-surfaceLow/50 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Shield className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-text">Security Overview</h2>
            <p className="text-sm text-textMuted mt-1">
              Verify and manage devices that have accessed your account. Untrusted devices trigger alerts on new logins.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-textMuted animate-pulse">Scanning secure zones...</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {devices?.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface border border-outline rounded-2xl p-4 overflow-hidden relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {getDeviceIcon(device.device_name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-text truncate max-w-[180px]">{device.device_name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {device.is_trusted ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">
                              <ShieldCheck size={10} /> TRUSTED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <ShieldAlert size={10} /> UNTRUSTED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeMutation.mutate(device.id)}
                      disabled={revokeMutation.isPending}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <MapPin size={14} className="text-primary" />
                      <span>{device.geo_city || 'Unknown'}, {device.geo_country || 'Earth'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <Globe size={14} className="text-primary" />
                      <span className="truncate">{device.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <Clock size={14} className="text-primary" />
                      <span>{formatDate(device.last_seen_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <Wifi size={14} className="text-primary" />
                      <span className="truncate">{device.isp || 'Provider Unknown'}</span>
                    </div>
                  </div>

                  {!device.is_trusted && (
                    <Button
                      variant="primary"
                      className="w-full text-sm py-2.5 h-auto rounded-xl bg-primary/10 border border-primary/20 text-white hover:bg-primary/20"
                      onClick={() => trustMutation.mutate(device.id)}
                      disabled={trustMutation.isPending}
                    >
                      <ShieldCheck size={16} className="mr-2" />
                      Trust this device
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const desktopLayout = (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-outline hover:border-primary/50 rounded-2xl transition-all hover:scale-105 group">
            <ChevronLeft size={28} className="text-textMuted group-hover:text-primary transition-colors" />
          </button>
          <div>
            <h1 className="text-4xl font-black font-headline text-text tracking-tight">Security & Devices</h1>
            <p className="text-textMuted mt-1 text-lg">Manage access to your Presently infrastructure</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-2xl border-outline hover:border-primary/30"
        >
          <RefreshCw size={20} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Check for new devices
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-surfaceHigh/50 to-surface/30 p-8 rounded-[2rem] border border-outline relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <ShieldCheck className="text-blue-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Trusted Zones</h2>
              <p className="text-textMuted leading-relaxed">
                Your account is monitored for anomalies. Devices marked as <b>Trusted</b> will not trigger security alerts during login even if the network environment changes slightly.
              </p>
            </div>
          </div>

          <div className="bg-amber-400/5 p-8 rounded-[2rem] border border-amber-400/20">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <ShieldAlert size={24} />
              <h3 className="font-bold text-xl uppercase tracking-wider">Warning</h3>
            </div>
            <p className="text-textMuted text-sm leading-relaxed italic">
              "If you see a device you don't recognize, revoke it immediately and change your account password."
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-surface/50 animate-pulse rounded-[2rem] border border-outline" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {devices?.map((device, index) => (
                  <motion.div
                    key={device.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="group bg-surface hover:bg-surfaceHigh/50 border border-outline hover:border-primary/40 rounded-[2rem] p-6 shadow-xl transition-all duration-500"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 border border-outline group-hover:border-primary/20">
                        {React.cloneElement(getDeviceIcon(device.device_name) as React.ReactElement, { size: 36 })}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold text-text group-hover:text-primary transition-colors">{device.device_name}</h3>
                          <div className="flex items-center gap-3">
                            {device.is_trusted ? (
                              <span className="flex items-center gap-2 text-xs font-black text-green-400 bg-green-400/10 px-4 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest shadow-lg shadow-green-900/10">
                                <ShieldCheck size={14} /> Trusted
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-xs font-black text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-widest shadow-lg shadow-amber-900/10">
                                <ShieldAlert size={14} /> Untrusted
                              </span>
                            )}
                            <button
                              onClick={() => revokeMutation.mutate(device.id)}
                              disabled={revokeMutation.isPending}
                              className="p-3 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all hover:scale-110 active:scale-95"
                              title="Revoke Device"
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-8 max-w-xl">
                          <div className="flex items-center gap-3 text-textMuted group-hover:text-text transition-colors">
                            <MapPin size={18} className="text-primary/70" />
                            <span className="text-sm font-medium">{device.geo_city || 'Unknown City'}, {device.geo_country || 'Unknown Country'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-textMuted group-hover:text-text transition-colors">
                            <Globe size={18} className="text-primary/70" />
                            <span className="text-sm font-mono tracking-tight">{device.ip_address}</span>
                          </div>
                          <div className="flex items-center gap-3 text-textMuted group-hover:text-text transition-colors">
                            <Clock size={18} className="text-primary/70" />
                            <span className="text-sm font-medium">Last seen {formatDate(device.last_seen_at)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-textMuted group-hover:text-text transition-colors">
                            <Wifi size={18} className="text-primary/70" />
                            <span className="text-sm truncate font-medium">{device.isp || 'Internal Provider'}</span>
                          </div>
                        </div>

                        {!device.is_trusted && (
                          <div className="mt-6 pt-6 border-t border-outline/50">
                            <Button
                              variant="primary"
                              className="rounded-2xl px-8 bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                              onClick={() => trustMutation.mutate(device.id)}
                              disabled={trustMutation.isPending}
                            >
                              <ShieldCheck size={20} className="mr-2" />
                              Add to Trusted Zone
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {devices?.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-outline rounded-[3rem] bg-surface/30">
                  <Activity className="mx-auto text-textMuted mb-6 opacity-20" size={64} />
                  <h3 className="text-2xl font-bold text-text mb-2">No devices registered</h3>
                  <p className="text-textMuted max-w-xs mx-auto">Your active sessions will appear here once you've logged in from a recognized environment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Security & Devices | Presently"
        description="Monitor and manage the devices that have access to your account."
      />
      <ResponsiveContainer mobileChildren={mobileLayout}>
        {desktopLayout}
      </ResponsiveContainer>
    </>
  );
};
