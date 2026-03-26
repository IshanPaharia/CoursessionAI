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
    const colors = ['#f59e0b', '#f97316', '#f43f5e', '#10b981', '#3b82f6', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    createTag.mutate({ name: newTagName.trim(), color });
    setNewTagName('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 relative pb-20 sm:pb-8">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] animate-blob" />

      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My <span className="text-gradient">Courses</span></h1>
        <p className="mt-1.5 sm:mt-2 text-sm text-gray-400 font-light">
          Paste a YouTube playlist URL to create a new course.
        </p>
      </div>

      {/* Add Course Form */}
      <form onSubmit={handleCreate} className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row animate-slide-up" style={{ animationDelay: '100ms' }}>
        <input
          type="text"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://www.youtube.com/playlist?list=..."
          className="input-field flex-1"
          disabled={createCourse.isPending}
        />
        <button
          type="submit"
          disabled={createCourse.isPending || !playlistUrl.trim()}
          className="btn-primary px-6 sm:px-8 py-3.5"
        >
          {createCourse.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          Add Course
        </button>
      </form>

      {/* Error */}
      {createCourse.isError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 backdrop-blur-sm animate-fade-in">
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
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="input-field !pl-12"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
              !selectedTag
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <div key={tag.id} className="group/tag relative flex items-center">
              <button
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  selectedTag === tag.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                style={selectedTag === tag.id ? { borderColor: tag.color, boxShadow: `0 0 10px ${tag.color}30` } : {}}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
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
                className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500/90 text-[10px] text-white backdrop-blur group-hover/tag:flex hover:bg-red-500 transition-colors"
                title="Delete tag"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <form onSubmit={handleCreateTag} className="flex items-center gap-2 ml-1">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag..."
              className="w-24 sm:w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none transition-all focus:border-amber-500/40 focus:w-32"
            />
            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : courses?.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 sm:py-24 text-center border-dashed border-2 animate-fade-in mx-auto w-full max-w-2xl mt-6 sm:mt-10">
          <div className="mb-5 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(244, 63, 94, 0.1))' }}>
            <Plus className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">No courses yet</h2>
          <p className="mt-2 text-sm text-gray-400 font-light max-w-sm px-4">
            Paste a YouTube playlist URL above to create your first stunning course experience.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course, i) => {
            const progress = course.video_count > 0
              ? Math.round((Number(course.watched_count) / Number(course.video_count)) * 100)
              : 0;
            const remaining = Number(course.total_duration) - Number(course.watched_duration);
            const isComplete = progress >= 100;

            return (
              <div
                key={course.id}
                className="glass-card group relative overflow-visible animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <Link to={`/courses/${course.id}`} className="block h-full">
                  {course.thumbnail_url ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-2xl relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 opacity-60" />
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {isComplete && (
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-t-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(244, 63, 94, 0.1))' }}>
                      <PlayCircle className="h-14 w-14 text-amber-400/40 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-2 font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors tracking-tight">
                        {course.title}
                      </h3>

                      {/* Tags */}
                      {course.tags?.length > 0 && (
                        <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5">
                          {course.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
                              style={{
                                backgroundColor: tag.color + '20',
                                color: tag.color,
                                border: `1px solid ${tag.color}35`,
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                          <PlayCircle className="h-3.5 w-3.5 text-blue-400" />
                          {course.video_count} videos
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                          {course.watched_count} done
                        </span>
                        {remaining > 0 && (
                          <span className="flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            {formatDuration(remaining)} left
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px]">Progress</span>
                        <div className="flex items-center gap-3">
                          {isComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setCertCourse(course);
                              }}
                              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-lg transition-all hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                              }}
                            >
                              <Award className="h-3 w-3" />
                              Certificate
                            </button>
                          )}
                          <span className="text-amber-400">{progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Actions Top Right */}
                <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      togglePin.mutate(course.id);
                    }}
                    className={`rounded-xl p-2 backdrop-blur-md shadow-lg transition-all ${
                      course.is_pinned
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-black/60 text-gray-300 hover:bg-amber-500/80 hover:text-white'
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
                    className="rounded-xl bg-black/60 p-2 text-gray-300 backdrop-blur-md shadow-lg transition-all hover:bg-red-500/90 hover:text-white"
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
                    className="rounded-xl bg-black/60 p-2 text-gray-300 backdrop-blur-md shadow-lg opacity-0 transition-all hover:bg-blue-500/80 hover:text-white group-hover:opacity-100"
                  >
                    <Tag className="h-4 w-4" />
                  </button>

                  {/* Tag dropdown */}
                  {tagModalCourseId === course.id && (
                    <div className="absolute left-0 top-10 w-48 rounded-2xl border border-white/10 p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl animate-fade-in pointer-events-auto origin-top-left z-30" style={{ backgroundColor: 'rgba(13, 13, 20, 0.95)' }}>
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
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors"
                          >
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span className="flex-1 text-left">{tag.name}</span>
                            {isTagged && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                          </button>
                        );
                      })}
                      {tags.length === 0 && (
                        <p className="px-3 py-2 text-xs text-gray-500 italic">No tags created yet.</p>
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
