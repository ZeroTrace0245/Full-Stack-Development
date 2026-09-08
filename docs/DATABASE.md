# Database Notes

NovaSync uses MongoDB through Mongoose. Models live under `backend/models/`.

## Principles
- Keep schemas focused on domain data.
- Add indexes for frequently queried fields.
- Validate required values at the application boundary.
- Avoid storing derived values when they can be safely calculated.
- Back up production data independently from source control.
