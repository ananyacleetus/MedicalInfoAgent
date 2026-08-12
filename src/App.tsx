import React from 'react';
import { MedicalDataProvider, useMedicalData } from './context/MedicalDataContext';
import { Navbar } from './components/Navbar';
import { DocumentUploader } from './components/DocumentUploader';
import { DocumentVault } from './components/DocumentVault';
import { DocumentViewer } from './components/DocumentViewer';
import { ClassRegistryInspector } from './components/ClassRegistryInspector';
import { AgentBridgeView } from './components/AgentBridgeView';
import { TrendDashboard } from './components/TrendDashboard';
import { MedicationDashboard } from './components/MedicationDashboard';
import { TimelineDashboard } from './components/TimelineDashboard';

const MainContent: React.FC = () => {
  const { activeTab } = useMedicalData();

  return (
    <main>
      {activeTab === 'uploader' && <DocumentUploader />}
      {activeTab === 'vault' && <DocumentVault />}
      {activeTab === 'viewer' && <DocumentViewer />}
      {activeTab === 'registry' && <ClassRegistryInspector />}
      {activeTab === 'bridge' && <AgentBridgeView />}
      {activeTab === 'trends' && <TrendDashboard />}
      {activeTab === 'medications' && <MedicationDashboard />}
      {activeTab === 'timeline' && <TimelineDashboard />}
    </main>
  );
};

export function App() {
  return (
    <MedicalDataProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <MainContent />
        </div>
      </div>
    </MedicalDataProvider>
  );
}

export default App;
