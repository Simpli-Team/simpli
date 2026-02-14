import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './theme/components/ThemeProvider';
import HomePage from './pages/HomePage';
import { DocPage } from './pages/DocPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs/*" element={<DocPage />} />
          <Route path="/docs" element={<Navigate to="/docs/intro" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
