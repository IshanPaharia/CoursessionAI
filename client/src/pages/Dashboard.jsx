import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Trash2, Clock, PlayCircle, CheckCircle2, Search, Tag, X, Pin, Award } from 'lucide-react';
import { useCourses, useCreateCourse, useDeleteCourse } from '../hooks/useCourses';
import { useTags, useCreateTag, useDeleteTag, useTagCourse, useUntagCourse } from '../hooks/useTags';
import { useTogglePin } from '../hooks/useCertificates';
import { SkeletonCard } from '../components/Skeleton';
import ContinueCourseCard from '../components/ContinueCourseCard';
import CertificateModal from '../components/CertificateModal';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagModalCourseId, setTagModalCourseId] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [certCourse, setCertCourse] = useState(null);

  const { data: courses, isLoading } = useCourses(searchQuery, selectedTag);
  const { data: tags = [] } = useTags();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const tagCourse = useTagCourse();
  const untagCourse = useUntagCourse();
  const togglePin = useTogglePin();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;
    createCourse.mutate(playlistUrl.trim(), {
      onSuccess: () => setPlaylistUrl(''),
    });
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTag.mutate({ name: newTagName.trim(), color: '#888888' });
    setNewTagName('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative pb-20 sm:pb-8">

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          My <span className="text-secondary">Courses</span>
        </h1>
        <p className="mt-2 text-on-surface-variant font-medium">
          Paste a YouTube playlist URL to create a new course.
        </p>
      </div>

      {/* Add Course Form */}
      <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-3 sm:flex-row animate-slide-up" style={{ animationDelay: '100ms' }}>
        <input
          type="text"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://www.youtube.com/playlist?list=..."
          className="input-field flex-1 text-sm sm:text-base"
          disabled={createCourse.isPending}
        />
        <button
          type="submit"
          disabled={createCourse.isPending || !playlistUrl.trim()}
          className="btn-primary"
        >
          {createCourse.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span className="sm:hidden">ADD</span>
          <span className="hidden sm:inline">ADD COURSE</span>
        </button>
      </form>

      {/* Error */}
      {createCourse.isError && (
        <div className="mb-8 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md px-5 py-4 text-sm font-medium animate-fade-in">
          {createCourse.error?.response?.data?.error
            || createCourse.error?.message
            || 'Failed to create course. Please check the URL and try again.'}
        </div>
      )}

      {/* Continue Course Card */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ContinueCourseCard />
      </div>

      {/* Search & Tags */}
      <div className="mb-8 space-y-4 animate-slide-up bg-surface border border-outline-variant rounded-md p-5" style={{ animationDelay: '300ms' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH COURSES..."
            className="input-field !pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors border ${
              !selectedTag
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-on-surface hover:bg-surface-container border-outline-variant'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <div key={tag.id} className="group/tag relative flex items-center">
              <button
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`flex max-w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors border ${
                  selectedTag === tag.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-on-surface hover:bg-surface-container border-outline-variant'
                }`}
              >
                {tag.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete tag "${tag.name}"?`)) {
                    if (selectedTag === tag.id) setSelectedTag(null);
                    deleteTag.mutate(tag.id);
                  }
                }}
                className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white group-hover/tag:flex transition-opacity shadow-sm z-10"
                title="Delete tag"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <form onSubmit={handleCreateTag} className="ml-0 flex min-w-0 flex-1 items-center gap-2 sm:ml-1 sm:flex-none">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New Tag..."
              className="min-w-0 flex-1 rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface outline-none transition-all focus:border-primary sm:w-28 sm:flex-none sm:focus:w-32"
            />
            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant bg-surface text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : courses?.length === 0 ? (
        <div className="learning-card flex flex-col items-center justify-center py-16 text-center mx-auto w-full max-w-2xl mt-8">
          <div className="mb-6 rounded-full bg-surface-container p-5">
            <Plus className="h-8 w-8 text-on-surface-variant" />
          </div>
          <h2 className="font-display text-2xl font-bold">No courses yet</h2>
          <p className="mt-3 text-on-surface-variant max-w-sm px-4">
            Paste a YouTube playlist URL above to create your first learning journey.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course, i) => {
            const progress = course.video_count > 0
              ? Math.round((Number(course.watched_count) / Number(course.video_count)) * 100)
              : 0;
            const remaining = Number(course.total_duration) - Number(course.watched_duration);
            const isComplete = progress >= 100;

            return (
              <div
                key={course.id}
                className={`learning-card p-0 overflow-hidden flex flex-col group relative animate-slide-up ${isComplete ? 'border-primary' : ''}`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <Link to={`/courses/${course.id}`} className="block h-full flex flex-col">
                  {course.thumbnail_url ? (
                    <div className="aspect-video w-full overflow-hidden border-b border-outline-variant relative bg-surface-container">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isComplete && (
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-primary text-on-primary rounded-md px-2.5 py-1 text-xs font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center border-b border-outline-variant bg-surface-container relative overflow-hidden">
                      <PlayCircle className="h-12 w-12 text-on-surface-variant group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-2 font-display font-semibold text-lg hover:text-primary transition-colors">
                        {course.title}
                      </h3>

                      {/* Tags */}
                      {course.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {course.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 text-xs font-medium rounded-sm bg-surface-container text-on-surface-variant"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-on-surface-variant">
                        <span className="flex items-center gap-1.5">
                          <PlayCircle className="h-4 w-4" />
                          {course.video_count} vids
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          {course.watched_count} done
                        </span>
                        {remaining > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {formatDuration(remaining)} left
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant">
                      <div className="flex items-center justify-between font-display font-semibold mb-2">
                        <span className="text-sm">Progress</span>
                        <div className="flex items-center gap-3">
                          {isComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setCertCourse(course);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-primary text-on-primary rounded-sm hover:-translate-y-0.5 transition-transform"
                            >
                              <Award className="h-4 w-4" />
                              Cert
                            </button>
                          )}
                          <span className="text-sm">{progress}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Actions Top Right */}
                <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      togglePin.mutate(course.id);
                    }}
                    className={`p-1.5 rounded-md transition-colors backdrop-blur-md ${
                      course.is_pinned
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface/80 text-on-surface hover:bg-surface'
                    }`}
                    title={course.is_pinned ? 'Unpin course' : 'Pin course'}
                  >
                    <Pin className={`h-4 w-4 ${course.is_pinned ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (confirm('Delete this course?')) {
                        deleteCourse.mutate(course.id);
                      }
                    }}
                    className="p-1.5 rounded-md bg-surface/80 text-on-surface hover:bg-red-500 hover:text-white transition-colors backdrop-blur-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Tag button Top Left */}
                <div className="absolute left-3 top-3 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setTagModalCourseId(tagModalCourseId === course.id ? null : course.id);
                    }}
                    className="p-1.5 rounded-md bg-surface/80 text-on-surface opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100 backdrop-blur-md"
                  >
                    <Tag className="h-4 w-4" />
                  </button>

                  {/* Tag dropdown */}
                  {tagModalCourseId === course.id && (
                    <div className="absolute left-0 top-10 w-48 bg-surface border border-outline-variant rounded-md shadow-lg p-2 animate-fade-in pointer-events-auto origin-top-left z-30 flex flex-col gap-1">
                      {tags.map((tag) => {
                        const isTagged = course.tags?.some(t => t.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (isTagged) {
                                untagCourse.mutate({ tagId: tag.id, courseId: course.id });
                              } else {
                                tagCourse.mutate({ tagId: tag.id, courseId: course.id });
                              }
                            }}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-sm hover:bg-surface-container transition-colors"
                          >
                            <span className="flex-1 text-left">{tag.name}</span>
                            {isTagged && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                      {tags.length === 0 && (
                        <p className="px-3 py-2 text-xs font-medium text-on-surface-variant">No tags yet.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!certCourse}
        onClose={() => setCertCourse(null)}
        courseId={certCourse?.id}
        courseTitle={certCourse?.title}
        progress={certCourse ? (Number(certCourse.video_count) > 0 ? (Number(certCourse.watched_count) / Number(certCourse.video_count)) * 100 : 0) : 0}
      />
    </div>
  );
}
