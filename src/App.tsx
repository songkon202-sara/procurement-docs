import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { PreviewNav } from './components/PreviewNav';
import { Sidebar } from './components/Sidebar';
import { ReviewModal } from './components/ReviewModal';
import { ProjectsModal } from './components/ProjectsModal';
import { DocumentsPanel } from './components/documents/DocumentsPanel';
import { useApp } from './state/store';
import { buildViewModel } from './lib/viewModel';
import { downloadWordDoc } from './lib/wordExport';

const PAGE_WIDTH_PX = 794; // 21cm at 96dpi

export default function App() {
  const { state } = useApp();
  const vm = buildViewModel(state.data, state.category);

  const previewRef = useRef<HTMLElement | null>(null);
  const pagesWrapRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);

  const fitZoom = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;
    const avail = el.clientWidth - 32;
    const z = Math.max(0.35, Math.min(1, avail / PAGE_WIDTH_PX));
    setZoom((prev) => (Math.abs(z - prev) > 0.005 ? z : prev));
  }, []);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => fitZoom());
    ro.observe(el);
    fitZoom();
    return () => ro.disconnect();
  }, [fitZoom]);

  const handleDownloadWord = () => {
    if (!pagesWrapRef.current) return;
    downloadWordDoc(pagesWrapRef.current, state.printSet, state.data.projectName || 'เอกสารจัดซื้อจัดจ้าง');
  };

  return (
    <div className="screen-root" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#dfe4ea' }}>
      <Header onDownloadWord={handleDownloadWord} />

      <div className="screen-row" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar vm={vm} />

        <section className="preview-area" style={{ flex: 1, overflow: 'auto', background: '#dfe4ea', padding: 0 }} ref={previewRef}>
          <PreviewNav cat={vm.cat} />
          <div className="pages-wrap" ref={pagesWrapRef} style={{ padding: '26px 16px', zoom }}>
            <DocumentsPanel data={state.data} vm={vm} />
          </div>
        </section>
      </div>

      {state.showReview && <ReviewModal vm={vm} />}
      {state.showProjects && <ProjectsModal />}
    </div>
  );
}
