import { AppShell } from '../components/layout/AppShell.jsx';
import { CustomerDashboardPage } from '../features/customers/pages/CustomerDashboardPage.jsx';

export default function App() {
  return (
    <AppShell>
      <CustomerDashboardPage />
    </AppShell>
  );
}
