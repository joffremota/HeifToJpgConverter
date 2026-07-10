import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { convertHeifToJpeg } from './utils/converter';
import { createFileId, formatFileSize, isHeifFile, toJpegFileName } from './utils/files';

type ConversionStatus = 'queued' | 'converting' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  status: ConversionStatus;
  outputName: string;
  outputSize?: number;
  outputUrl?: string;
  error?: string;
}

const statusLabel: Record<ConversionStatus, string> = {
  queued: 'Na fila',
  converting: 'Convertendo',
  done: 'Pronto',
  error: 'Falhou'
};

function createQueueItem(file: File): QueueItem {
  return {
    id: createFileId(file),
    file,
    status: 'queued',
    outputName: toJpegFileName(file.name)
  };
}

function revokeOutputUrl(item: QueueItem) {
  if (item.outputUrl) {
    URL.revokeObjectURL(item.outputUrl);
  }
}

function downloadFromUrl(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Falha inesperada na conversao.';
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<QueueItem[]>([]);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeOutputUrl);
    };
  }, []);

  const convertedItems = useMemo(() => items.filter((item) => item.status === 'done' && item.outputUrl), [items]);
  const pendingCount = useMemo(
    () => items.filter((item) => item.status === 'queued' || item.status === 'error').length,
    [items]
  );
  const totalInputSize = useMemo(() => items.reduce((total, item) => total + item.file.size, 0), [items]);
  const totalOutputSize = useMemo(
    () => convertedItems.reduce((total, item) => total + (item.outputSize ?? 0), 0),
    [convertedItems]
  );

  function addFiles(fileList: FileList | File[]) {
    const selectedFiles = Array.from(fileList);
    const acceptedFiles = selectedFiles.filter(isHeifFile);
    const rejectedCount = selectedFiles.length - acceptedFiles.length;

    if (acceptedFiles.length > 0) {
      setItems((current) => [...current, ...acceptedFiles.map(createQueueItem)]);
    }

    if (selectedFiles.length === 0) {
      setNotice(null);
      return;
    }

    if (acceptedFiles.length === 0) {
      setNotice('Selecione arquivos .heic ou .heif.');
      return;
    }

    setNotice(rejectedCount > 0 ? `${rejectedCount} arquivo(s) ignorado(s).` : null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = '';
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function convertItem(item: QueueItem) {
    setItems((current) =>
      current.map((currentItem) => {
        if (currentItem.id !== item.id) {
          return currentItem;
        }

        revokeOutputUrl(currentItem);
        return { ...currentItem, status: 'converting', error: undefined, outputUrl: undefined, outputSize: undefined };
      })
    );

    try {
      const convertedBlob = await convertHeifToJpeg(item.file, quality);
      const outputUrl = URL.createObjectURL(convertedBlob);

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                status: 'done',
                outputUrl,
                outputSize: convertedBlob.size
              }
            : currentItem
        )
      );
    } catch (error) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                status: 'error',
                error: getErrorMessage(error)
              }
            : currentItem
        )
      );
    }
  }

  async function convertPendingItems() {
    if (isConverting) {
      return;
    }

    setIsConverting(true);
    setNotice(null);

    const targets = items.filter((item) => item.status === 'queued' || item.status === 'error');

    for (const item of targets) {
      await convertItem(item);
    }

    setIsConverting(false);
  }

  function downloadItem(item: QueueItem) {
    if (item.outputUrl) {
      downloadFromUrl(item.outputUrl, item.outputName);
    }
  }

  function downloadAll() {
    convertedItems.forEach(downloadItem);
  }

  function removeItem(itemId: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (target) {
        revokeOutputUrl(target);
      }

      return current.filter((item) => item.id !== itemId);
    });
  }

  function clearItems() {
    setItems((current) => {
      current.forEach(revokeOutputUrl);
      return [];
    });
    setNotice(null);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Conversor web</p>
          <h1>HEIF para JPG</h1>
        </div>
        <p className="privacy-note">As imagens sao convertidas localmente no navegador.</p>
      </header>

      <main className="workspace">
        <section className="panel input-panel" aria-labelledby="input-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Entrada</p>
              <h2 id="input-title">Arquivos HEIC/HEIF</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>
              Selecionar arquivos
            </button>
          </div>

          <input
            ref={fileInputRef}
            className="file-input"
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            onChange={handleFileChange}
          />

          <div
            className={`drop-zone${isDragging ? ' is-dragging' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <strong>Solte os arquivos aqui</strong>
            <span>.heic e .heif</span>
          </div>

          {notice && <p className="notice">{notice}</p>}

          <div className="settings-row">
            <label htmlFor="quality">Qualidade JPG</label>
            <div className="quality-control">
              <input
                id="quality"
                type="range"
                min="0.5"
                max="1"
                step="0.01"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
              <output htmlFor="quality">{Math.round(quality * 100)}%</output>
            </div>
          </div>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              disabled={pendingCount === 0 || isConverting}
              onClick={convertPendingItems}
            >
              {isConverting ? 'Convertendo' : 'Converter pendentes'}
            </button>
            <button className="secondary-button" type="button" disabled={convertedItems.length === 0} onClick={downloadAll}>
              Baixar todos
            </button>
            <button className="plain-button" type="button" disabled={items.length === 0 || isConverting} onClick={clearItems}>
              Limpar
            </button>
          </div>
        </section>

        <section className="panel summary-panel" aria-labelledby="summary-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Resumo</p>
              <h2 id="summary-title">Conversoes</h2>
            </div>
          </div>
          <div className="summary-grid">
            <div>
              <span>Arquivos</span>
              <strong>{items.length}</strong>
            </div>
            <div>
              <span>Prontos</span>
              <strong>{convertedItems.length}</strong>
            </div>
            <div>
              <span>Entrada</span>
              <strong>{formatFileSize(totalInputSize)}</strong>
            </div>
            <div>
              <span>Saida</span>
              <strong>{formatFileSize(totalOutputSize)}</strong>
            </div>
          </div>
        </section>

        <section className="panel queue-panel" aria-labelledby="queue-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Fila</p>
              <h2 id="queue-title">Arquivos selecionados</h2>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhum arquivo selecionado</strong>
            </div>
          ) : (
            <div className="file-list">
              {items.map((item) => (
                <article className="file-item" key={item.id}>
                  <div className="preview-frame">
                    {item.outputUrl ? <img src={item.outputUrl} alt="" /> : <span>{item.file.name.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="file-details">
                    <div className="file-title-row">
                      <strong>{item.file.name}</strong>
                      <span className={`status status-${item.status}`}>{statusLabel[item.status]}</span>
                    </div>
                    <div className="file-meta">
                      <span>{formatFileSize(item.file.size)}</span>
                      {item.outputSize && <span>{formatFileSize(item.outputSize)} JPG</span>}
                    </div>
                    {item.error && <p className="error-text">{item.error}</p>}
                  </div>
                  <div className="file-actions">
                    <button className="secondary-button" type="button" disabled={!item.outputUrl} onClick={() => downloadItem(item)}>
                      Baixar
                    </button>
                    <button className="plain-button" type="button" disabled={item.status === 'converting'} onClick={() => removeItem(item.id)}>
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
