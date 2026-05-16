import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Download, FileText, ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../ui/Button';

function formatBytes(n) {
  if (n == null) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function NoticeAttachmentManager({ noticeId, dark = false, onUpdated, readOnly = false }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!noticeId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/notices/${noticeId}`);
      setAttachments(data.attachments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load attachments');
    } finally {
      setLoading(false);
    }
  }, [noticeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function downloadFile(att) {
    try {
      const res = await api.get(`/notices/${noticeId}/attachments/${att.id}/file`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.original_name || 'download';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  }

  async function previewFile(att) {
    const ok =
      att.mime_type?.startsWith('image/') ||
      att.mime_type === 'application/pdf' ||
      att.mime_type?.includes('pdf');
    if (!ok) {
      downloadFile(att);
      return;
    }
    try {
      const res = await api.get(`/notices/${noticeId}/attachments/${att.id}/file`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Preview failed');
    }
  }

  async function onFileChange(e) {
    const input = e.target;
    const files = input.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      await api.post(`/notices/${noticeId}/attachments`, fd);
      toast.success('Files attached');
      await refresh();
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      input.value = '';
    }
  }

  const labelCls = dark ? 'text-xs font-medium text-slate-400' : 'text-xs font-medium text-slate-600';
  const cardCls = dark
    ? 'rounded-xl border border-white/10 bg-slate-950/60 p-3'
    : 'rounded-xl border border-slate-200/80 bg-white/70 p-3';

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading attachments…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${dark ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50'}`}>
            <Paperclip className="h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Add files'}
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,application/pdf,image/*"
              disabled={uploading}
              onChange={onFileChange}
            />
          </label>
          <span className={labelCls}>PDF, images, Word (max per server policy)</span>
        </div>
      )}

      {!attachments.length ? (
        <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li key={att.id} className={cardCls}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  {att.mime_type?.startsWith('image/') ? (
                    <ImageIcon className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-hub-teal' : 'text-hub-teal'}`} />
                  ) : (
                    <FileText className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-hub-purple' : 'text-hub-purple'}`} />
                  )}
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {att.original_name}
                    </p>
                    <p className={`text-[11px] ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {att.mime_type} · {formatBytes(att.size_bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className={
                      dark
                        ? '!border-white/15 !bg-transparent py-1 text-xs !text-slate-200'
                        : 'py-1 text-xs'
                    }
                    onClick={() => previewFile(att)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={
                      dark
                        ? '!border-white/15 !bg-transparent py-1 text-xs !text-slate-200'
                        : 'py-1 text-xs'
                    }
                    onClick={() => downloadFile(att)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
