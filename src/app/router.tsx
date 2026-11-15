import { createHashRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { HomePage } from '../pages/HomePage';
import { HymnPage } from '../pages/HymnPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { routes } from '../lib/routes';

/** Hash router keeps URLs like #/karoly/9 and works on any static host. */
export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: routes.home, element: <HomePage /> },
      { path: routes.hymnPattern, element: <HymnPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
