-- Remove global seed rows (workspace_id IS NULL) so real users only see their own data.

DELETE FROM video_daily_stats
WHERE video_id NOT IN (SELECT id FROM tracked_videos);

DELETE FROM tracked_videos
WHERE account_id NOT IN (SELECT id FROM tracked_accounts);

DELETE FROM tracked_accounts WHERE workspace_id IS NULL;
DELETE FROM campaigns WHERE workspace_id IS NULL;
DELETE FROM competitors WHERE workspace_id IS NULL;
DELETE FROM trend_videos WHERE workspace_id IS NULL;
