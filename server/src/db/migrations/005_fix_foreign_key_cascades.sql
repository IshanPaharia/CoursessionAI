-- Fix foreign key cascades for user deletion
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_user_id_fkey;
ALTER TABLE courses ADD CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_user_id_fkey;
ALTER TABLE progress ADD CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
