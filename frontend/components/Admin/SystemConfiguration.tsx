import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Mail,
  AlertTriangle,
  Save,
  RefreshCw,
  Info,
  Database,
  Lock,
  Globe,
  Bell
} from 'lucide-react';
import { systemApi, SystemConfig } from '../../services/api/system';
import { Button } from '../Button';
import { Switch } from '../Switch';
import { toast } from 'sonner';

const SystemConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig & { email_verification_enabled?: boolean }>({
    payment_gateway_enabled: false,
    at_risk_alerts_enabled: true,
    email_verification_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await systemApi.getConfig();
      setConfig(data as any);
    } catch (error) {
      console.error('Failed to fetch system config:', error);
      toast.error('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof config) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await systemApi.updateConfig(config);
      toast.success('System configuration updated successfully');
    } catch (error) {
      console.error('Failed to update system config:', error);
      toast.error('Failed to save system configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-textMuted animate-pulse">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-text flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            System Configuration
          </h1>
          <p className="text-textMuted mt-1">Manage global system features, security protocols, and feature flags.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="shadow-lg shadow-primary/20 gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Features */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline bg-surfaceLow/50">
            <h2 className="text-lg font-headline font-semibold text-text flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Core Features
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Email Verification Toggle */}
            <div className="flex items-start justify-between gap-4 group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text" />
                  <label className="font-medium text-text">Global Email Verification</label>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${config.email_verification_enabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {config.email_verification_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-textMuted leading-relaxed">
                  When enabled, all new signups must verify their email address before accessing the platform.
                  Disabling this allows instant access but increases security risk.
                </p>
              </div>
              <Switch
                checked={!!config.email_verification_enabled}
                onCheckedChange={() => handleToggle('email_verification_enabled')}
              />
            </div>

            <div className="h-px bg-outline/50" />

            {/* Payment Gateway Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-textMuted">
                  <Globe className="w-4 h-4" />
                  <label className="font-medium opacity-70">Payment Gateway (Beta)</label>
                  <span className="text-[10px] bg-surfaceHigh text-textMuted px-1.5 py-0.5 rounded-full font-bold uppercase">Locked</span>
                </div>
                <p className="text-sm text-textMuted leading-relaxed">
                  Enable integrated payments for premium institution features and automated course enrollment fees.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-primary italic">
                  <Info size={10} />
                  Coming soon in v2.4
                </div>
              </div>
              <Switch checked={!!config.payment_gateway_enabled} onCheckedChange={() => {}} disabled />
            </div>
          </div>
        </section>

        {/* Analytics & Alerts */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline bg-surfaceLow/50">
            <h2 className="text-lg font-headline font-semibold text-text flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Intelligence & Alerts
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* At-Risk Alerts Toggle */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-text" />
                  <label className="font-medium text-text">At-Risk Student Detection</label>
                </div>
                <p className="text-sm text-textMuted leading-relaxed">
                  Uses machine learning to identify students falling below attendance thresholds and triggers automated intervention alerts to lecturers.
                </p>
              </div>
              <Switch
                checked={!!config.at_risk_alerts_enabled}
                onCheckedChange={() => handleToggle('at_risk_alerts_enabled')}
              />
            </div>

            <div className="h-px bg-outline/50" />

            {/* Smart Notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-textMuted">
                  <ShieldCheck className="w-4 h-4" />
                  <label className="font-medium opacity-70">Anomaly Detection</label>
                </div>
                <p className="text-sm text-textMuted leading-relaxed">
                  Real-time monitoring for suspicious attendance patterns, proxy attempts, and geolocation spoofing.
                </p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} disabled />
            </div>
          </div>
        </section>

        {/* Database & Maintenance */}
        <section className="bg-surface border border-outline rounded-2xl overflow-hidden shadow-sm md:col-span-2">
          <div className="p-6 border-b border-outline bg-surfaceLow/50 flex items-center justify-between">
            <h2 className="text-lg font-headline font-semibold text-text flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security & Maintenance
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-4 bg-surfaceLow border border-outline rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-text font-semibold">
                    <Database size={18} className="text-primary" />
                    Data Retention
                  </div>
                  <p className="text-xs text-textMuted">Attendance logs are currently retained indefinitely. Auto-archiving is disabled.</p>
                  <Button variant="ghost" size="sm" className="mt-auto w-fit text-primary h-auto py-1">Manage Archive</Button>
               </div>

               <div className="p-4 bg-surfaceLow border border-outline rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-text font-semibold">
                    <RefreshCw size={18} className="text-primary" />
                    System Cache
                  </div>
                  <p className="text-xs text-textMuted">Reduces DB load by caching institution metadata. Last cleared 2 hours ago.</p>
                  <Button variant="ghost" size="sm" className="mt-auto w-fit text-primary h-auto py-1" onClick={() => toast.success('Cache cleared')}>Clear Cache</Button>
               </div>

               <div className="p-4 bg-surfaceLow border border-outline rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-text font-semibold">
                    <AlertTriangle size={18} className="text-red-500" />
                    Maintenance Mode
                  </div>
                  <p className="text-xs text-textMuted">Prevents user logins while performing database migrations or system updates.</p>
                  <Button variant="ghost" size="sm" className="mt-auto w-fit text-red-500 h-auto py-1" onClick={() => toast.info('Maintenance mode requires super-admin password')}>Enable Mode</Button>
               </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-center p-6 bg-primary/5 border border-primary/20 rounded-2xl gap-3 text-center">
        <Info className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-text/80">
          Changes to <strong>Global Email Verification</strong> take effect immediately for all new signups across all institutions.
          Existing users will not be affected.
        </p>
      </div>
    </div>
  );
};

export default SystemConfiguration;
