import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, RotateCcw, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export default function BackupsManagement({ userRole }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    if (userRole === 'SUPERADMIN') {
      fetchBackups();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchBackups, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/backup/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al cargar backups');
      }

      const data = await response.json();
      setBackups(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError(err.message);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/backup/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al crear backup');
      }

      const newBackup = await response.json();
      setBackups([newBackup, ...backups]);
      alert('✅ Backup creado exitosamente');
    } catch (err) {
      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBackup = async (fileName) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de que deseas eliminar este backup?\n\n${fileName}`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/backup/${fileName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar backup');
      }

      setBackups(backups.filter(b => b.fileName !== fileName));
      setError(null);
      alert('✅ Backup eliminado exitosamente');
    } catch (err) {
      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    const confirmMessage = `⚠️ OPERACIÓN CRÍTICA\n\nEstas a punto de RESTAURAR el backup:\n"${selectedBackup.fileName}"\n\nTODOS los datos actuales serán REEMPLAZADOS con los datos del backup.\n\n¿Estás completamente seguro?\n\nEscribe RESTAURAR para confirmar.`;

    const response = prompt(confirmMessage);
    if (response !== 'RESTAURAR') {
      alert('Operación cancelada');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const restoreResponse = await fetch(`http://localhost:5000/api/backup/restore/${selectedBackup.fileName}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!restoreResponse.ok) {
        throw new Error('Error al restaurar backup');
      }

      setShowRestoreModal(false);
      setSelectedBackup(null);
      alert('✅ Base de datos restaurada exitosamente. Por favor, recarga la página.');
    } catch (err) {
      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const downloadBackup = async (fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/backup/${fileName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error al descargar backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (userRole !== 'SUPERADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Acceso Denegado</h3>
        <p className="text-red-700">Solo los superadministradores pueden gestionar backups del sistema.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">💾 Gestión de Copias de Seguridad</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Create Backup */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-blue-900 mb-2">Crear Nuevo Backup</h2>
            <p className="text-blue-700 text-sm">Se creará una copia de seguridad completa de la base de datos actual.</p>
          </div>
          <button
            onClick={createBackup}
            disabled={isCreating}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${
              isCreating
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            {isCreating ? 'Creando...' : 'Crear Backup'}
          </button>
        </div>
      </div>

      {/* Backups Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Copias de Seguridad ({backups.length})</h2>
          <p className="text-sm text-gray-600 mt-1">Se mantienen los últimos 10 backups automáticos</p>
        </div>

        {backups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay backups disponibles. Crea uno para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Archivo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tamaño</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Creación</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(backup => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-gray-900">{backup.fileName}</p>
                        <p className="text-xs text-gray-600">Auto/Manual</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700">
                        {backup.fileSize 
                          ? `${(backup.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : 'N/A'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p>{new Date(backup.createdAt).toLocaleDateString('es-PE')}</p>
                        <p className="text-xs text-gray-500">{new Date(backup.createdAt).toLocaleTimeString('es-PE')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 w-fit">
                        <CheckCircle className="w-4 h-4" />
                        Válido
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadBackup(backup.fileName)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 font-semibold text-sm flex items-center gap-1"
                          title="Restaurar"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restaurar
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.fileName)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm flex items-center gap-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">Confirmar Restauración</h3>
            <button
              onClick={() => {
                setShowRestoreModal(false);
                setSelectedBackup(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900 mb-2">⚠️ Advertencia Crítica</h4>
                <p className="text-red-700 text-sm mb-3">
                  Esta operación restaurará la base de datos al estado del backup seleccionado.
                </p>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  <li>TODOS los datos actuales serán ELIMINADOS</li>
                  <li>Se restaurarán los datos del: {new Date(selectedBackup.createdAt).toLocaleDateString('es-PE')}</li>
                  <li>Esta acción no se puede deshacer</li>
                  <li>El sistema se reiniciará después de la restauración</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-gray-900 mb-2">Archivo a restaurar:</p>
            <p className="font-mono text-sm text-gray-700">{selectedBackup.fileName}</p>
            <p className="text-sm text-gray-600 mt-2">
              Tamaño: {selectedBackup.fileSize ? `${(selectedBackup.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={restoreBackup}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              Restaurar Backup
            </button>
            <button
              onClick={() => {
                setShowRestoreModal(false);
                setSelectedBackup(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">ℹ️ Información de Backups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-gray-900 mb-2">Backups Automáticos</p>
            <p className="text-gray-700">Se crean automáticamente cada 6 horas. Se mantienen los últimos 10 backups.</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Backups Manuales</p>
            <p className="text-gray-700">Puedes crear backups bajo demanda en cualquier momento usando el botón de arriba.</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Restauración</p>
            <p className="text-gray-700">Para restaurar un backup, haz clic en el botón "Restaurar". Requerirá confirmación.</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Descargas</p>
            <p className="text-gray-700">Puedes descargar cualquier backup para almacenamiento externo adicional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
