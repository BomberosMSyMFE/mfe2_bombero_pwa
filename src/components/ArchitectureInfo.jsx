import React from 'react';

export default function ArchitectureInfo() {
  return (
    <section className="tactical-card">
      <div className="card-header">
        <h2 className="card-title">DEFENSA TÉCNICA ARQUITECTÓNICA (INGENIERÍA DE SOFTWARE II)</h2>
        <span className="badge-mono">PUNTO 5: IA LOCAL & IDEMPOTENCIA</span>
      </div>

      <div className="architecture-grid">
        <div className="arch-card">
          <div className="arch-card-header">
            <span className="arch-icon">⚡</span>
            <h3 className="arch-title">1. IA Local en Dedicated Web Worker</h3>
          </div>
          <p className="arch-desc">
            <strong>¿Por qué un Web Worker?</strong> JavaScript en el navegador es monohilo (single-threaded).
            La inferencia de modelos ONNX Runtime Web / Transformers.js satura la CPU o WebGPU durante ~150ms.
            Si corriera en el hilo principal, la interfaz táctil se congelaría impidiendo pulsar botones.
            Al ejecutar el modelo en un Web Worker dedicado, la UI se mantiene fija a 60 FPS estables sin interrupción para los bomberos.
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-card-header">
            <span className="arch-icon">⏱️</span>
            <h3 className="arch-title">2. Identificadores UUID v7 (RFC 9562)</h3>
          </div>
          <p className="arch-desc">
            <strong>¿Por qué UUID v7 y no UUID v4?</strong> UUID v4 es pseudoaleatorio y desordena los índices de base de datos.
            UUID v7 integra el <em>timestamp Unix en milisegundos</em> en sus primeros 48 bits. Esto permite
            que la cola local IndexedDB extraiga y despache los reportes en estricto orden cronológico (FIFO)
            cuando se restablece la señal 4G tras horas de incomunicación en el cañón del siniestro.
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-card-header">
            <span className="arch-icon">🛡️</span>
            <h3 className="arch-title">3. Blindaje de Idempotencia Perimetral</h3>
          </div>
          <p className="arch-desc">
            <strong>¿Qué pasa ante oscilación de red?</strong> Si la antena celular se corta justo después de que el
            servidor guardó la evidencia pero antes de que el móvil reciba la confirmación HTTP 201, el cliente reintentará.
            Con la cabecera <code>X-Idempotency-Key: &lt;UUID-v7&gt;</code>, el backend (Spring Boot / Redis) detecta que la clave ya fue
            completada y responde inmediatamente con HTTP 200 OK y el registro previo, sin duplicar la evidencia en la base de datos.
          </p>
        </div>
      </div>
    </section>
  );
}
