import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import ErrorBoundary from './shared/components/ui/ErrorBoundary';
import ToastContainer from './shared/components/ui/ToastContainer';

// Create router
const router = createBrowserRouter(routes);

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
