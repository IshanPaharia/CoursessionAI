import { useState } from 'react';
import { Award, Download, Share2, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useCertificate, useGenerateCertificate } from '../hooks/useCertificates';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CertificateCard({ certificate }) {
  const shareUrl = `${window.location.origin}/api/certificates/public/${certificate.certificate_uid}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate: ${certificate.course_title}`,
        text: `I completed "${certificate.course_title}" on CoursessionAI!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied!');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certificate.course_title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8f8f8; }
          .cert {
            width: 900px; padding: 60px; background: white;
            border: 3px solid #1a1a2e; position: relative;
            text-align: center; font-family: 'Inter', sans-serif;
          }
          .cert::before {
            content: ''; position: absolute; inset: 10px;
            border: 1px solid #a855f7; pointer-events: none;
          }
          .cert h1 { font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a2e; margin-bottom: 12px; }
          .cert .sub { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 30px; }
          .cert .name { font-size: 28px; font-weight: 600; color: #a855f7; margin: 20px 0 8px; }
          .cert .course { font-size: 22px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
          .cert .date { font-size: 14px; color: #666; margin-top: 24px; }
          .cert .id { font-size: 11px; color: #aaa; margin-top: 24px; }
          .cert .award { width: 60px; margin: 0 auto 16px; }
          @media print { body { background: white; } .cert { border: 3px solid #1a1a2e; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="sub">Certificate of Completion</div>
          <h1>CoursessionAI</h1>
          <p style="margin: 16px 0 8px; color: #666;">This certifies that</p>
          <p class="name">${certificate.display_name || certificate.email}</p>
          <p style="color: #666; margin-bottom: 8px;">has successfully completed</p>
          <p class="course">${certificate.course_title}</p>
          <p class="date">${formatDate(certificate.completed_at)}</p>
          <p class="id">Certificate ID: ${certificate.certificate_uid}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-6">
      {/* Certificate preview */}
      <div className="rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-[#111118] to-[#15151f] px-8 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[4px] text-gray-500">
          Certificate of Completion
        </p>
        <h2 className="mt-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
          CoursessionAI
        </h2>
        <div className="mx-auto my-6 h-px w-32 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <p className="text-sm text-gray-400">This certifies that</p>
        <p className="mt-2 text-xl font-semibold text-white">
          {certificate.display_name || certificate.email}
        </p>
        <p className="mt-3 text-sm text-gray-400">has successfully completed</p>
        <p className="mt-2 text-lg font-semibold text-purple-300">
          {certificate.course_title}
        </p>
        <p className="mt-4 text-xs text-gray-500">{formatDate(certificate.completed_at)}</p>
        <p className="mt-2 font-mono text-[10px] text-gray-600">
          ID: {certificate.certificate_uid}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Print / Save PDF
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}

export default function CertificateModal({ isOpen, onClose, courseId, courseTitle, progress }) {
  const { data: certificate, isLoading } = useCertificate(isOpen ? courseId : null);
  const generateCert = useGenerateCertificate();

  if (!isOpen) return null;

  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Certificate</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : certificate ? (
          <CertificateCard certificate={certificate} />
        ) : isComplete ? (
          <div className="text-center py-8">
            <Award className="mx-auto mb-4 h-16 w-16 text-purple-400/50" />
            <h3 className="text-lg font-semibold text-white">Congratulations! 🎉</h3>
            <p className="mt-1 text-sm text-gray-400">
              You've completed <strong className="text-white">{courseTitle}</strong>
            </p>
            <button
              onClick={() => generateCert.mutate(courseId)}
              disabled={generateCert.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {generateCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              Generate Certificate
            </button>
            {generateCert.isError && (
              <p className="mt-2 text-xs text-red-400">
                {generateCert.error?.response?.data?.error || 'Failed to generate certificate'}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <CheckCircle2 className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Not Completed Yet</h3>
            <p className="mt-1 text-sm text-gray-400">
              Complete all videos to earn your certificate.
            </p>
            <p className="mt-3 text-sm font-medium text-purple-400">{Math.round(progress)}% done</p>
          </div>
        )}
      </div>
    </div>
  );
}
