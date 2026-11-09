import React, { useState, useEffect, useCallback } from 'react';
import CabinHeader from './components/CabinHeader';
import TacticalActions from './components/TacticalActions';
import EvidenceCapture from './components/EvidenceCapture';
import OutboxVisualizer from './components/OutboxVisualizer';
import { syncManager } from './services/syncManager';
import { getAllOutboxEvidences } from './services/indexedDbOutbox';

export default function App() {
  const [isOnline, setIsOnline] = useState(syncManager.getEffectiveOnlineStatus());
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(syncManager.isSimulatingOffline);
  const [isSyncing, setIsSyncing] = useState(false);
  const [evidences, setEvidences] = useState([]);
  const [activeTab, setActiveTab] = useState('CABINA'); // CABINA | OUTBOX
  const [perfilCabina, setPerfilCabina] = useState({
    camionId: 'B-04',
    matricula: 'SGT-7721',
    nombre: 'Sgto. Juan Pérez (Cisterna Pesada)',
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt capturado con éxito');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('[PWA] Decisión del usuario:', choice);
      setDeferredPrompt(null);
    } else {
      alert("🚒 Instalación de Terminal de Cabina PWA:\n\n1. En PC: Abre el menú de Chrome (los 3 puntos verticales arriba a la derecha) ➔ 'Guardar y compartir' ➔ 'Instalar página como aplicación' o 'Instalar Bomberos SCZ'.\n\n2. En Celular: En el menú de Chrome (3 puntos) ➔ 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
    }
  };

  // Cargar evidencias de IndexedDB
  const refreshEvidences = useCallback(async () => {
    try {
      const items = await getAllOutboxEvidences();
      setEvidences(items);
    } catch (err) {
      console.error('[App] Error al leer IndexedDB:', err);
    }
  }, []);

  // Inicialización y suscripción a eventos
  useEffect(() => {
    // 1. Cargar outbox inicial
    refreshEvidences();

    // 2. Suscribirse a cambios de red y sincronización
    const unsubscribe = syncManager.subscribe((event, data) => {
      if (event === 'NETWORK_CHANGE') {
        setIsOnline(data.isOnline);
      } else if (event === 'SYNC_STARTED') {
        setIsSyncing(true);
      } else if (event === 'SYNC_FINISHED' || event === 'ITEM_CONFIRMED') {
        setIsSyncing(false);
        refreshEvidences();
      }
    });

    // 3. Registrar Service Worker si está soportado
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[App] Service Worker registrado exitosamente con scope:', reg.scope);
          reg.update();
        })
        .catch((err) => {
          console.warn('[App] Error registrando Service Worker:', err);
        });
    }

    return () => {
      unsubscribe();
    };
  }, [refreshEvidences]);

  // Manejador del toggle de simulación offline
  const handleToggleSimulatedOffline = () => {
    const nextSimState = !isSimulatingOffline;
    setIsSimulatingOffline(nextSimState);
    syncManager.setSimulatedOffline(nextSimState);
  };

  const pendingCount = evidences.filter((e) => e.status === 'PENDIENTE_SYNC').length;

  return (
    <div className="cabin-app-container">
      {/* Cabecera táctica con estado de red y reloj */}
      <CabinHeader
        isOnline={isOnline}
        isSimulatingOffline={isSimulatingOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        pendingCount={pendingCount}
        camionId={perfilCabina.camionId}
        matricula={perfilCabina.matricula}
        onCambiarPerfil={(nuevo) => setPerfilCabina(nuevo)}
        onInstallApp={handleInstallApp}
      />

      {/* Barra de Pestañas Tácticas */}
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'CABINA' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('CABINA')}
        >
          🚒 TERMINAL TÁCTICA & IA LOCAL
        </button>

        <button
          className={`tab-btn ${activeTab === 'OUTBOX' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('OUTBOX')}
        >
          📦 BANDEJA LOCAL (OUTBOX)
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
      </nav>

      {/* Contenido Principal según pestaña */}
      <main className="main-content">
        {activeTab === 'CABINA' && (
          <div className="cabin-view-grid">
            <TacticalActions
              camionId={perfilCabina.camionId}
              isOnline={isOnline}
              onActionRecorded={() => refreshEvidences()}
            />

            <EvidenceCapture
              camionId={perfilCabina.camionId}
              matricula={perfilCabina.matricula}
              incidenteId="INC-2026-0891"
              isOnline={isOnline}
              onEvidenceSaved={() => refreshEvidences()}
            />
          </div>
        )}

        {activeTab === 'OUTBOX' && (
          <OutboxVisualizer
            evidences={evidences}
            isSyncing={isSyncing}
            isOnline={isOnline}
            onRefresh={refreshEvidences}
          />
        )}
      </main>

      {/* Pie de página institucional */}
      <footer className="tactical-footer">
        <span className="font-mono">
          UNIDAD B-04 &bull; CISTERNA TÁCTICO &bull; ESTACIÓN 1 - SANTA CRUZ DE LA SIERRA
        </span>
        <span className="font-mono text-muted">
          PWA V1.0.0 &bull; WEB WORKER: ONNX RUNTIME / TRANSFORMERS.JS &bull; DB: INDEXEDDB LOCAL
        </span>
      </footer>
    </div>
  );
}
