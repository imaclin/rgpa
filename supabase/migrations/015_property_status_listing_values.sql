-- Expand properties.status allowed values to support imported listing statuses.
-- Keep legacy statuses for admin/workflow compatibility.

ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE properties
  ADD CONSTRAINT properties_status_check
  CHECK (
    status IN (
      'draft',
      'completed',
      'in-progress',
      'coming-soon',
      'archived',
      'for-sale',
      'for-rent',
      'sold'
    )
  );
