import { useAppConfig } from '@renderer/hooks/useAppConfig';
import { useAudioDevices } from '@renderer/hooks/useAudioDevices';
import { useI18n } from '@renderer/hooks/useI18n';
import { useState } from 'react';
import { MetronomeSettingsSection } from './MetronomeSettingsPage';
import { PadSettingsSection } from './PadSettingsPage';

export const SettingsPage = () => {
  const {
    theme,
    language,
    setLanguage,
    setTheme,
    tracksOutputDeviceId,
    metronomeOutputDeviceId,
    setMetronomeOutputDeviceId,
    setTracksOutputDeviceId
  } = useAppConfig();
  const { t } = useI18n();
  const devices = useAudioDevices();
  const [activeTab, setActiveTab] = useState<'preferences' | 'pad' | 'metronome'>('preferences');

  const isLightTheme = theme === 'light';
  const isEnglish = language === 'en';

  const activeTitle =
    activeTab === 'preferences'
      ? t('preferences')
      : activeTab === 'pad'
        ? t('padsSettings')
        : t('metronomeSettings');

  return (
    <div className="app-container" style={{ padding: '20px', overflowY: 'auto' }}>
      <div className="button-group" style={{ marginBottom: '20px' }}>
        <button
          className={`theme-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          {t('preferences')}
        </button>
        <button
          className={`theme-btn ${activeTab === 'pad' ? 'active' : ''}`}
          onClick={() => setActiveTab('pad')}
        >
          {t('padsSettings')}
        </button>
        <button
          className={`theme-btn ${activeTab === 'metronome' ? 'active' : ''}`}
          onClick={() => setActiveTab('metronome')}
        >
          {t('metronomeSettings')}
        </button>
      </div>

      <h2>{activeTitle}</h2>

      {activeTab === 'preferences' && (
        <>
          <div className="control-group" style={{ marginBottom: '20px' }}>
            <label>{t('theme')}</label>
            <div className="button-group">
              <button
                className={`theme-btn ${isLightTheme ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                {t('lightMode')}
              </button>
              <button
                className={`theme-btn ${!isLightTheme ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                {t('darkMode')}
              </button>
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '20px' }}>
            <label>{t('language')}</label>
            <div className="button-group">
              <button
                className={`theme-btn ${!isEnglish ? 'active' : ''}`}
                onClick={() => setLanguage('es')}
              >
                Español
              </button>
              <button
                className={`theme-btn ${isEnglish ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '20px' }}>
            <label>{t('audioOutputs')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div
                  style={{
                    marginBottom: '8px',
                    fontSize: '0.85rem',
                    opacity: 0.8,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {t('padsOutput')}
                </div>
                <select
                  className="form-control"
                  value={tracksOutputDeviceId || 'default'}
                  onChange={(e) => setTracksOutputDeviceId(e.target.value)}
                >
                  <option value="default">{t('defaultOutput')}</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div
                  style={{
                    marginBottom: '8px',
                    fontSize: '0.85rem',
                    opacity: 0.8,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {t('metronomeOutput')}
                </div>
                <select
                  className="form-control"
                  value={metronomeOutputDeviceId || 'default'}
                  onChange={(e) => setMetronomeOutputDeviceId(e.target.value)}
                >
                  <option value="default">{t('defaultOutput')}</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'pad' && <PadSettingsSection />}
      {activeTab === 'metronome' && <MetronomeSettingsSection />}
    </div>
  );
};
