import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './theme/components/ThemeProvider';
import { HomePage } from './pages/HomePage';
import { DocPage } from './pages/DocPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs/*" element={<DocPage />} />
          <Route path="/docs" element={<Navigate to="/docs/intro" replace />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
