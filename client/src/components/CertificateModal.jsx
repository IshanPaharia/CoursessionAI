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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; }
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            background: #f8f8f8; 
            padding: 40px;
          }
          .cert {
            width: 900px; 
            padding: 60px; 
            background: white;
            border: 1px solid #e5e7eb; 
            position: relative;
            text-align: center; 
            font-family: 'Inter', sans-serif;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
          }
          .cert h1 { font-size: 42px; color: #111827; margin-bottom: 12px; font-weight: 700; letter-spacing: -0.02em; }
          .cert .sub { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 30px; font-weight: 600; }
          .cert .name { font-size: 28px; font-weight: 700; color: #111827; margin: 20px 0 8px; }
          .cert .course { font-size: 22px; font-weight: 600; color: #374151; margin-bottom: 8px; }
          .cert .date { font-size: 14px; color: #6b7280; margin-top: 24px; font-weight: 500; }
          .cert .id { font-size: 11px; color: #9ca3af; margin-top: 24px; font-family: monospace; }
          .divider { height: 1px; width: 100px; background: #e5e7eb; margin: 24px auto; }
          @media print { 
            @page { size: landscape; margin: 0; }
            html, body { 
              height: 100%; 
              margin: 0 !important; 
              padding: 0 !important; 
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { 
              display: flex !important; 
              align-items: center !important; 
              justify-content: center !important; 
            }
            .cert { 
              width: 100% !important; 
              height: 100% !important; 
              max-width: none !important;
              border: none !important; 
              box-shadow: none !important; 
              border-radius: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              padding: 0 10% !important;
              background: white !important;
            }
            .cert h1 { font-size: 64px; }
            .cert .name { font-size: 48px; }
            .cert .course { font-size: 32px; }
            .cert .sub { font-size: 16px; margin-bottom: 40px; }
            .cert .date { font-size: 18px; }
            .cert .id { font-size: 12px; }
            .divider { width: 200px; margin: 40px auto; }
          }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="sub">Certificate of Completion</div>
          <h1>CoursessionAI</h1>
          <div class="divider"></div>
          <p style="margin: 16px 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">This certifies that</p>
          <p class="name">${certificate.display_name || certificate.email}</p>
          <p style="color: #6b7280; margin-bottom: 8px; font-size: 14px; font-weight: 500;">has successfully completed</p>
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
      <div className="rounded-xl border border-outline-variant bg-surface-container px-6 sm:px-8 py-8 sm:py-10 text-center shadow-sm">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[4px] text-on-surface-variant">
          Certificate of Completion
        </p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-display font-bold text-on-surface">
          CoursessionAI
        </h2>
        <div className="mx-auto my-5 sm:my-6 h-px w-24 bg-outline-variant" />
        <p className="text-sm font-medium text-on-surface-variant">This certifies that</p>
        <p className="mt-2 text-lg sm:text-xl font-bold text-on-surface">
          {certificate.display_name || certificate.email}
        </p>
        <p className="mt-3 text-sm font-medium text-on-surface-variant">has successfully completed</p>
        <p className="mt-2 text-base sm:text-lg font-bold text-on-surface">
          {certificate.course_title}
        </p>
        <p className="mt-5 text-xs font-medium text-on-surface-variant">{formatDate(certificate.completed_at)}</p>
        <p className="mt-2 font-mono text-[10px] text-on-surface-variant/60">
          ID: {certificate.certificate_uid}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="btn-secondary flex-1 py-2.5 justify-center rounded-md border border-outline-variant font-semibold text-sm"
        >
          <Download className="h-4 w-4" />
          Print / Save PDF
        </button>
        <button
          onClick={handleShare}
          className="btn-primary flex-1 py-2.5 justify-center font-semibold text-sm"
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-outline-variant p-6 sm:p-8 shadow-xl bg-surface animate-slide-up">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-on-surface" />
            <h2 className="text-lg font-display font-semibold text-on-surface">Certificate</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : certificate ? (
          <CertificateCard certificate={certificate} />
        ) : isComplete ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
              <Award className="h-8 w-8 text-on-surface-variant" />
            </div>
            <h3 className="text-xl font-display font-semibold text-on-surface">Congratulations!</h3>
            <p className="mt-2 text-sm text-on-surface-variant font-medium">
              You've completed <strong className="text-on-surface font-semibold">{courseTitle}</strong>
            </p>
            <button
              onClick={() => generateCert.mutate(courseId)}
              disabled={generateCert.isPending}
              className="mt-6 btn-primary w-full py-3 justify-center text-sm disabled:opacity-50"
            >
              {generateCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              Claim Certificate
            </button>
            {generateCert.isError && (
              <p className="mt-3 text-sm font-medium text-red-500">
                {generateCert.error?.response?.data?.error || 'Failed to generate certificate'}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
              <CheckCircle2 className="h-8 w-8 text-on-surface-variant" />
            </div>
            <h3 className="text-xl font-display font-semibold text-on-surface">Not Completed Yet</h3>
            <p className="mt-2 text-sm text-on-surface-variant font-medium">
              Complete all videos to earn your certificate.
            </p>
            <p className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-sm font-semibold text-on-surface">{Math.round(progress)}% progressed</p>
          </div>
        )}
      </div>
    </div>
  );
}
