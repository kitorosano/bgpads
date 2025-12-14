import { HashRouter, Route, Routes } from 'react-router-dom';
import { AboutPage } from './pages/AboutPage';
import { MainPage } from './pages/MainPage';
import { MetronomeSettingsPage } from './pages/MetronomeSettingsPage';
import { PadSettingsPage } from './pages/PadSettingsPage';
import { SettingsPage } from './pages/SettingsPage';

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pads-settings" element={<PadSettingsPage />} />
        <Route path="/metronome-settings" element={<MetronomeSettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
