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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 relative pb-20 sm:pb-8 text-black">

      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-black tracking-tight uppercase">My <span className="text-[#ff8c00]">Courses</span></h1>
        <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-800 font-medium">
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
          className="input-field flex-1 text-lg"
          disabled={createCourse.isPending}
        />
        <button
          type="submit"
          disabled={createCourse.isPending || !playlistUrl.trim()}
          className="btn-primary"
        >
          {createCourse.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Plus className="h-6 w-6 stroke-[3px]" />
          )}
          ADD COURSE
        </button>
      </form>

      {/* Error */}
      {createCourse.isError && (
        <div className="mb-6 brutal-card bg-[#ff99e6] px-5 py-4 text-sm font-bold animate-fade-in">
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
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 animate-slide-up bg-white brutal-card p-4 sm:p-5" style={{ animationDelay: '300ms' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 stroke-[3px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH COURSES..."
            className="input-field !pl-12 font-bold uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-none px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-transform border-[2px] border-black ${
              !selectedTag
                ? 'bg-[#ff8c00] text-black brutal-shadow-sm translate-x-[-2px] translate-y-[-2px]'
                : 'bg-white text-black hover:bg-black/5 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <div key={tag.id} className="group/tag relative flex items-center">
              <button
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`flex items-center gap-2 rounded-none px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-transform border-[2px] border-black ${
                  selectedTag === tag.id
                    ? 'bg-[#ff99e6] text-black brutal-shadow-sm translate-x-[-2px] translate-y-[-2px]'
                    : 'bg-white text-black hover:bg-black/5 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full border border-black" style={{ backgroundColor: tag.color }} />
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
                className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center bg-black text-[10px] text-white group-hover/tag:flex hover:bg-red-500 transition-colors border-2 border-white shadow-md z-10"
                title="Delete tag"
              >
                <X className="h-3 w-3 stroke-[3px]" />
              </button>
            </div>
          ))}
          <form onSubmit={handleCreateTag} className="flex items-center gap-2 ml-1">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="NEW TAG..."
              className="w-24 sm:w-28 rounded-none border-[2px] border-black bg-white px-3 py-2 text-xs font-bold uppercase text-black outline-none transition-all focus:bg-[#ff99e6] focus:w-32 shadow-[2px_2px_0px_0px_#000000]"
            />
            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-none border-[2px] border-black bg-[#ff8c00] text-black hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
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
        <div className="brutal-card flex flex-col items-center justify-center py-16 sm:py-24 text-center mx-auto w-full max-w-2xl mt-6 sm:mt-10 bg-white">
          <div className="mb-6 border-[3px] border-black bg-[#ff8c00] p-5 brutal-shadow">
            <Plus className="h-10 w-10 text-black stroke-[3px]" />
          </div>
          <h2 className="font-display text-3xl font-extrabold uppercase line-clamp-2">No courses yet</h2>
          <p className="mt-3 text-base text-gray-800 font-medium max-w-sm px-4">
            Paste a YouTube playlist URL above to create your first stunning course experience.
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
                className={`brutal-card group relative animate-slide-up bg-white ${isComplete ? 'border-[#ff8c00]' : ''}`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <Link to={`/courses/${course.id}`} className="block h-full flex flex-col">
                  {course.thumbnail_url ? (
                    <div className="aspect-video w-full overflow-hidden border-b-[3px] border-black relative">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isComplete && (
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#ff8c00] border-[2px] border-black shadow-[2px_2px_0px_#000] px-2.5 py-1 text-[10px] font-bold text-black uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4 stroke-[3px]" />
                          COMPLETE
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center border-b-[3px] border-black bg-[#ff99e6] relative overflow-hidden">
                      <PlayCircle className="h-16 w-16 text-black stroke-[3px] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="line-clamp-2 font-display font-bold text-xl text-black uppercase tracking-tight group-hover:underline decoration-[3px] underline-offset-4">
                        {course.title}
                      </h3>

                      {/* Tags */}
                      {course.tags?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {course.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_#000000]"
                              style={{ color: 'black' }}
                            >
                              <span className="inline-block h-2 w-2 rounded-full border border-black mr-1.5" style={{ backgroundColor: tag.color }} />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-black uppercase">
                        <span className="flex items-center gap-1.5 border-[2px] border-black bg-[#ff99e6] px-2.5 py-1 shadow-[2px_2px_0px_0px_#000000]">
                          <PlayCircle className="h-4 w-4 stroke-[3px]" />
                          {course.video_count} vids
                        </span>
                        <span className="flex items-center gap-1.5 border-[2px] border-black bg-[#facc15] px-2.5 py-1 shadow-[2px_2px_0px_0px_#000000]">
                          <CheckCircle2 className="h-4 w-4 stroke-[3px]" />
                          {course.watched_count} done
                        </span>
                        {remaining > 0 && (
                          <span className="flex items-center gap-1.5 bg-white border-[2px] border-black px-2.5 py-1 shadow-[2px_2px_0px_0px_#000000] text-gray-700">
                            <Clock className="h-4 w-4 stroke-[3px]" />
                            {formatDuration(remaining)} left
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-[3px] border-black">
                      <div className="flex items-center justify-between font-display font-bold mb-2 uppercase">
                        <span className="text-black text-sm">Progress</span>
                        <div className="flex items-center gap-3">
                          {isComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setCertCourse(course);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-black bg-[#ff8c00] border-[2px] border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                            >
                              <Award className="h-4 w-4 stroke-[3px]" />
                              CERT
                            </button>
                          )}
                          <span className="text-xl">{progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
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
                    className={`p-2 border-[2px] border-black brutal-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all ${
                      course.is_pinned
                        ? 'bg-[#ff8c00] text-black'
                        : 'bg-white text-black hover:bg-[#facc15]'
                    }`}
                    title={course.is_pinned ? 'Unpin course' : 'Pin course'}
                  >
                    <Pin className={`h-5 w-5 stroke-[2.5px] ${course.is_pinned ? 'fill-black' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (confirm('Delete this course?')) {
                        deleteCourse.mutate(course.id);
                      }
                    }}
                    className="p-2 border-[2px] border-black bg-white text-black brutal-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-5 w-5 stroke-[2.5px]" />
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
                    className="p-2 border-[2px] border-black bg-white text-black brutal-shadow-sm opacity-0 transition-all hover:bg-[#ff99e6] group-hover:opacity-100 hover:-translate-y-0.5 hover:-translate-x-0.5"
                  >
                    <Tag className="h-5 w-5 stroke-[2.5px]" />
                  </button>

                  {/* Tag dropdown */}
                  {tagModalCourseId === course.id && (
                    <div className="absolute left-0 top-12 w-48 brutal-card bg-white p-2 animate-fade-in pointer-events-auto origin-top-left z-30 flex flex-col gap-1">
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
                            className="flex w-full items-center gap-3 border-[2px] border-transparent hover:border-black px-3 py-2 text-xs font-bold uppercase tracking-wide text-black bg-gray-50 hover:bg-[#facc15] transition-all"
                          >
                            <span className="h-3 w-3 rounded-full border border-black" style={{ backgroundColor: tag.color }} />
                            <span className="flex-1 text-left">{tag.name}</span>
                            {isTagged && <CheckCircle2 className="h-4 w-4 text-black stroke-[3px]" />}
                          </button>
                        );
                      })}
                      {tags.length === 0 && (
                        <p className="px-3 py-2 text-xs font-bold uppercase text-gray-500">NO TAGS YET.</p>
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
