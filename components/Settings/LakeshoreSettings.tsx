/**
 * LakeshoreSettings.tsx
 *
 * Settings panel for configuring a personal on-premises (Lakeshore) endpoint.
 * Users can supply the tunnel URL, an optional API key, and an optional label.
 *
 * This component reads from and writes directly to localStorage (via utils/app/settings)
 * so that the Lakeshore config persists across sessions independently of the main
 * Settings save button.  It follows the same self-contained save pattern used by
 * MCPServersTab and ApiKeys.
 */

import { FC, useEffect, useState } from 'react';
import {
  IconPlugConnected,
  IconPlugConnectedX,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconInfoCircle,
  IconDeviceDesktopAnalytics,
} from '@tabler/icons-react';
import { LakeshoreConfig } from '@/types/settings';
import { getSettings, saveSettings } from '@/utils/app/settings';

interface Props {
  open: boolean;
  setUnsavedChanges?: (hasChanges: boolean) => void;
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'error';

export const LakeshoreSettings: FC<Props> = ({ open, setUnsavedChanges }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saved, setSaved] = useState(false);

  // Load current config from localStorage when the tab is opened
  useEffect(() => {
    if (!open) return;
    const settings = getSettings({});
    const cfg = settings.lakeshoreConfig;
    setUrl(cfg?.url ?? '');
    setKey(cfg?.key ?? '');
    setLabel(cfg?.label ?? '');
    setTestStatus('idle');
    setTestMessage('');
    setSaved(false);
  }, [open]);

  const isDirty = () => {
    const settings = getSettings({});
    const cfg = settings.lakeshoreConfig;
    return (
      url !== (cfg?.url ?? '') ||
      key !== (cfg?.key ?? '') ||
      label !== (cfg?.label ?? '')
    );
  };

  useEffect(() => {
    setUnsavedChanges?.(isDirty());
  }, [url, key, label]);

  const handleSave = () => {
    const settings = getSettings({});
    const trimmedUrl = url.trim().replace(/\/$/, '');

    if (trimmedUrl) {
      const newConfig: LakeshoreConfig = { url: trimmedUrl };
      if (key.trim()) newConfig.key = key.trim();
      if (label.trim()) newConfig.label = label.trim();
      settings.lakeshoreConfig = newConfig;
    } else {
      // Empty URL means the user is clearing the config
      delete settings.lakeshoreConfig;
    }

    saveSettings(settings);
    setUrl(trimmedUrl);
    setSaved(true);
    setUnsavedChanges?.(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setUrl('');
    setKey('');
    setLabel('');
    setTestStatus('idle');
    setTestMessage('');
  };

  const handleTest = async () => {
    const trimmedUrl = url.trim().replace(/\/$/, '');
    if (!trimmedUrl) {
      setTestStatus('error');
      setTestMessage('Please enter a URL before testing.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('');

    try {
      const headers: Record<string, string> = {};
      if (key.trim()) headers['Authorization'] = `Bearer ${key.trim()}`;

      const response = await fetch(`${trimmedUrl}/v1/models`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        setTestStatus('error');
        setTestMessage(`Server responded with HTTP ${response.status} ${response.statusText}.`);
        return;
      }

      const data = await response.json();
      const modelList: string[] = (data?.data ?? []).map((m: any) => m.id ?? m).filter(Boolean);
      const summary =
        modelList.length > 0
          ? `Connected. Available models: ${modelList.slice(0, 5).join(', ')}${modelList.length > 5 ? ` (+${modelList.length - 5} more)` : ''}.`
          : 'Connected. No models listed at /v1/models.';

      setTestStatus('ok');
      setTestMessage(summary);
    } catch (err: any) {
      setTestStatus('error');
      const msg =
        err?.name === 'TimeoutError'
          ? 'Connection timed out after 8 s. Check that the tunnel is running.'
          : err?.message ?? 'Unknown error';
      setTestMessage(msg);
    }
  };

  const testIcon = () => {
    if (testStatus === 'testing')
      return <IconLoader2 size={16} className="animate-spin text-blue-500" />;
    if (testStatus === 'ok')
      return <IconPlugConnected size={16} className="text-green-500" />;
    if (testStatus === 'error')
      return <IconPlugConnectedX size={16} className="text-red-500" />;
    return <IconPlugConnected size={16} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6 p-1">

      {/* Info banner */}
      <div className="flex gap-3 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 p-3 text-sm text-blue-800 dark:text-blue-200">
        <IconInfoCircle size={20} className="mt-0.5 shrink-0 text-blue-500" />
        <div>
          <p className="font-medium mb-1">Personal On-Premises Endpoint</p>
          <p>
            Configure a personal tunnel URL pointing to an OpenAI-compatible server
            (e.g.{' '}
            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">
              Ollama
            </span>
            ,{' '}
            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">
              vLLM
            </span>
            ,{' '}
            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded">
              LM Studio
            </span>
            ). This overrides the org-wide Lakeshore endpoint for your account only.
            Leave blank to use the org-wide setting configured by your administrator.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="settings-card">
        <div className="settings-card-header flex flex-row items-center gap-3">
          <IconDeviceDesktopAnalytics size={20} className="text-blue-500" />
          <h3 className="settings-card-title">Lakeshore Endpoint</h3>
        </div>

        <div className="settings-card-content space-y-4">

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tunnel URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-tunnel.ngrok.io"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The base URL of your tunnel — do not include <span className="font-mono">/v1/chat/completions</span>.
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium mb-1">
              API Key <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Leave blank if no key is required"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Stored in browser localStorage only — never sent to Amplify's servers unencrypted.
            </p>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Label <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Lab Server, Home Machine"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {testIcon()}
              {testStatus === 'testing' ? 'Testing…' : 'Test Connection'}
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <IconCheck size={16} />
                  Saved
                </>
              ) : (
                'Save'
              )}
            </button>

            {url && (
              <button
                onClick={handleClear}
                className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Test result */}
          {testMessage && (
            <div
              className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                testStatus === 'ok'
                  ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
                  : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              }`}
            >
              {testStatus === 'ok' ? (
                <IconPlugConnected size={16} className="mt-0.5 shrink-0 text-green-500" />
              ) : (
                <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin info */}
      <div className="rounded-md border border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-gray-900/40 p-3 text-xs text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">For Administrators</p>
        <p>
          Org-wide Lakeshore models are configured via AWS Secrets Manager (key:{' '}
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">lakeshore</span>) and the
          Admin → Supported Models panel. Users do not need to set a personal URL to use
          administrator-configured Lakeshore models.
        </p>
      </div>
    </div>
  );
};
