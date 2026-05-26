import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PublicCertificate() {
  const { uid } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-certificate', uid],
    queryFn: async () => {
      const { data } = await api.get(`/api/certificates/public/${uid}`);
      return data.certificate;
    },
    enabled: !!uid,
    retry: false,
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-12">
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-on-surface-variant">Loading certificate...</p>
        </div>
      ) : isError || !data ? (
        <div className="max-w-md text-center rounded-xl border border-outline-variant p-6 bg-surface shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-display font-semibold text-on-surface">Certificate Not Found</h2>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            This certificate is invalid or does not exist. Please check the URL and try again.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 btn-primary py-2.5 px-4 font-semibold text-sm rounded-md">
            Go to CoursessionAI
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          {/* Certificate Container */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container px-6 sm:px-12 py-12 sm:py-16 text-center shadow-xl relative overflow-hidden">
            {/* Elegant Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
            
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Award className="h-7 w-7" />
            </div>

            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[6px] text-on-surface-variant">
              Certificate of Completion
            </p>
            
            <h1 className="mt-4 text-3xl sm:text-4xl font-display font-bold text-on-surface">
              CoursessionAI
            </h1>
            
            <div className="mx-auto my-6 sm:my-8 h-px w-32 bg-outline-variant" />
            
            <p className="text-sm sm:text-base font-medium text-on-surface-variant">
              This certifies that
            </p>
            
            <p className="mt-3 text-2xl sm:text-3xl font-display font-bold text-on-surface">
              {data.display_name || data.email}
            </p>
            
            <p className="mt-4 text-sm sm:text-base font-medium text-on-surface-variant">
              has successfully completed the structured learning path
            </p>
            
            <p className="mt-3 text-lg sm:text-xl font-bold text-on-surface max-w-lg mx-auto leading-snug">
              {data.course_title}
            </p>
            
            <p className="mt-8 text-xs sm:text-sm font-medium text-on-surface-variant">
              Completed on {formatDate(data.completed_at)}
            </p>
            
            <p className="mt-3 font-mono text-[10px] sm:text-xs text-on-surface-variant/60">
              Certificate ID: {data.certificate_uid}
            </p>
          </div>

          {/* Viral Call-To-Action */}
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-on-surface-variant">
              Want to build custom structured courses from YouTube playlists?
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 btn-primary py-3 px-6 font-semibold text-sm rounded-md shadow-md"
            >
              Start Learning on CoursessionAI
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
